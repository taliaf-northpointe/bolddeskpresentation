# Nora Presents BoldDesk — renderer

The video, built in code. No Vyond, no Hedra, no subscription, no new
vendor.

Scenes 1 to 4 of twelve are built. Scene 1 is the only pure talking head
in the film and was built first to prove the lip-sync pipeline. Scene 2 is
the first pure motion-graphics scene, which is what most of the remaining
ones are. Scene 3 is the hero beat and one of only two scenes that needs
real character acting. Scene 4 is the turn, and the first scene where
Nora shares the frame with something else.

```
index.html                 master timeline — every scene on one clock
lib/engine.js              shared: easing, Nora, the mouth, captions
scenes/scene01.js          "A human question"          0:00-0:20
scenes/scene02.js          "The work behind the work"  0:20-0:44
scenes/scene03.js          "The customer feels the delay" 0:44-1:16
scenes/scene04.js          "The idea"                  1:16-1:43
assets/nora.png            Nora, background removed, 819x1063
data/narration.json        the script: every scene's lines and where they land
data/visemes-sceneNN.json  lip-sync track, per scene
data/cues-sceneNN.json     phrase timings from Ava's actual read
data/pacing.md             speech length against each scene's slot
scripts/synth.py           Ava reads the film: audio, words, cues, visemes
scripts/synth_azure.py     earlier Scene-1-only Azure script; synth.py supersedes it
scripts/fake_visemes.py    synthetic track, for testing before audio exists
scripts/render.py          frame-by-frame capture, muxed to MP4
build/                     output
```

## Run it

Preview in a browser. It has to be **served**, not opened as a file —
Chromium refuses `fetch()` from a `file://` origin, so the viseme track
loads as nothing and Nora sits there with her mouth shut:

```
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

Play, scrub, pick a scene from the dropdown, toggle captions. The readout
bottom-right shows the active scene, its local time, and Nora's current
mouth shape. `?scene=2` mounts one scene on its own.

Render:

```
pip install playwright && python3 -m playwright install chromium
python3 scripts/render.py                    # whole film -> build/film.mp4
python3 scripts/render.py --scene 2          # one scene  -> build/scene02.mp4
python3 scripts/render.py --cc               # captions burned in
python3 scripts/render.py --fps 15 --scale .5            # quick draft
python3 scripts/render.py --scene 2 --start 13 --end 15  # one beat
```

Frames are always captured at 1920x1080; `--scale` shrinks the output file
on the way out rather than scaling the page. Scaling the page moves the
composition, and then you are reviewing a lie.

## Scene structure

A scene is a module exporting `{ id, title, dur, visemes, build(root),
render(t) }`. `t` is **local** to the scene, counting from zero, so a
scene can be previewed alone or as part of the film without changing a
line of its own code. `index.html` owns the master clock, lays scenes end
to end, and hands each one its local time.

Adding a scene is three steps: write `scenes/sceneNN.js`, import it in
`index.html`, add it to the `SCENES` array. Nothing else knows the order.

## Getting the voice

The voice is Ava — the same "Microsoft Ava Online (Natural)" the Nora
game picks in Edge. Two routes reach her; both go through one script.

```
python -m pip install -r scripts/requirements.txt
python scripts/synth.py                  # every scene, no key needed
python scripts/synth.py --scene 4        # one scene
python scripts/synth.py --preview        # also drop the voice onto samples/*.mp4
python scripts/synth.py --engine azure   # real viseme events, needs a key
```

`--engine edge` (the default) uses Edge's own read-aloud endpoint through
the `edge-tts` package. It is the identical voice, needs no account, and
returns audio plus word boundaries — but no viseme events, so the mouth
for on-camera scenes is approximated from word timing. It is an
unofficial endpoint: right for auditioning and drafts, not for the cut
that ships.

`--engine azure` asks Azure Speech for `en-US-AvaNeural` with
`AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` set. Same voice, and one
synthesis pass returns audio and real viseme events together, so they
cannot drift. Run this once before the final render. The HD variant
`NORA_VOICE=en-US-Ava:DragonHDLatestNeural` adapts delivery to the
meaning of the line; generate both and pick by ear.

The script is `data/narration.json`: one entry per scene, split into
chunks that are each synthesised separately and placed at an `at` time
inside the scene. That is what keeps the voice on the scene's authored
beats — Scene 3's silent hold, Scene 4's verbs landing on their words —
instead of letting the engine's pace drive the picture. Sentences that
should flow as one breath belong in one chunk; more chunks means more
chances for the tone to shift between segments.

Per scene it writes:

```
assets/sceneNN.wav          padded to the scene's slot; render.py muxes it
data/words-sceneNN.json     every word with start and duration
data/cues-sceneNN.json      phrase timings — paste into CUES when they settle
data/visemes-sceneNN.json   mouth track, on-camera scenes only
```

plus `assets/film.wav` (the scenes end to end on the master clock) and
`data/pacing.md`, a table of where speech ends against each slot. WAVs
are gitignored; regenerating them takes under a minute.

Behind the bank's TLS inspection, Python's own certificate bundle rejects
the proxy. `truststore` (in requirements) makes it use the Windows
certificate store instead; the script imports it when present.

## How it works

Everything is a function of one number. `render(t)` positions every
element for a given moment. Preview mode calls it from
`requestAnimationFrame`; the renderer calls it through
`window.__setTime(t)`, one exact timestamp per frame, and screenshots
after a paint. Nothing is a screen recording, so a slow machine produces
the same file as a fast one — and the audio lines up because both were
positioned off the same clock rather than nudged into place afterwards.

### The mouth

Nora's mouth is a single glowing stroke on a sealed faceplate. No jaw, no
lips, no eyelids — nothing for a landmark-based avatar model to find,
which is why Hedra was likely to struggle with her. Here it is an
advantage: the entire mouth is four numbers.

Each shape is the same path structure — an upper arc and a lower arc
meeting at two corners — so any two shapes interpolate by lerping their
parameters. At rest both arcs coincide and it renders as the smile that
ships in the PNG. A soft-edged ellipse in the faceplate's own colour hides
the original mouth underneath.

Azure emits 22 viseme IDs. Nora needs eight shapes, so `VISEME_TO_SHAPE`
reduces them. If a particular sound looks wrong in a render, that table is
the only thing to change.

Three knobs, all in `lib/engine.js`:

- `MOUTH_GAIN` — overall travel. At 1080p her face is only ~380px wide in
  frame, so a mouth that moves 15px reads as not moving at all. Amplitude
  is the difference between lip sync and a twitch.
- `BLEND` — cross-fade into each new shape, so fast speech doesn't snap.
- `VISEME_OFFSET_MS` — global timing nudge. Azure's viseme offsets can sit
  slightly ahead of or behind the audible phoneme, most noticeably at the
  start of a sentence. Calibrate once against the real WAV, then leave it.

### Blinks

Passed per scene as a list of times, not generated on an interval — a
robot blinking on a timer looks like a timer. They are two
faceplate-coloured shutters closing over the eye glow, which reads as the
light switching off rather than an eyelid. Right for a screen face.

### Captions

Each scene's `CUES` list doubles as its narration record and its caption
track. Off by default; `?cc=1` or the checkbox turns them on. The
storyboard's review checklist asks for a captioned export and for watching
once with the sound off, which this covers.

## Scene 2 notes

No Nora on camera; her voice continues over animation. The mailbox panel
starts near centre — for the first ten seconds the mailbox *is* the scene,
and a panel hugging the left edge leaves two thirds of frame empty — then
clears left at 11.4s to make room for the figures and the on-screen line.

The unread badge shifts from brand blue toward a warning tone as it
climbs. That one element carries the whole scene.

Storyboard build note, honoured: every sender name is invented and every
subject line is a category rather than a request. Nothing here resembles
real customer information.

Three pieces from this scene are reusable and worth knowing about before
writing Scene 3: the email card, the flat figure, and `stagger()` in the
engine, which does most of the work in any scene where a set of things
appears one after another.

## Scene 3 notes

The storyboard calls this the emotional centerpiece and asks for extra
screen time with an explicit instruction not to fill the hold with
narration. 19.0-23.5 is therefore silent: the left and middle panels drain
back by 55%, the customer stays lit, and the on-screen line carries the
beat alone.

The clock runs 9:05 to 10:20 — a bit over an hour, not a dramatised whole
day. The honest version is more persuasive here.

The email exchange is four invented messages alternating direction, and
the third is the employee finally supplying what the first should have
carried. That sets up Scene 7 ("thirty seconds now saves much more time
later") and the worked example in the team-facing video, without using
anything from a real ticket.

Figures get two or three moving parts each — a head that tilts, an arm
that raises, a button that depresses — which is enough at this scale. Two
things learned: a held object must counter-rotate against the arm swinging
it, or it reads as a blade rather than a phone; and a screen's glow
belongs on the object, not as a separate blob on the floor.

## Scene 4 notes

Nora is on camera for the first two sentences, then moves to the corner
and stays there, still narrating. Her viseme track runs the full scene —
she does not stop being in the film just because she stops being its
subject.

`makeNora` defaults to `transform-origin: 50% 90%`, which grounds the
entry bob nicely and makes `left`/`top` non-literal as soon as you scale
her. That is fine when she is alone in frame and useless when she has to
sit beside other elements, so this scene passes `origin: '0% 0%'` and gets
predictable coordinates.

The four verbs land on the words in the long sentence, each with a
connector drawn a beat after its tile, and the ticket gives a small pulse
as each one attaches. The headline hands over to the
behind-the-scenes line in the same slot rather than stacking a second
line into the caption band.

Both title slots sit at the top of frame, deliberately: burned-in captions
occupy roughly the bottom 130px, and nothing should compete with them.

## Scaling to the rest of the storyboard

Scene 2 confirmed the cheap assumption: most of the film is motion
graphics, not character animation. An email morphing into a ticket, three
portal tiles, a phone submitting, two timing paths racing a clock, five
dashboard tiles with one turning gold, a ticket timeline extending into a
ClickUp connection, a thread compressing into a summary card — all
transforms, opacity and staggered reveals.

Only two beats are genuine character acting: Scene 3's borrower checking
the time against a silent phone, and Scene 9's employee stepping away from
a desk. The flat figures introduced in Scene 2 cover both, and sit in the
same register as the optional stick-figure scene.

## Known rough edges

- Preview must be served over HTTP, not opened as a file. See above.
- A full-length render is slow: roughly half a second per frame at 1080p.
  Use `--fps 15 --scale .5` while iterating on feel, full res for review.
- No GUI timeline. The scrubber covers most of it, but judging motion
  still means render-and-look more than it would in Vyond.
- The committed viseme tracks come from `synth.py --engine edge`: Ava's
  real word timings, with mouth shapes spread across each word by letter.
  Close, not phoneme-accurate. `--engine azure` replaces them with her
  actual viseme events; do that before the final render.
- Ava reads faster than the storyboard's 130-145 wpm, so most scenes have
  several seconds of margin (see `data/pacing.md`). That is room for holds
  and transitions, not a problem — but a scene's `CUES` and any beats tied
  to words should be checked against `data/cues-sceneNN.json` once the
  voice is in.
- A CSS `filter` on a parent cannot be undone by a child. Scene 2's
  dim-to-one-email applies the filter per row, not on the panel, for that
  reason.
- Scaling an element about its centre inside a clipped container pushes
  its edges outside the clip. Scene 2's highlighted row scales from
  `transform-origin: left center`.
- `box-sizing: border-box` is set globally in `index.html`. Without it a
  padded card is wider than its declared width, which is how Scene 4's
  ticket first ended up sliding off the right edge of frame.
