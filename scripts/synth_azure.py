#!/usr/bin/env python3
"""
synth_azure.py — generate Scene 1's audio with Ava and capture her visemes.

Produces two files:
    assets/scene01.wav    the narration
    data/visemes.json     [{"t": seconds, "id": 0-21}, ...]

Both come out of a single synthesis pass, so the mouth data and the audio
can never drift apart.

Setup:
    pip install azure-cognitiveservices-speech
    export AZURE_SPEECH_KEY=...
    export AZURE_SPEECH_REGION=eastus
    python3 scripts/synth_azure.py

Voice notes
-----------
en-US-AvaNeural is the standard neural voice. There is also an HD variant,
en-US-Ava:DragonHDLatestNeural, which supports styles and paralinguistic
tags and adapts delivery to the meaning of the line. Generate this scene
both ways and pick by ear — the HD model is usually the better narrator,
but it is worth hearing rather than assuming.

This is NOT the same Ava as the browser's Edge speech voice. That one is
local to Edge, plays straight to the speakers, and gives you no file and
no timing data. For video you need this one.

The <break> tags and the prosody rate below are what hold the scene to its
0:00-0:20 slot. If you retime the scene, change them here and change CUES
in index.html to match.
"""

import json
import os
import sys

try:
    import azure.cognitiveservices.speech as speechsdk
except ImportError:
    sys.exit("pip install azure-cognitiveservices-speech")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WAV = os.path.join(ROOT, "assets", "scene01.wav")
JSON_OUT = os.path.join(ROOT, "data", "visemes.json")

VOICE = os.environ.get("NORA_VOICE", "en-US-AvaNeural")

SSML = f"""
<speak version="1.0"
       xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts"
       xml:lang="en-US">
  <voice name="{VOICE}">
    <mstts:viseme type="redlips_front"/>
    <prosody rate="-4%">
      <break time="600ms"/>
      Hi, I'm Nora.
      <break time="320ms"/>
      You might know me as your friendly help desk assistant.
      <break time="450ms"/>
      Talia and I have been working on an idea
      <break time="180ms"/>
      that starts with one simple question:
      <break time="500ms"/>
      How can we make it easier for people to get the help they need?
    </prosody>
  </voice>
</speak>
""".strip()


def main():
    key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SPEECH_REGION")
    if not key or not region:
        sys.exit("set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION")

    cfg = speechsdk.SpeechConfig(subscription=key, region=region)
    cfg.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm
    )
    audio_cfg = speechsdk.audio.AudioOutputConfig(filename=WAV)
    synth = speechsdk.SpeechSynthesizer(speech_config=cfg, audio_config=audio_cfg)

    events = []

    def on_viseme(evt):
        # audio_offset is in 100-nanosecond ticks
        events.append({"t": round(evt.audio_offset / 10_000_000, 4),
                       "id": int(evt.viseme_id)})

    def on_word(evt):
        # handy when calibrating VISEME_OFFSET_MS against what you hear
        pass

    synth.viseme_received.connect(on_viseme)
    synth.synthesis_word_boundary.connect(on_word)

    result = synth.speak_ssml_async(SSML).get()

    if result.reason == speechsdk.ResultReason.Canceled:
        d = result.cancellation_details
        sys.exit(f"canceled: {d.reason} — {d.error_details}")

    events.sort(key=lambda e: e["t"])
    with open(JSON_OUT, "w") as f:
        json.dump(events, f, indent=0)

    dur = events[-1]["t"] if events else 0
    print(f"voice        {VOICE}")
    print(f"audio        {WAV}")
    print(f"visemes      {len(events)} events -> {JSON_OUT}")
    print(f"last viseme  {dur:.2f}s")
    print()
    print("Scene 1 is authored for 20.0s. If the audio runs long or short,")
    print("adjust the prosody rate and the <break> values above rather than")
    print("stretching the scene — the storyboard timings assume 130-145 wpm.")


if __name__ == "__main__":
    main()
