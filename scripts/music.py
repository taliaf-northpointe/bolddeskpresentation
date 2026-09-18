#!/usr/bin/env python3
"""
music.py — lay a music bed under the narration and mux it onto the film.

No re-render: the video stream is copied from build/film.mp4, and only the
audio is rebuilt from assets/film.wav (Ava) plus the music.

    python scripts/music.py track1.mp3 track2.mp3
    python scripts/music.py track1.mp3 track2.mp3 --level 0.22 --fade 8

The bed is track1 cross-faded into track2, that pair repeated as many
times as the film needs, trimmed to the film's length, faded out at the
end, and held at one constant low level the whole way through. Constant
on purpose: ducking makes the music swell whenever the voice pauses, which
draws attention to it. --duck turns that on if ever wanted.

Output: build/film-music.mp4
"""

import argparse
import math
import os
import shutil
import subprocess
import sys
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
VIDEO = os.path.join(ROOT, "build", "film.mp4")
VOICE = os.path.join(ROOT, "assets", "film.wav")
OUT = os.path.join(ROOT, "build", "film-music.mp4")


def find_ffmpeg(name="ffmpeg"):
    p = shutil.which(name)
    if p:
        return p
    pk = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages")
    if os.path.isdir(pk):
        for d in os.listdir(pk):
            if d.startswith("Gyan.FFmpeg"):
                for sub in os.listdir(os.path.join(pk, d)):
                    c = os.path.join(pk, d, sub, "bin", name + ".exe")
                    if os.path.exists(c):
                        return c
    sys.exit(f"{name} not found")


def duration(ffprobe, path):
    r = subprocess.run([ffprobe, "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", path], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tracks", nargs="+", help="music files, played in order and repeated")
    ap.add_argument("--video", default=VIDEO)
    ap.add_argument("--voice", default=VOICE)
    ap.add_argument("--out", default=OUT)
    ap.add_argument("--level", type=float, default=0.10,
                    help="music gain (1.0 = the track's own level; 0.10 sits ~11 dB under Ava)")
    ap.add_argument("--duck", action="store_true",
                    help="also duck the bed under the voice (swells in the gaps; off by default)")
    ap.add_argument("--xfade", type=float, default=3.0, help="crossfade between tracks, seconds")
    ap.add_argument("--fade", type=float, default=7.0, help="fade-out at the end, seconds")
    ap.add_argument("--fade-in", type=float, default=2.0)
    a = ap.parse_args()

    ffmpeg, ffprobe = find_ffmpeg("ffmpeg"), find_ffmpeg("ffprobe")
    with wave.open(a.voice) as w:
        total = w.getnframes() / w.getframerate()

    lens = [duration(ffprobe, t) for t in a.tracks]
    cycle = sum(lens) - a.xfade * len(lens)
    reps = math.ceil(total / cycle) + 1
    seq = a.tracks * reps            # the order the bed plays in
    print(f"film {total:.1f}s  cycle {cycle:.1f}s  -> {reps} passes over {len(a.tracks)} tracks")

    # inputs: 0 video, 1 voice, 2.. music sequence
    cmd = [ffmpeg, "-y", "-v", "error", "-i", a.video, "-i", a.voice]
    for t in seq:
        cmd += ["-i", t]

    f = []
    # normalise each music input to stereo 48k so acrossfade accepts them
    for i in range(len(seq)):
        f.append(f"[{i+2}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[m{i}]")
    # chain crossfades: m0 -> m1 -> ... -> mN
    cur = "[m0]"
    for i in range(1, len(seq)):
        nxt = f"[x{i}]"
        f.append(f"{cur}[m{i}]acrossfade=d={a.xfade}:c1=tri:c2=tri{nxt}")
        cur = nxt
    # trim to the film, fade in and out, set level
    f.append(f"{cur}atrim=0:{total:.3f},asetpts=PTS-STARTPTS,"
             f"afade=t=in:st=0:d={a.fade_in},afade=t=out:st={total - a.fade:.3f}:d={a.fade},"
             f"volume={a.level}[bed]")
    # voice to stereo 48k; split so it can key the compressor and also be mixed
    # mono -> stereo upmix costs 3 dB; give it back so Ava sits where she did
    f.append("[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,volume=1.41,asplit=2[v1][v2]")
    if a.duck:
        f.append("[bed][v1]sidechaincompress=threshold=0.015:ratio=5:attack=30:release=700:makeup=1[ducked]")
    else:
        f.append("[v1]anullsink")
        f.append("[bed]acopy[ducked]")
    # mix without renormalising (the bed is already quiet)
    # a brick-wall limiter so voice + music can never clip
    f.append("[v2][ducked]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95:attack=5:release=60[out]")

    cmd += ["-filter_complex", ";".join(f), "-map", "0:v", "-map", "[out]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
            "-movflags", "+faststart", a.out]
    subprocess.run(cmd, check=True)
    print(f"{a.out}  ({os.path.getsize(a.out)/1e6:.1f} MB)")


if __name__ == "__main__":
    main()
