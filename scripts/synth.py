#!/usr/bin/env python3
"""
synth.py — Ava reads the film. Audio, word timings, captions, visemes.

Reads data/narration.json and writes, per scene:

    assets/sceneNN.wav          the narration, padded to the scene's slot
    data/words-sceneNN.json     [{"t": start, "d": duration, "w": word}, ...]
    data/cues-sceneNN.json      [[start, end, "phrase"], ...]  — paste into the
                                scene's CUES once the timing is final
    data/visemes-sceneNN.json   [{"t": seconds, "id": 0-21}, ...]  (Nora scenes)

plus assets/film.wav (every scene laid end to end on the master clock) and
data/pacing.md, a table of speech length against each scene's slot.

Two engines produce the same voice:

  --engine edge   (default) Microsoft's Edge read-aloud endpoint, via the
                  edge-tts package. This is the very same Ava the Nora game
                  uses in Edge — "Microsoft Ava Online (Natural)". No key.
                  Returns audio and word boundaries but no viseme events,
                  so mouth shapes are approximated from word timing.
                  Unofficial endpoint: fine for auditioning and drafts.

  --engine azure  Azure Speech, en-US-AvaNeural. Needs AZURE_SPEECH_KEY and
                  AZURE_SPEECH_REGION. Same voice, plus real viseme events
                  for lip sync. Use this for the cut that ships.

Chunks. Speech is synthesised one chunk at a time and each chunk is placed
at its `at` time inside the scene, so beats the scene has already built
around (the silent hold in Scene 3, the bubble in Scene 1) stay put. If a
chunk runs into the next one's start, the next is pushed later and the
report says so. Sentences that should flow as one breath belong in one
chunk; splitting into many chunks risks the tonal drift between segments
that the storyboard warns about.

    pip install -r scripts/requirements.txt
    python scripts/synth.py                 # every scene, edge engine
    python scripts/synth.py --scene 1       # one scene
    python scripts/synth.py --engine azure  # real visemes
    python scripts/synth.py --preview       # also mux voice into samples/*.mp4

Behind a corporate TLS proxy Python's own certificate bundle will not
trust the inspection certificate. The `truststore` package makes Python
use the Windows certificate store instead; it is imported if present.
"""

import argparse
import asyncio
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import wave

try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(ROOT, "assets")
DATA = os.path.join(ROOT, "data")
SAMPLES = os.path.join(ROOT, "samples")
BUILD = os.path.join(ROOT, "build")
NARRATION = os.path.join(DATA, "narration.json")

SR = 48000          # render.py muxes whatever it finds; 48k mono is plenty
MIN_GAP = 0.052     # fastest a mouth can move, seconds
WORD_GAP_CLOSE = 0.12   # a silence longer than this closes the mouth

sys.path.insert(0, HERE)
from fake_visemes import phrase_visemes  # noqa: E402  letter -> viseme id


# ---------------------------------------------------------------- ffmpeg
def find_ffmpeg():
    """ffmpeg on PATH, or where winget puts it before the PATH refreshes."""
    for name in ("ffmpeg",):
        p = shutil.which(name)
        if p:
            return p
    links = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Links", "ffmpeg.exe")
    if os.path.exists(links):
        return links
    pk = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages")
    if os.path.isdir(pk):
        for d in os.listdir(pk):
            if d.startswith("Gyan.FFmpeg"):
                for sub in os.listdir(os.path.join(pk, d)):
                    cand = os.path.join(pk, d, sub, "bin", "ffmpeg.exe")
                    if os.path.exists(cand):
                        return cand
    return None


FFMPEG = find_ffmpeg()


def to_pcm(path):
    """Decode any audio file to mono 16-bit PCM at SR. Returns raw bytes."""
    if not FFMPEG:
        sys.exit("ffmpeg not found — `winget install Gyan.FFmpeg`, then open a new terminal")
    r = subprocess.run([FFMPEG, "-v", "error", "-i", path, "-f", "s16le",
                        "-ac", "1", "-ar", str(SR), "-"],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    return r.stdout


def silence(seconds):
    return b"\x00\x00" * max(0, int(round(seconds * SR)))


def write_wav(path, pcm):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)


def pcm_seconds(pcm):
    return len(pcm) / 2 / SR


# ---------------------------------------------------------------- delivery
# Per-line tone, the way the game gives each of Nora's lines a mood instead
# of one flat setting. A tone is a pitch and a speed offset from the base
# rate in narration.json. A chunk can name its tone; otherwise it is read
# off the text. Each chunk also gets a small deterministic wobble (seeded by
# its position) so two lines with the same tone never sound identical.
TONES = {
    #            pitch Hz   rate %    what it is for
    "warm":     {"pitch":  0, "rate":  0},   # the default: friendly narrator
    "greeting": {"pitch": +6, "rate": -2},   # hello, nice to meet you
    "question": {"pitch": +9, "rate": -2},   # anything with a ? lifts
    "bright":   {"pitch": +8, "rate": +4},   # exclamations, good news
    "punch":    {"pitch": +3, "rate": -8},   # short declaratives, one idea each
    "list":     {"pitch": +3, "rate": -3},   # items in a run, lightly lifted
    "serious":  {"pitch": -4, "rate": -7},   # caveats, governance, cost
    "resolve":  {"pitch": -2, "rate": -6},   # the thesis line, said plainly
    "close":    {"pitch": +4, "rate": -5},   # the sign-off, smile in the voice
}
WOBBLE_PITCH = 2.0   # ± Hz
WOBBLE_RATE = 2.0    # ± %
PRE_BEAT = {"question": 0.10, "punch": 0.15, "resolve": 0.30, "close": 0.20}

SERIOUS_WORDS = re.compile(r"\b(security|governance|carefully|evaluate|difficult|harder|"
                           r"waiting|lost|wondering|hard)\b", re.I)


def pick_tone(text, hint=None):
    """Explicit tone wins; otherwise read it off the line."""
    if hint:
        return hint
    t = text.strip()
    n = len(re.findall(r"[A-Za-z0-9']+", t))
    if t.endswith("!"):
        return "bright"
    if "?" in t:
        return "question"
    if SERIOUS_WORDS.search(t) and n > 6:
        return "serious"
    if n <= 4:
        return "punch"
    if n <= 8 and (t.startswith(("It might", "That might", "Maybe", "Better", "More "))):
        return "list"
    return "warm"


def wobble(seed_text, k):
    """Deterministic ±jitter so renders are reproducible."""
    import hashlib
    h = hashlib.md5(f"{seed_text}#{k}".encode()).digest()
    a = (int.from_bytes(h[:2], "big") / 0xFFFF) * 2 - 1
    b = (int.from_bytes(h[2:4], "big") / 0xFFFF) * 2 - 1
    return a * WOBBLE_PITCH, b * WOBBLE_RATE


def delivery_for(text, base_rate, sid, k, hint=None):
    """-> (tone, rate_str, pitch_str) for one chunk."""
    tone = pick_tone(text, hint)
    tn = TONES.get(tone, TONES["warm"])
    wp, wr = wobble(sid, k)
    rate = int(round(float(base_rate.rstrip("%")) + tn["rate"] + wr))
    pitch = int(round(tn["pitch"] + wp))
    return tone, f"{rate:+d}%", f"{pitch:+d}Hz"


# ---------------------------------------------------------------- engines
async def edge_chunk(text, voice, rate, pitch="+0Hz"):
    """-> (pcm, words[{t,d,w}], visemes or None). Times relative to chunk start."""
    import edge_tts
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        tmp = f.name
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
    try:
        pcm = to_pcm(tmp)
    finally:
        os.unlink(tmp)
    return pcm, words, None


def azure_chunk(text, voice, rate, pitch="+0Hz"):
    """Same contract as edge_chunk, with Azure's real viseme events."""
    try:
        import azure.cognitiveservices.speech as speechsdk
    except ImportError:
        sys.exit("pip install azure-cognitiveservices-speech")
    key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SPEECH_REGION")
    if not key or not region:
        sys.exit("set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION for --engine azure")

    cfg = speechsdk.SpeechConfig(subscription=key, region=region)
    cfg.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm)
    synth = speechsdk.SpeechSynthesizer(speech_config=cfg, audio_config=None)

    words, visemes = [], []
    synth.viseme_received.connect(lambda e: visemes.append(
        {"t": e.audio_offset / 1e7, "id": int(e.viseme_id)}))
    synth.synthesis_word_boundary.connect(lambda e: words.append(
        {"t": e.audio_offset / 1e7, "d": e.duration.total_seconds(), "w": e.text}))

    esc = (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    ssml = (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
            f'xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">'
            f'<voice name="{voice}"><mstts:viseme type="redlips_front"/>'
            f'<prosody rate="{rate}" pitch="{pitch}">{esc}</prosody></voice></speak>')
    result = synth.speak_ssml_async(ssml).get()
    if result.reason == speechsdk.ResultReason.Canceled:
        d = result.cancellation_details
        sys.exit(f"azure canceled: {d.reason} — {d.error_details}")

    # result.audio_data is a RIFF file at the format requested above
    pcm = result.audio_data[44:] if result.audio_data[:4] == b"RIFF" else result.audio_data
    # word boundaries may include punctuation events; keep spoken words only
    words = [w for w in words if re.search(r"[A-Za-z0-9]", w["w"])]
    return pcm, words, visemes


# ---------------------------------------------------------------- alignment
def letters(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def align_phrases(phrases, words):
    """Split the chunk's words across its phrases by matching letter runs.
    Returns [[start, end, phrase], ...] with times relative to chunk."""
    cues, i = [], 0
    for ph in phrases:
        target = len(letters(ph))
        got, j = 0, i
        while j < len(words) and got < target:
            got += len(letters(words[j]["w"]))
            j += 1
        if j == i:                      # nothing matched; give it a zero span
            t = words[i]["t"] if i < len(words) else 0.0
            cues.append([t, t, ph])
            continue
        start = words[i]["t"]
        end = words[j - 1]["t"] + words[j - 1]["d"]
        cues.append([start, end, ph])
        i = j
    return cues


def visemes_from_words(words):
    """Approximate a viseme track from word boundaries: the letter-to-viseme
    table spread across each word's actual span, mouth closed in gaps."""
    ev = []
    for k, w in enumerate(words):
        ids = [v for v in phrase_visemes(w["w"]) if v != 0]
        if not ids:
            continue
        step = max(MIN_GAP, w["d"] / len(ids))
        t = w["t"]
        for v in ids:
            if t > w["t"] + w["d"]:
                break
            ev.append({"t": t, "id": v})
            t += step
        end = w["t"] + w["d"]
        nxt = words[k + 1]["t"] if k + 1 < len(words) else None
        if nxt is None or nxt - end > WORD_GAP_CLOSE:
            ev.append({"t": end, "id": 0})
    return ev


def thin(events):
    events.sort(key=lambda e: e["t"])
    out = []
    for e in events:
        if out and e["t"] - out[-1]["t"] < MIN_GAP * 0.8:
            continue
        out.append({"t": round(e["t"], 3), "id": e["id"]})
    return out


# ---------------------------------------------------------------- scene
NATURAL_TAIL = 1.0      # room after the last word when no slot is authored
DEFAULT_PAUSE = 0.45    # breath between chunks that have no `at`


def synth_scene(sc, engine, voice, rate):
    slot = float(sc["slot"]) if sc.get("slot") is not None else None
    pcm = b""
    words_all, cues_all, vis_all, notes = [], [], [], []
    cursor = 0.0
    speech_end = 0.0
    total_words = 0
    speech_start = None

    delivery = []
    for k, ch in enumerate(sc["chunks"]):
        text = " ".join(ch["phrases"])
        tone, c_rate, c_pitch = delivery_for(text, rate, sc["id"], k, ch.get("tone"))
        if engine == "edge":
            cpcm, words, vis = asyncio.run(edge_chunk(text, voice, c_rate, c_pitch))
        else:
            cpcm, words, vis = azure_chunk(text, voice, c_rate, c_pitch)

        if ch.get("at") is not None:
            at = float(ch["at"])
            if at < cursor - 1e-3:
                notes.append(f"chunk at {at:.2f}s pushed to {cursor:.2f}s (previous chunk ran long)")
                at = cursor
        else:
            # a breath, plus a beat before lines whose tone asks for one
            at = max(cursor, speech_end + float(ch.get("pause", DEFAULT_PAUSE)) + PRE_BEAT.get(tone, 0.0))
        delivery.append({"at": round(at, 2), "tone": tone, "rate": c_rate, "pitch": c_pitch,
                         "text": text})
        pcm += silence(at - pcm_seconds(pcm)) + cpcm
        cursor = pcm_seconds(pcm)

        # trim trailing silence the engine appends after the last word,
        # so the measured speech end is where the voice actually stops
        speech_end = at + (words[-1]["t"] + words[-1]["d"] if words else pcm_seconds(cpcm))
        if speech_start is None and words:
            speech_start = at + words[0]["t"]

        for w in words:
            words_all.append({"t": round(at + w["t"], 3), "d": round(w["d"], 3), "w": w["w"]})
        for s, e, ph in align_phrases(ch["phrases"], words):
            cues_all.append([round(at + s, 2), round(at + e, 2), ph])
        if sc.get("nora"):
            src = vis if vis is not None else visemes_from_words(words)
            vis_all += [{"t": at + v["t"], "id": v["id"]} for v in src]
        total_words += len(words)
        # keep 150ms of the word's natural decay, drop the engine's padding
        cursor = speech_end + 0.15
        pcm = pcm[: int(cursor * SR) * 2] if pcm_seconds(pcm) > cursor else pcm

    speech_len = speech_end
    natural = slot is None
    if natural:
        slot = round(speech_len + NATURAL_TAIL, 1)
        pcm += silence(slot - pcm_seconds(pcm))
    else:
        over = cursor - slot
        if over > 0:
            notes.append(f"speech runs {over:.2f}s past the {slot:.1f}s slot — trimmed in the film WAV")
            pcm = pcm[: int(slot * SR) * 2]
        else:
            pcm += silence(slot - pcm_seconds(pcm))

    n = sc["n"]
    sid = sc["id"]
    write_wav(os.path.join(ASSETS, f"{sid}.wav"), pcm)
    with open(os.path.join(DATA, f"words-{sid}.json"), "w") as f:
        json.dump(words_all, f, indent=0)
    with open(os.path.join(DATA, f"cues-{sid}.json"), "w") as f:
        json.dump(cues_all, f, indent=0)
    if sc.get("nora"):
        track = thin([{"t": 0.0, "id": 0}] + vis_all)
        with open(os.path.join(DATA, f"visemes-{sid}.json"), "w") as f:
            json.dump(track, f, indent=0)

    spoken = speech_len - (speech_start or 0)
    wpm = total_words / spoken * 60 if spoken > 0 else 0
    return {
        "n": n, "id": sid, "title": sc["title"], "slot": slot, "natural": natural,
        "words": total_words, "start": speech_start or 0, "end": speech_len,
        "margin": slot - speech_len, "wpm": wpm, "notes": notes,
        "pcm": pcm, "optional": sc.get("optional", False), "delivery": delivery,
        "card": sc.get("card"),
    }


# ---------------------------------------------------------------- outputs
def write_report(rows, engine, voice, rate):
    lines = [
        "# Pacing",
        "",
        f"Generated by `scripts/synth.py --engine {engine}` with `{voice}` at rate `{rate}`.",
        "Speech end is where Ava stops talking inside the scene; margin is what the",
        "scene has left for its hold and transition. Negative margin means the",
        "narration does not fit the slot: shorten the line or lengthen the scene.",
        "",
        "| Scene | Title | Slot | Speech ends | Margin | Words | wpm |",
        "|---:|---|---:|---:|---:|---:|---:|",
    ]
    for r in rows:
        flag = " ⚠" if r["margin"] < 0 else ""
        opt = " *(optional)*" if r["optional"] else ""
        slot = f"{r['slot']:.0f}s" + (" *(natural)*" if r.get("natural") else "")
        margin = "—" if r.get("natural") else f"{r['margin']:+.1f}s{flag}"
        lines.append(f"| {r['n'] if r['n'] < 70 else '7A'} | {r['title']}{opt} | {slot} | "
                     f"{r['end']:.1f}s | {margin} | {r['words']} | {r['wpm']:.0f} |")
    if any(r.get("natural") for r in rows):
        lines += ["", "*natural*: no slot authored yet, so the section is as long as Ava's read "
                  f"plus {NATURAL_TAIL:.0f}s. Use these lengths when building the scenes."]
    notes = [(r, n) for r in rows for n in r["notes"]]
    if notes:
        lines += ["", "## Notes", ""]
        for r, n in notes:
            lines.append(f"- Scene {r['n'] if r['n'] < 70 else '7A'}: {n}")
    film = sum(r["slot"] for r in rows if not r["optional"])
    lines += ["", f"Film length without optional scenes: {int(film // 60)}:{int(film % 60):02d}."]
    path = os.path.join(DATA, "pacing.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    return path


def write_delivery(rows, base_rate):
    """One table of every line: where it starts, its tone, pitch and rate."""
    lines = [
        "# Delivery",
        "",
        f"Base rate `{base_rate}`. Each line's tone sets a pitch and speed offset,",
        "plus a small deterministic wobble so identical tones still differ.",
        "Set `tone` on a chunk in narration.json to override what was read off the text.",
        "",
        "| Tone | Pitch | Rate | Used for |",
        "|---|---:|---:|---|",
        "| warm | 0 | 0 | default narrator |",
        "| greeting | +6 Hz | -2% | hello, nice to meet you |",
        "| question | +9 Hz | -2% | any line with a ? |",
        "| bright | +8 Hz | +4% | exclamations, good news |",
        "| punch | +3 Hz | -8% | short declaratives, a beat before |",
        "| list | +3 Hz | -3% | items in a run |",
        "| serious | -4 Hz | -7% | caveats, governance, cost |",
        "| resolve | -2 Hz | -6% | the thesis, said plainly, a beat before |",
        "| close | +4 Hz | -5% | the sign-off |",
        "",
    ]
    for r in rows:
        lines += [f"## {r['id']} · {r['title']}", ""]
        if r.get("card"):
            lines += [f"*{r['card']}*", ""]
        lines += ["| At | Tone | Pitch | Rate | Line |", "|---:|---|---:|---:|---|"]
        for d in r["delivery"]:
            txt = d["text"] if len(d["text"]) <= 90 else d["text"][:87] + "…"
            lines.append(f"| {d['at']:.1f}s | {d['tone']} | {d['pitch']} | {d['rate']} | {txt} |")
        lines.append("")
    path = os.path.join(DATA, "delivery.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    return path


def write_film(rows):
    pcm = b"".join(r["pcm"] for r in rows if not r["optional"])
    path = os.path.join(ASSETS, "film.wav")
    write_wav(path, pcm)
    return path, pcm_seconds(pcm)


def mux_previews(rows):
    """Drop the voice onto the silent sample renders so the voice can be
    judged against the picture without re-rendering frames."""
    os.makedirs(BUILD, exist_ok=True)
    made = []
    for r in rows:
        mp4 = os.path.join(SAMPLES, f"{r['id']}-draft-silent.mp4")
        wav = os.path.join(ASSETS, f"{r['id']}.wav")
        if not os.path.exists(mp4):
            continue
        out = os.path.join(BUILD, f"{r['id']}-draft-voiced.mp4")
        subprocess.run([FFMPEG, "-y", "-v", "error", "-i", mp4, "-i", wav,
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                        "-shortest", "-movflags", "+faststart", out], check=True)
        made.append(out)
    if len(made) > 1:
        lst = os.path.join(BUILD, "voiced.txt")
        with open(lst, "w") as f:
            for m in made:
                f.write(f"file '{os.path.basename(m)}'\n")
        out = os.path.join(BUILD, "film-draft-voiced.mp4")
        subprocess.run([FFMPEG, "-y", "-v", "error", "-f", "concat", "-safe", "0",
                        "-i", lst, "-c", "copy", "-movflags", "+faststart", out], check=True)
        os.unlink(lst)
        made.append(out)
    return made


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--engine", choices=["edge", "azure"], default="edge")
    ap.add_argument("--scene", type=int, action="append",
                    help="scene number; repeatable. 71 is the optional 7A")
    ap.add_argument("--voice", default=None, help="override the voice in narration.json")
    ap.add_argument("--rate", default=None, help="override the rate, e.g. -6%%")
    ap.add_argument("--include-optional", action="store_true")
    ap.add_argument("--preview", action="store_true",
                    help="mux the voice onto samples/*-draft-silent.mp4 into build/")
    a = ap.parse_args()

    with open(NARRATION, encoding="utf-8") as f:
        nar = json.load(f)
    voice = a.voice or os.environ.get("NORA_VOICE") or nar["voice"]
    rate = a.rate or nar["rate"]

    scenes = nar["scenes"]
    if a.scene:
        scenes = [s for s in scenes if s["n"] in a.scene]
    elif not a.include_optional:
        scenes = [s for s in scenes if not s.get("optional")]
    if not scenes:
        sys.exit("no matching scenes")

    os.makedirs(ASSETS, exist_ok=True)
    print(f"engine {a.engine}   voice {voice}   rate {rate}")
    rows = []
    for sc in scenes:
        r = synth_scene(sc, a.engine, voice, rate)
        rows.append(r)
        flag = "  <-- OVER" if r["margin"] < 0 else ""
        fit = "natural      " if r.get("natural") else f"margin {r['margin']:+5.1f}s"
        print(f"  {r['id']:>8}  {r['end']:5.1f}s of {r['slot']:5.1f}s  "
              f"{fit}  {r['words']:3d} words  {r['wpm']:3.0f} wpm{flag}")
        for n in r["notes"]:
            print(f"           note: {n}")

    if not a.scene:
        path, secs = write_film(rows)
        print(f"film   {path}  ({int(secs // 60)}:{int(secs % 60):02d})")
        print(f"pacing {write_report(rows, a.engine, voice, rate)}")
        print(f"delivery {write_delivery(rows, rate)}")
    if a.preview:
        for p in mux_previews(rows):
            print(f"voiced {p}")
    if a.engine == "edge":
        print("\nedge engine: visemes are approximated from word timing. "
              "Run with --engine azure before the final render.")


if __name__ == "__main__":
    main()
