#!/usr/bin/env python3
"""
fake_visemes.py — write a plausible viseme track without calling Azure.

This exists so the render pipeline can be exercised end to end before the
real Ava audio is in hand. It reads the caption cues for the scene and
distributes viseme IDs across each phrase in proportion to the letters,
which is nowhere near phoneme-accurate but is the correct *shape* of data:
[{"t": seconds, "id": 0-21}, ...] — the same thing Azure's VisemeReceived
event produces once you divide its tick offsets down to seconds.

Replace the output with synth_azure.py's before you render for real.

    python3 scripts/fake_visemes.py
"""

import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")

# Phrase timings must match each scene's CUES in scenes/sceneNN.js.
# Only scenes where Nora is on camera need a track.
SCENES = {
    1: [
        (0.60,  2.00, "Hi, I'm Nora."),
        (2.00,  6.20, "You might know me as your friendly help desk assistant."),
        (6.40,  8.90, "Talia and I have been working on an idea"),
        (8.90, 12.50, "that starts with one simple question:"),
        (12.60, 19.10, "How can we make it easier for people to get the help they need?"),
    ],
    4: [
        (0.30,  3.00, "That is where BoldDesk comes in."),
        (3.20,  7.80, "We have been trialing it, and what we are seeing is worth sharing."),
        (8.20, 18.20, "The idea is an enterprise support experience where requests are "
                      "easy to submit, easy to track, easy to hand off, and easy to measure."),
        (18.60, 21.20, "This is not about adding another tool."),
        (21.40, 25.80, "It is about improving what happens behind the scenes."),
    ],
}

# Rough letter -> Azure viseme ID. Digraphs are checked first.
DIGRAPHS = {
    "sh": 16, "ch": 16, "th": 17, "ph": 18, "wh": 7,
    "ng": 20, "ck": 20, "qu": 20, "oo": 7, "ee": 6,
    "ou": 9, "ow": 9, "oi": 10, "oy": 10, "ai": 11, "ay": 11,
}
SINGLES = {
    "a": 1, "e": 4, "i": 6, "o": 8, "u": 7, "y": 6,
    "p": 21, "b": 21, "m": 21,
    "f": 18, "v": 18,
    "d": 19, "t": 19, "n": 19,
    "k": 20, "g": 20, "c": 20, "x": 20, "q": 20,
    "l": 14, "r": 13,
    "s": 15, "z": 15,
    "j": 16,
    "h": 12, "w": 7,
}

MIN_GAP = 0.052   # don't emit faster than a mouth can move


def phrase_visemes(text):
    """Ordered viseme IDs for a phrase, one per sound-ish unit."""
    s = re.sub(r"[^a-z']", " ", text.lower())
    ids = []
    for word in s.split():
        i = 0
        while i < len(word):
            pair = word[i:i + 2]
            if pair in DIGRAPHS:
                ids.append(DIGRAPHS[pair])
                i += 2
                continue
            ch = word[i]
            if ch in SINGLES:
                # collapse a doubled consonant into one movement
                if ids and SINGLES[ch] == ids[-1]:
                    i += 1
                    continue
                ids.append(SINGLES[ch])
            i += 1
        ids.append(0)   # brief close between words
    return ids


def build(cues):
    events = [{"t": 0.0, "id": 0}]
    for start, end, text in cues:
        ids = phrase_visemes(text)
        if not ids:
            continue
        step = max(MIN_GAP, (end - start) / len(ids))
        t = start
        for vid in ids:
            if t >= end:
                break
            events.append({"t": round(t, 3), "id": vid})
            t += step
        events.append({"t": round(min(t, end), 3), "id": 0})   # silence after

    events.sort(key=lambda e: e["t"])

    # drop events that crowd their predecessor
    cleaned = [events[0]]
    for e in events[1:]:
        if e["t"] - cleaned[-1]["t"] < MIN_GAP * 0.8:
            continue
        cleaned.append(e)
    return cleaned


def main():
    import sys
    want = None
    if "--scene" in sys.argv:
        want = int(sys.argv[sys.argv.index("--scene") + 1])

    for n, cues in sorted(SCENES.items()):
        if want and n != want:
            continue
        events = build(cues)
        path = os.path.abspath(
            os.path.join(ROOT, "data", f"visemes-scene{n:02d}.json"))
        with open(path, "w") as f:
            json.dump(events, f, indent=0)
        print(f"scene {n}: {len(events)} synthetic visemes -> {path}")

    print("NOTE: placeholder timing. Swap in synth_azure.py output for the real cut.")


if __name__ == "__main__":
    main()
