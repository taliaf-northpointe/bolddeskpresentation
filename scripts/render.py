#!/usr/bin/env python3
"""
render.py — step the scene frame by frame and mux to MP4.

This is deliberately not a screen recording. The page exposes
window.__setTime(t); we set an exact timestamp, wait for a paint, and
screenshot. Every frame lands on the timestamp it is supposed to, so a
slow machine produces the same file as a fast one, and the audio lines up
because it was positioned off the same clock.

    pip install playwright && python3 -m playwright install chromium
    python3 scripts/render.py                # silent, 30fps, 1080p
    python3 scripts/render.py --cc           # burn in captions
    python3 scripts/render.py --fps 24 --scale 0.5    # fast draft

Output: build/film.mp4, or build/sceneNN.mp4 with --scene
"""

import argparse
import functools
import http.server
import os
import shutil
import socketserver
import subprocess
import sys
import threading

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FRAMES = os.path.join(ROOT, "build", "frames")
OUT_DIR = os.path.join(ROOT, "build")
WAV_FOR = lambda n: os.path.join(ROOT, "assets", f"{n}.wav")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--scale", type=float, default=1.0,
                    help="downscale the OUTPUT file (frames are always 1080p)")
    ap.add_argument("--cc", action="store_true", help="burn in captions")
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--end", type=float, default=None)
    ap.add_argument("--keep-frames", action="store_true")
    ap.add_argument("--scene", type=int, default=None,
                    help="render one scene in isolation, e.g. --scene 2")
    a = ap.parse_args()

    if os.path.isdir(FRAMES):
        shutil.rmtree(FRAMES)
    os.makedirs(FRAMES, exist_ok=True)

    # Always render the stage at its authored 1920x1080. Drafts are made
    # smaller by ffmpeg on the way out, not by scaling the page — scaling
    # the page shifts the composition and you end up reviewing a lie.
    w, h = 1920, 1080

    # Chromium refuses fetch() from a file:// origin, which means the
    # viseme track loads as nothing and Nora renders with her mouth shut.
    # Serve the folder instead.
    handler = functools.partial(http.server.SimpleHTTPRequestHandler,
                                directory=ROOT)

    class Quiet(socketserver.TCPServer):
        allow_reuse_address = True

    srv = Quiet(("127.0.0.1", 0), handler)
    srv.RequestHandlerClass.log_message = lambda *args, **kw: None
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    url = f"http://127.0.0.1:{port}/index.html?mode=render"
    if a.cc:
        url += "&cc=1"
    if a.scene:
        url += f"&scene={a.scene}"

    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--force-device-scale-factor=1",
                                           "--hide-scrollbars"])
        page = browser.new_page(viewport={"width": w, "height": h},
                                device_scale_factor=1)
        page.goto(url)
        page.wait_for_function("window.__ready === true", timeout=20000)

        note = page.evaluate("window.__trackNote")
        print(f"viseme tracks: {note or '(none needed)'}")
        if "MISSING" in (note or ""):
            print("WARNING: a scene wants visemes and found none — run "
                  "scripts/fake_visemes.py or scripts/synth_azure.py")

        dur = page.evaluate("window.__duration")
        t_end = a.end if a.end is not None else dur
        n = int(round((t_end - a.start) * a.fps))
        print(f"rendering {n} frames  {w}x{h} @ {a.fps}fps  "
              f"({a.start:.2f}s -> {t_end:.2f}s)")

        for i in range(n):
            t = a.start + i / a.fps
            page.evaluate("t => window.__setTime(t)", t)
            page.screenshot(path=os.path.join(FRAMES, f"f{i:06d}.png"))
            if i % 30 == 0:
                pct = 100 * i / max(n, 1)
                print(f"  {i:5d}/{n}  {t:6.2f}s  {pct:5.1f}%")

        browser.close()
    srv.shutdown()

    if not shutil.which("ffmpeg"):
        print(f"frames in {FRAMES}; install ffmpeg to mux")
        return

    cmd = ["ffmpeg", "-y", "-framerate", str(a.fps),
           "-i", os.path.join(FRAMES, "f%06d.png")]
    name = f"scene{a.scene:02d}" if a.scene else "film"
    out = os.path.join(OUT_DIR, name + ".mp4")
    wav = WAV_FOR(name)
    if os.path.exists(wav):
        cmd += ["-i", wav, "-c:a", "aac", "-b:a", "192k", "-shortest"]
        print("muxing with", os.path.basename(wav))
    else:
        print(f"no assets/{name}.wav — writing a silent cut")
    vf = []
    if a.scale != 1.0:
        vf.append(f"scale=iw*{a.scale}:ih*{a.scale}")
    if vf:
        cmd += ["-vf", ",".join(vf)]
    cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
            "-movflags", "+faststart", out]

    subprocess.run(cmd, check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if not a.keep_frames:
        shutil.rmtree(FRAMES)
    size = os.path.getsize(out) / 1e6
    print(f"\n{out}  ({size:.1f} MB)")


if __name__ == "__main__":
    main()
