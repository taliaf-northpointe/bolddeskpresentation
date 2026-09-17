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
index.html        Scene 1 — the scene itself, preview UI and render hook
assets/           Nora, background removed
data/             viseme track that drives the mouth
scripts/          Azure synthesis, synthetic visemes, frame renderer
samples/          a rendered draft (silent — see SCENE01.md)
docs/             storyboard and working notes
SCENE01.md        how the renderer works and how to run it
```

Start with **[SCENE01.md](SCENE01.md)**.

## Status

Scene 1 of twelve is built and rendering. It exists to prove the pipeline
end to end before the remaining scenes are written against it — if the
mouth shapes are wrong, better to know after one scene than after twelve.

The viseme track currently committed is synthetic, from
`scripts/fake_visemes.py`. It has the right shape and rhythm but is not
phoneme-accurate. Run `scripts/synth_azure.py` with an Azure Speech key to
replace it with real data and produce the narration audio.

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
