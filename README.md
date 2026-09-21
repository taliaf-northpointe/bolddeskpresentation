# bolddeskpresentation

Materials for a Northpointe "Next Big Idea" submission: an enterprise
support platform, presented by Nora.

The centrepiece is a short animated video. It is built in code — HTML,
SVG and a headless-browser renderer — rather than in an animation tool, so
there is no subscription, no new vendor, and no resolution ceiling. Lip
sync comes from Azure Speech viseme events, which means it is generated
from the audio rather than keyframed by hand.

## Layout

```
index.html        master timeline — every section on one clock
lib/              engine (easing, Nora, the mouth), UI kit (ticket, email, chips),
                  and section.js (title card, captions, figures — the rev-3 shell)
scenes/secNN.js   the film: thirteen sections, one module each (revision 3 script)
scenes/sceneNN.js the earlier twelve-scene cut (revision 2 storyboard); not mounted
data/             narration.json (the script), Ava's word/cue timings, viseme tracks
scripts/          synth.py (voice), render.py (frames -> MP4), qa_frames.py (stills)
samples/          rendered drafts
docs/             storyboard and working notes
SCENE01.md        how the renderer works and how to run it
```

Start with **[SCENE01.md](SCENE01.md)**.

## Status

The film is built to the revision 3 script: thirteen sections, 8:51, Ava
narrating every line with per-line delivery, captions burned in from her
actual phrase timings. `python scripts/render.py --cc` renders it to
`build/film.mp4` with the audio muxed.

How a section is made: `data/narration.json` holds the words; `synth.py`
has Ava read them and writes where every phrase and word lands
(`data/cues-secNN.json`, `data/words-secNN.json`); the section module in
`scenes/` times its visuals to those numbers. Change a line in the script,
re-run synth, and the captions follow automatically — the visuals tied to
that line are the only thing to retime.

The viseme tracks for the two on-camera sections (open and close) are
approximated from Ava's word timings until `synth.py --engine azure` is run
with a key, which returns her real viseme events.

## A note on contents

`docs/` contains internal project context — colleague names, ticket
references, mailbox names, and the current status of a platform that has
not completed vendor management review or been announced company-wide.
That is fine in a private repository and a poor fit for a public one. If
this repo is public, consider:

```
git rm -r --cached docs && echo "docs/" >> .gitignore
```

Northpointe logo files are deliberately not committed here. Brand assets
belong wherever the brand guidelines say they belong.
