# Nora Presents BoldDesk — Scene 1

A working vertical slice of the video, built in code. No Vyond, no Hedra,
no subscription, no new vendor.

Scene 1 only — twenty seconds, Nora speaking with real lip sync, the
speech bubble forming, rendered out to a 1080p MP4. The point of building
one scene first is to prove the whole pipeline end to end at the cheapest
possible moment. If the mouth shapes look wrong, you find out now rather
than after building twelve scenes on a bad assumption.

```
index.html            the scene — preview UI and render hook in one file
assets/nora.png       Nora, background removed, 819x1063
data/visemes.json     lip-sync track: [{"t": seconds, "id": 0-21}, ...]
scripts/synth_azure.py   Ava audio + the real viseme track
scripts/fake_visemes.py  synthetic track, for testing before audio exists
scripts/render.py        frame-by-frame capture, muxed to MP4
build/                   output
```

## Run it

Preview in a browser. It needs to be served, not opened as a file —
Chromium refuses `fetch()` from a `file://` origin, so the viseme track
loads as nothing and Nora sits there with her mouth shut:

```
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

Play, scrub, toggle captions. The readout bottom-right shows the current
mouth shape and how many visemes loaded.

Render:

```
pip install playwright && python3 -m playwright install chromium
python3 scripts/render.py                      # 1080p, 30fps -> build/scene01.mp4
python3 scripts/render.py --cc                 # captions burned in
python3 scripts/render.py --fps 15 --scale .5  # quick draft
python3 scripts/render.py --start 12 --end 15  # just the bubble beat
```

## Getting the real voice

```
pip install azure-cognitiveservices-speech
export AZURE_SPEECH_KEY=...
export AZURE_SPEECH_REGION=eastus
python3 scripts/synth_azure.py
```

That writes `assets/scene01.wav` and overwrites `data/visemes.json` with
Ava's actual viseme events. `render.py` picks up the WAV automatically and
muxes it. One synthesis pass produces both the audio and the mouth data,
so they cannot drift apart.

Two things to try while you're in there. Generate the scene with
`en-US-AvaNeural` and again with `NORA_VOICE=en-US-Ava:DragonHDLatestNeural`
and pick by ear — the HD model supports styles and adapts delivery to the
meaning of the line, which usually suits a narrator better, but it's worth
hearing rather than assuming. And note this is not the same Ava as the
Edge speech voice in the game show: that one is browser-local and gives
you no file and no timing data.

## How it works

Everything is a function of one number. `render(t)` positions every
element for a given time in seconds. Preview mode calls it from
`requestAnimationFrame`; the renderer calls it through
`window.__setTime(t)`, one exact timestamp per frame, and screenshots
after a paint. Nothing is a screen recording, so a slow machine produces
the same file as a fast one — and the audio lines up because both were
positioned off the same clock rather than nudged into place afterwards.

### The mouth

Nora's mouth is a single glowing stroke on a sealed faceplate. There is no
jaw, no lips, no eyelids — nothing for a landmark-based avatar model to
find, which is why Hedra was likely to struggle with her. Here that's an
advantage: the entire mouth is four numbers.

Each shape is the same path structure — an upper arc and a lower arc
meeting at two corners — so any two shapes interpolate by lerping their
parameters. At rest both arcs coincide and it renders as the smile that
ships in the PNG. A soft-edged ellipse in the faceplate's own colour hides
the original mouth underneath.

Azure emits 22 viseme IDs. Nora needs eight shapes, so `VISEME_TO_SHAPE`
reduces them. If a particular sound looks wrong in a render, that table is
the only thing to change.

Three knobs worth knowing:

- `MOUTH_GAIN` — overall travel. At 1080p her face is only ~380px wide in
  frame, so a mouth that moves 15px reads as not moving at all. Amplitude
  is the difference between lip sync and a twitch.
- `BLEND` — cross-fade into each new shape, so fast speech doesn't snap.
- `VISEME_OFFSET_MS` — global timing nudge. Azure's viseme offsets can sit
  slightly ahead of or behind the audible phoneme, most noticeably at the
  start of a sentence. Calibrate once against the real WAV, then leave it.

### Blinks

Hand-placed in `BLINKS`, landing in the gaps between phrases. A robot
blinking on a timer looks like a timer. Blinks are two faceplate-coloured
shutters closing over the eye glow, which reads as the light switching off
rather than an eyelid — appropriate for a screen face.

### Captions

`CUES` doubles as the narration record for the scene and as the caption
track. Off by default; `?cc=1` or the checkbox turns them on. The review
checklist in the storyboard asks for a captioned export and for watching
once with the sound off, which this covers.

## Scaling to the rest of the storyboard

Most of the remaining scenes are easier than this one. Look at what they
actually are: an inbox filling with stacking email cards, CC tags
appearing, an email morphing into a ticket, three portal tiles, a phone
submitting, two timing paths racing a clock, five dashboard tiles with one
turning gold, a ticket timeline extending into a ClickUp connection, a
thread compressing into a summary card. That is motion graphics —
transforms, opacity, path interpolation, staggered timing — and it is all
more straightforward in SVG and CSS than in a GUI animation tool.

Only two beats are genuine character acting: Scene 3's borrower checking
the time against a silent phone, and Scene 9's employee stepping away from
a desk. Flat figures in the same style as the optional bangs scene cover
both, and read as a deliberate choice rather than a compromise.

The natural next step is to lift `render(t)`, the easing helpers and the
mouth engine into a shared module, give each scene its own file with its
own local `t`, and have a master timeline offset them. Then the renderer
walks the whole video instead of one scene.

## Known rough edges

- Preview must be served over HTTP, not opened as a file. See above.
- 600 frames at 1080p takes a few minutes. Use `--fps 15 --scale .5` while
  iterating on feel and full res only for review cuts.
- No GUI timeline. The scrubber covers most of it, but judging motion
  still means render-and-look more than it would in Vyond.
- `data/visemes.json` currently holds synthetic data from
  `fake_visemes.py`. It has the right shape and rhythm but is not
  phoneme-accurate — it exists to prove the pipeline, not to ship.
