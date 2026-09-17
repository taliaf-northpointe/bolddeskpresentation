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


# ---------------------------------------------------------------- engines
async def edge_chunk(text, voice, rate):
    """-> (pcm, words[{t,d,w}], visemes or None). Times relative to chunk start."""
    import edge_tts
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
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


def azure_chunk(text, voice, rate):
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
            f'<prosody rate="{rate}">{esc}</prosody></voice></speak>')
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
def synth_scene(sc, engine, voice, rate):
    slot = float(sc["slot"])
    pcm = b""
    words_all, cues_all, vis_all, notes = [], [], [], []
    cursor = 0.0
    total_words = 0
    speech_start = None

    for ch in sc["chunks"]:
        text = " ".join(ch["phrases"])
        if engine == "edge":
            cpcm, words, vis = asyncio.run(edge_chunk(text, voice, rate))
        else:
            cpcm, words, vis = azure_chunk(text, voice, rate)

        at = float(ch["at"])
        if at < cursor - 1e-3:
            notes.append(f"chunk at {at:.2f}s pushed to {cursor:.2f}s (previous chunk ran long)")
            at = cursor
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

    speech_len = cursor
    over = speech_len - slot
    if over > 0:
        notes.append(f"speech runs {over:.2f}s past the {slot:.1f}s slot — trimmed in the film WAV")
        pcm = pcm[: int(slot * SR) * 2]
    else:
        pcm += silence(slot - pcm_seconds(pcm))

    n = sc["n"]
    tag = sc["id"].replace("scene", "")
    write_wav(os.path.join(ASSETS, f"{sc['id']}.wav"), pcm)
    with open(os.path.join(DATA, f"words-scene{tag}.json"), "w") as f:
        json.dump(words_all, f, indent=0)
    with open(os.path.join(DATA, f"cues-scene{tag}.json"), "w") as f:
        json.dump(cues_all, f, indent=0)
    if sc.get("nora"):
        track = thin([{"t": 0.0, "id": 0}] + vis_all)
        with open(os.path.join(DATA, f"visemes-scene{tag}.json"), "w") as f:
            json.dump(track, f, indent=0)

    spoken = speech_len - (speech_start or 0)
    wpm = total_words / spoken * 60 if spoken > 0 else 0
    return {
        "n": n, "id": sc["id"], "title": sc["title"], "slot": slot,
        "words": total_words, "start": speech_start or 0, "end": speech_len,
        "margin": slot - speech_len, "wpm": wpm, "notes": notes,
        "pcm": pcm, "optional": sc.get("optional", False),
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
        lines.append(f"| {r['n'] if r['n'] < 70 else '7A'} | {r['title']}{opt} | {r['slot']:.0f}s | "
                     f"{r['end']:.1f}s | {r['margin']:+.1f}s{flag} | {r['words']} | {r['wpm']:.0f} |")
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
        print(f"  scene {r['n']:>2}  {r['end']:5.1f}s of {r['slot']:4.1f}s  "
              f"margin {r['margin']:+5.1f}s  {r['words']:3d} words  {r['wpm']:3.0f} wpm{flag}")
        for n in r["notes"]:
            print(f"           note: {n}")

    if not a.scene:
        path, secs = write_film(rows)
        print(f"film   {path}  ({int(secs // 60)}:{int(secs % 60):02d})")
        print(f"pacing {write_report(rows, a.engine, voice, rate)}")
    if a.preview:
        for p in mux_previews(rows):
            print(f"voiced {p}")
    if a.engine == "edge":
        print("\nedge engine: visemes are approximated from word timing. "
              "Run with --engine azure before the final render.")


if __name__ == "__main__":
    main()
