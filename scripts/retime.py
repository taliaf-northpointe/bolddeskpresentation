#!/usr/bin/env python3
"""
retime.py — shift a scene's hard-coded beats after the narration changes.

Scenes keep their beat times as constants in a `const T = { ... }` block
(and, for the on-camera scenes, a BLINKS array). When a line is reworded
and Ava re-reads the section, every phrase moves a little. This tool maps
the OLD cue file to the NEW one — phrase by phrase, matched on text — and
moves every decimal number in those blocks through that mapping, so a
beat that sat at "tracked" still sits at "tracked".

    python scripts/retime.py --old ../oldcues --scene sec09 [--dry]

Numbers inside a matched phrase move proportionally within it; numbers in
a gap move with the gap; numbers after an inserted phrase shift by its
length. Integers are left alone (indices, pixel sizes). `dur` is set to
the section's slot in narration.json. Review the diff afterwards: a beat
tied to a word that was itself reworded may need a hand adjustment.
"""

import argparse
import difflib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).split()


def anchors(old, new):
    """[(old_t, new_t), ...] from matched phrases: start->start, end->end."""
    a, b = [norm(c[2]) for c in old], [norm(c[2]) for c in new]
    # match phrases by word overlap, in order
    sm = difflib.SequenceMatcher(None, [" ".join(x) for x in a], [" ".join(x) for x in b], autojunk=False)
    pairs = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            pairs += list(zip(range(i1, i2), range(j1, j2)))
        elif tag == "replace":
            # pair reworded phrases greedily by similarity
            for i in range(i1, i2):
                best, bj = 0, None
                for j in range(j1, j2):
                    r = difflib.SequenceMatcher(None, a[i], b[j]).ratio()
                    if r > best:
                        best, bj = r, j
                if bj is not None and best > 0.5:
                    pairs.append((i, bj))
    pairs.sort()
    pts = [(0.0, 0.0)]
    for i, j in pairs:
        pts.append((old[i][0], new[j][0]))
        pts.append((old[i][1], new[j][1]))
    pts = sorted(set(pts))
    # keep monotone
    out = []
    for p in pts:
        if not out or (p[0] > out[-1][0] and p[1] >= out[-1][1]):
            out.append(p)
    return out, pairs


def make_map(pts):
    def f(t):
        if t <= pts[0][0]:
            return t + (pts[0][1] - pts[0][0])
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            if x0 <= t <= x1:
                return y0 if x1 == x0 else y0 + (t - x0) * (y1 - y0) / (x1 - x0)
        x, y = pts[-1]
        return t + (y - x)
    return f


BLOCKS = [re.compile(r"const T = \{.*?\n\};", re.S),
          re.compile(r"const BLINKS = \[.*?\];", re.S)]
NUM = re.compile(r"(?<![\w.])(\d+\.\d+)(?![\w.])")


def retime(scene_path, f, dur, dry):
    src = open(scene_path, encoding="utf-8").read()
    changes = []

    def fix_block(m):
        block = m.group(0)
        def fix_num(nm):
            v = float(nm.group(1))
            nv = round(f(v), 2)
            if abs(nv - v) > 0.005:
                changes.append((v, nv))
            return f"{nv:.2f}"
        return NUM.sub(fix_num, block)

    out = src
    for rx in BLOCKS:
        out = rx.sub(fix_block, out)
    out, n = re.subn(r"export const dur = [\d.]+;", f"export const dur = {dur};", out)
    if not dry:
        open(scene_path, "w", encoding="utf-8").write(out)
    return changes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", required=True, help="folder holding the previous cues-*.json files")
    ap.add_argument("--scene", action="append", required=True, help="section id, e.g. sec09; repeatable")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--variant", default=None,
                    help="retime scenes/<variant>/ against data/<variant>/ cues and narration")
    a = ap.parse_args()

    data_dir = os.path.join(ROOT, "data", *([a.variant] if a.variant else []))
    scenes_dir = os.path.join(ROOT, "scenes", *([a.variant] if a.variant else []))
    nar = json.load(open(os.path.join(data_dir, "narration.json"), encoding="utf-8"))
    slots = {s["id"]: s["slot"] for s in nar["scenes"]}

    for sid in a.scene:
        old = json.load(open(os.path.join(a.old, f"cues-{sid}.json")))
        new = json.load(open(os.path.join(data_dir, f"cues-{sid}.json")))
        pts, pairs = anchors(old, new)
        f = make_map(pts)
        path = os.path.join(scenes_dir, f"{sid}.js")
        ch = retime(path, f, slots[sid], a.dry)
        unmatched_old = [i for i in range(len(old)) if i not in {p[0] for p in pairs}]
        unmatched_new = [j for j in range(len(new)) if j not in {p[1] for p in pairs}]
        print(f"{sid}: {len(pairs)} phrases matched, {len(ch)} beats moved, dur -> {slots[sid]}"
              + (f", old phrases unmatched {unmatched_old}" if unmatched_old else "")
              + (f", NEW phrases {unmatched_new} (no visuals tied yet)" if unmatched_new else ""))
        for v, nv in ch[:40]:
            print(f"    {v:7.2f} -> {nv:7.2f}")


if __name__ == "__main__":
    main()
