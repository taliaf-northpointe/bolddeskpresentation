#!/usr/bin/env python3
"""
qa_frames.py — load one section headlessly, report console errors, and
screenshot it at a few moments. Cheap way to see a scene before rendering.

    python scripts/qa_frames.py --scene 3                 # frames at 0, 25%, 50%, 75%, end
    python scripts/qa_frames.py --scene 3 --at 2,9.5,31   # your own moments
    python scripts/qa_frames.py --scene 3 --cc            # captions on

Frames land in build/qa/<id>-<t>.png at 960x540 (half size). Exit code 1
if the page threw or the scene failed to mount.
"""

import argparse
import functools
import http.server
import os
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "build", "qa")

ARGS = ["--force-device-scale-factor=1", "--hide-scrollbars"]


def launch(pw):
    """Playwright's bundled Chromium if it downloaded; otherwise the Edge
    that is already on every Northpointe machine (same engine)."""
    try:
        return pw.chromium.launch(args=ARGS)
    except Exception:
        return pw.chromium.launch(channel="msedge", args=ARGS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", type=int, required=True)
    ap.add_argument("--at", default=None, help="comma-separated seconds")
    ap.add_argument("--cc", action="store_true")
    ap.add_argument("--variant", default=None, help="script variant, e.g. team")
    ap.add_argument("--full", action="store_true", help="keep frames at full 1920x1080 (for print)")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)

    http.server.SimpleHTTPRequestHandler.log_message = lambda *a, **k: None
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)

    class Quiet(socketserver.ThreadingTCPServer):
        # index.html fires ~30 fetches at once (cue files, visemes, the
        # cutout); a single-threaded server with the default backlog of 5
        # refuses some of them, which shows up as ERR_CONNECTION_REFUSED
        # and a MISSING viseme track.
        allow_reuse_address = True
        request_queue_size = 128
        daemon_threads = True

    srv = Quiet(("127.0.0.1", 0), handler)
    srv.RequestHandlerClass.log_message = lambda *args, **kw: None
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    url = f"http://127.0.0.1:{port}/index.html?mode=render&scene={a.scene}"
    if a.cc:
        url += "&cc=1"
    if a.variant:
        url += f"&variant={a.variant}"

    errors = []
    with sync_playwright() as pw:
        browser = launch(pw)
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}")
                if m.type in ("error", "warning") else None)
        page.goto(url)
        try:
            page.wait_for_function("window.__ready === true", timeout=20000)
        except Exception as e:
            print("scene did not become ready:", e)
            for er in errors:
                print("  ", er)
            browser.close()
            srv.shutdown()
            sys.exit(1)

        info = page.evaluate("window.__scenes")[0]
        dur = info["dur"]
        print(f"{info['id']}  dur {dur}s  visemes: {page.evaluate('window.__trackNote')!r}")
        times = ([float(x) for x in a.at.split(",")] if a.at
                 else [0.3, dur * 0.25, dur * 0.5, dur * 0.75, dur - 0.3])
        for t in times:
            t = max(0, min(t, dur - 0.01))
            page.evaluate("t => window.__setTime(t)", t)
            extra = page.evaluate("document.getElementById('dbg').textContent")
            path = os.path.join(OUT, f"{info['id']}{'-' + a.variant if a.variant else ''}-{t:05.1f}.png")
            page.screenshot(path=path, scale="css", clip={"x": 0, "y": 0, "width": 1920, "height": 1080})
            # half-size for quick looks, when Pillow is around
            try:
                if a.full:
                    raise RuntimeError("keep full size")
                from PIL import Image
                im = Image.open(path)
                im.thumbnail((960, 540))
                im.save(path)
            except Exception:
                pass
            print(f"  {t:6.2f}s  {extra}  -> {os.path.relpath(path, ROOT)}")
        browser.close()
    srv.shutdown()

    if errors:
        print("\nbrowser reported:")
        for er in errors:
            print("  ", er)
        sys.exit(1)
    print("no console errors")


if __name__ == "__main__":
    main()
