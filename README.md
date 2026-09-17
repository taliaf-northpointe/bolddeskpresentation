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
index.html        master timeline — every scene on one clock
lib/              shared engine: easing, Nora, the mouth, captions
scenes/           one module per scene
assets/           Nora, background removed
data/             viseme tracks that drive the mouth
scripts/          Azure synthesis, synthetic visemes, frame renderer
samples/          rendered drafts (silent — see SCENE01.md)
docs/             storyboard and working notes
SCENE01.md        how the renderer works and how to run it
```

Start with **[SCENE01.md](SCENE01.md)**.

## Status

Scenes 1 to 4 of twelve are built and rendering.

Scene 1 is the only pure talking head in the film; it was built first to
prove the lip-sync pipeline before anything was written on top of it.
Scene 2 is the first pure motion-graphics scene, which is what most of the
remaining ones are — and it confirmed the assumption the whole approach
rests on, that this film is mostly moving cards and staggered reveals
rather than character animation. Scene 3 is the hero beat, and the harder
case: the only place so far that needs figures to act. Scene 4 is the
turn — the point where the film stops describing the problem.

The voice is in. `scripts/synth.py` reads the whole script from
`data/narration.json` and has Ava read every scene, placing each line on
the beat the scene authored for it. `data/pacing.md` shows how each
scene's speech fits its slot. Audio files are not committed (regenerate in
under a minute); the timing files in `data/` are. The viseme tracks for
the on-camera scenes are approximated from Ava's word timings until the
same script is run with `--engine azure`, which returns her real viseme
events. See SCENE01.md, "Getting the voice".

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
