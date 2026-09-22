#!/usr/bin/env python3
"""
handout.py — the standalone PDF handout (also travels with the video).

Builds an HTML document in the film's palette, drops in stills from the
film and real screenshots of the portal, and prints it to PDF with the
same headless browser the renderer uses.

    python scripts/handout.py                       # -> build/handout.pdf
    python scripts/handout.py --screens "C:/.../handout/screens"

Screens: every *.png / *.jpg in the screens folder becomes a figure in
the "From the portal" section, in filename order. A sidecar text file
with the same stem (e.g. 01-unassigned.txt) supplies the caption;
without one, the filename is used ("01-unassigned" -> "Unassigned").
Film stills come from build/qa/ (run scripts/qa_frames.py first) or from
build/stills/ if present.

The words in this handout follow the revision 3 script in
data/narration.json. Change the script, change the handout.
"""

import argparse
import base64
import glob
import functools
import mimetypes
import os
import re
import sys

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "build", "handout.pdf")
QA = os.path.join(ROOT, "build", "qa")
STILLS = os.path.join(ROOT, "build", "stills")

NAVY = "#164356"
BLUE = "#0086B1"


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def still(prefix):
    """Best available still for a section: build/stills/<sec>.png, else the
    mid-frame from build/qa."""
    p = os.path.join(STILLS, prefix + ".png")
    if os.path.exists(p):
        return data_uri(p)
    cands = sorted(glob.glob(os.path.join(QA, prefix + "-*.png")))
    if not cands:
        return None
    return data_uri(cands[len(cands) // 2])


def screens(folder):
    figs = []
    for p in sorted(glob.glob(os.path.join(folder, "*.png")) + glob.glob(os.path.join(folder, "*.jpg"))):
        stem = os.path.splitext(os.path.basename(p))[0]
        cap_path = os.path.join(folder, stem + ".txt")
        if os.path.exists(cap_path):
            cap = open(cap_path, encoding="utf-8").read().strip()
        else:
            cap = re.sub(r"^\d+[-_ ]*", "", stem).replace("-", " ").replace("_", " ").strip().capitalize()
        try:
            from PIL import Image
            w, h = Image.open(p).size
        except Exception:
            w, h = 16, 9
        cls = "screen " + ("portrait" if h > w else ("wide" if w / h > 3.5 else ""))
        low = stem.lower()
        if "requester" in low or "employee" in low:
            portal = "Employee Requester Portal"
        elif "dashboard" in low:
            portal = "Agent Portal · Leadership dashboard"
        else:
            portal = "Agent Portal"
        figs.append((data_uri(p), portal, cls, low))
    return figs


def fig(uri, caption, cls=""):
    # captions are kept in the call sites as a record of what each image is,
    # but are not printed: the handout runs without captions.
    if not uri:
        return f'<figure class="slot {cls}"><div class="ph">Portal screenshot</div></figure>'
    label = (f'<figcaption><span class="real">Real example</span> Directly from our {caption}</figcaption>'
             if "screen" in cls else "")
    return f'<figure class="{cls}"><img src="{uri}">{label}</figure>'


CSS = f"""
@page {{ size: Letter; margin: 0.6in 0.65in 0.7in; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; font-family: "Segoe UI", Lato, system-ui, sans-serif; color: #17303c; font-size: 10.5pt; line-height: 1.42; }}
h1, h2, h3 {{ color: {NAVY}; margin: 0; line-height: 1.12; }}
h1 {{ font-size: 30pt; letter-spacing: -.01em; }}
h2 {{ font-size: 16.5pt; margin-bottom: 5pt; }}
h3 {{ font-size: 11.5pt; margin-bottom: 3pt; }}
p {{ margin: 0 0 7pt; }}
.kicker {{ font-size: 8.5pt; letter-spacing: .18em; text-transform: uppercase; color: {BLUE}; font-weight: 700; margin-bottom: 6pt; }}
.rule {{ width: 60pt; height: 4pt; background: {BLUE}; border-radius: 2pt; margin: 10pt 0 14pt; }}
.page {{ page-break-after: always; }}
.page:last-child {{ page-break-after: auto; }}
section {{ margin-bottom: 16pt; }}
.cover {{ display: flex; flex-direction: column; justify-content: space-between; min-height: 9.4in; }}
.cover .hero {{ border-radius: 10pt; overflow: hidden; box-shadow: 0 10pt 30pt rgba(14,46,60,.18); margin: 18pt 0 22pt; }}
.cover .hero img {{ width: 100%; display: block; }}
.cover .sub {{ font-size: 15pt; color: {NAVY}; font-weight: 600; margin-top: 8pt; }}
.cover .meta {{ color: #5b7280; font-size: 9.5pt; }}
.lede {{ font-size: 12.5pt; color: {NAVY}; }}
.two {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16pt; align-items: start; }}
.three {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12pt; }}
.why {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12pt; margin: 8pt 0 14pt; }}
.why .card:last-child {{ grid-column: 1 / -1; }}
.card {{ background: #F1F7FA; border-left: 4pt solid {BLUE}; border-radius: 6pt; padding: 10pt 12pt; }}
.card h3 {{ margin-bottom: 4pt; }}
.card p {{ margin: 0; font-size: 9.8pt; }}
.pull {{ font-size: 14pt; color: {NAVY}; font-weight: 700; border-left: 4pt solid {BLUE}; padding-left: 12pt; margin: 8pt 0 12pt; }}
figure {{ margin: 0 0 14pt; break-inside: avoid; }}
figure img {{ width: 100%; display: block; border-radius: 6pt; box-shadow: 0 6pt 18pt rgba(14,46,60,.14); border: 1px solid rgba(22,67,86,.10); }}
figcaption {{ font-size: 8.8pt; color: #5b7280; margin-top: 6pt; text-align: center; }}
.real {{ display: inline-block; background: {BLUE}; color: #fff; border-radius: 999pt; padding: 1.5pt 8pt; font-size: 7.8pt; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-right: 6pt; vertical-align: middle; }}
.slot .ph {{ width: 100%; aspect-ratio: 16/4.6; border: 1.5pt dashed rgba(0,134,177,.45); border-radius: 6pt; display: grid; place-items: center; color: {BLUE}; font-weight: 700; font-size: 9.5pt; background: rgba(0,134,177,.04); }}
ul {{ margin: 0 0 8pt 14pt; padding: 0; }}
li {{ margin-bottom: 3pt; }}
.chips span {{ display: inline-block; background: rgba(0,134,177,.12); color: #0A6E90; border-radius: 999pt; padding: 3pt 9pt; font-size: 9pt; font-weight: 700; margin: 0 5pt 5pt 0; }}
.options {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12pt; margin: 6pt 0 10pt; }}
.options .card {{ border-left: none; border: 1.5pt solid rgba(22,67,86,.18); background: #fff; text-align: center; }}
.small img {{ width: 62%; margin: 0 auto; }}
.dash {{ margin-top: 4pt; }}
.dash img {{ width: 74%; margin: 0 auto; }}
.dash figcaption {{ text-align: center; }}
.portrait figcaption {{ text-align: center; }}
.portrait img {{ width: 44%; margin: 0 auto; }}
.small figcaption {{ text-align: center; }}
.footer {{ break-inside: avoid; font-size: 8.5pt; color: #7a8f9b; border-top: 1px solid rgba(22,67,86,.12); padding-top: 6pt; margin-top: 14pt; }}
.note {{ font-size: 9pt; color: #5b7280; }}
"""


def html(figs):
    s = still
    # a real dashboard screenshot belongs beside the Visibility text, not in the gallery
    dash = next((f for f in figs if "dashboard" in f[3]), None)
    gallery = [f for f in figs if f is not dash]
    dash_fig = fig(dash[0], dash[1], "screen dash") if dash else ""
    slots = "".join(fig(u, c, k) for u, c, k, _ in gallery) if gallery else \
        fig(None, "Agent view — the Unassigned queue: ticket, requester, subject, status, group, agent.") + \
        fig(None, "Requester view — a request as the person who asked sees it.") + \
        fig(None, "Manager view — the team dashboard.")

    return f"""<!doctype html><html><head><meta charset="utf-8"><title>Why BoldDesk? — handout</title>
<style>{CSS}</style></head><body>

<div class="page cover">
  <div>
    <div class="kicker">Northpointe Bank · Enterprise Support</div>
    <h1>Why BoldDesk?</h1>
    <div class="sub">One Northpointe Support Experience</div>
    <div class="rule"></div>
    <div class="hero">{f'<img src="{s("sec01")}">' if s("sec01") else ''}</div>
    <p class="lede">Northpointe is trialing BoldDesk as an Enterprise Support Portal: a better way for teams
    to manage requests, communicate with the employees and customers they support, and provide a better experience for
    our customers.</p>
    <p>A handful of teams have already started testing it. This handout explains the idea and shows
    real screens from the portal.</p>
  </div>
  <div class="meta">Northpointe Bank · {__import__('datetime').date.today():%B %Y}</div>
</div>

<div class="page">
  <section>
    <div class="kicker">The platform</div>
    <h2>Simple for the requester. Simple for the agent.</h2>
    <p>The basic idea: an email sent to a support team becomes a ticket. The team member working that
    ticket is the agent, and they have everything they need in one place.</p>
    <p>Many ticketing systems are designed primarily with technical teams in mind. BoldDesk is simple,
    clean, and user-friendly, making it easy for employees of all technical skill levels to use.</p>
  </section>
  <section>
    <div class="kicker">The challenge</div>
    <h2>The work behind the work</h2>
    <div class="two">
      <div>
        <p>Across Northpointe, many requests live in shared Outlook mailboxes. Employees search through
        email threads, forward messages, copy several colleagues, and try to work out who owns each
        request. When a team member is out of the office, it is even harder to know where a request stands.</p>
        <p>The result is extra back-and-forth, longer wait times, and a great deal of effort spent
        behind the scenes just to keep track of the work itself.</p>
        <div class="pull">While the employee waits, their customer waits too.</div>
        <p class="note">Every one of us supports a customer: a business partner, a borrower, a retail
        customer, or another Northpointe employee. When internal teams get what they need faster, they
        serve their customers faster.</p>
      </div>
      <div>
        {fig(s("sec03"), "From the video: a shared mailbox filling up, requests forwarded and copied.")}
        {fig(s("sec04"), "From the video: the customer waiting on the employee who is waiting on help.")}
      </div>
    </div>
  </section>
</div>

<div class="page">
  <section>
    <div class="kicker">What changes, and what doesn't</div>
    <h2>Customers open a ticket the same way. Their experience gets better.</h2>
    <div class="two">
      <div>
        <p>Nothing changes in how a customer opens a ticket. Teams keep their existing support email
        addresses, and external customers keep emailing them exactly as they do today. What changes is
        the experience: behind the scenes, each email becomes a ticket that is tracked, assigned,
        documented, and measured, so the customer gets better and faster service without learning
        anything new. For our team members, the work becomes far more organized.</p>
        <p>Email works for Northpointe employees too, but we encourage them to use the portal, which is
        for internal employees only. It captures more information up front, which helps the agent help
        them faster. The next page explains why.</p>
        <h3>One place for everything</h3>
        <p>The portal is for Northpointe employees only. It gives them one place to open requests and to see the ones already open with
        teams using BoldDesk, without sending another email for an update. It is mobile friendly and
        does not require a VPN: bookmark it on a phone, sign in with the same work account used for
        Outlook and Teams, and submit a request between meetings.</p>
        <h3>Knowledge that works for everyone</h3>
        <p>A shared knowledge base every team can contribute to. Answer a question once and what one
        team knows becomes something the whole company can use.</p>
      </div>
      <div>
        {fig(s("sec05"), "From the video: an email becomes a ticket; the requester still sees a familiar reply.")}
        {fig(s("sec06"), "From the video: the portal and the mobile view.")}
      </div>
    </div>
  </section>
</div>

<div class="page">
  <section>
    <div class="kicker">Why the portal beats email</div>
    <h2>For you, and for our agents</h2>
    <p>Yes, emailing still opens a ticket. But a ticket is only as good as the request inside it.
    Here is what going through the portal does better.</p>
    <div class="why">
      <div class="card"><h3>Your question doesn't get lost in a thread.</h3>
        <p>A forwarded chain that says "see below" means an agent has to dig through the whole
        conversation just to find the actual ask before they can start helping. The portal has you state
        what you need in your own words, and a clear ask gets a fast answer.</p></div>
      <div class="card"><h3>No more "who's got this?"</h3>
        <p>When a request is copied to several teams at once, someone has to work out who owns it, and
        while that gets sorted, nobody is actually working on it. Picking a category in the portal sends
        your request straight to the right team, first try.</p></div>
      <div class="card"><h3>A little intention goes a long way.</h3>
        <p>Each desk has its own short form with the fields that apply to its requests: the loan number,
        which application, the request type, and more. About 30 seconds of filling them in gives the
        agent the details up front, so the request is done right the first time, with no clarifying
        emails in between.</p></div>
      <div class="card"><h3>You can see your status anytime.</h3>
        <p>Your agent, status, and details are all in the portal at a glance. No follow-up email
        required.</p></div>
      <div class="card"><h3>Every clear ticket helps your agents.</h3>
        <p>Clean, categorized tickets show us what is breaking most often, so we can fix root causes for
        the whole bank. And every minute not spent untangling an email chain is a minute spent solving
        problems. Maybe yours.</p></div>
    </div>
    <div class="pull">Same request, less waiting. Everybody wins.</div>
  </section>
</div>

<div class="page">
  <section>
    <div class="kicker">Visibility</div>
    <h2>A clear picture of the work while it's happening</h2>
    <div class="{'' if dash else 'two'}">
      <div>
        <p>Managers can have dashboards that show, at a glance:</p>
        <ul>
          <li>How many requests are open, waiting on the customer, or closed</li>
          <li>How much work each agent has</li>
          <li>Whether requests are answered, and resolved, within the expected time</li>
        </ul>
        <p>That helps identify bottlenecks and move resources where they are needed, and it gives
        leadership the ability to set measurable service expectations. How to set them is a decision
        for leadership, and BoldDesk supports either approach:</p>
        <div class="options">
          <div class="card"><h3>One common standard</h3><p>across Northpointe</p></div>
          <div class="card"><h3>Each team's own SLA</h3><p>fitted to the work it does</p></div>
        </div>
        <p>Visibility also creates accountability. When requests are tracked and SLAs are visible,
        requesters are not left wondering. When a team member is out, the rest of the team can see the history
        and notes and pick up where things left off.</p>
      </div>
      <div>
        {fig(s("sec08"), "From the video: a team overview with sample figures.") if not dash else ""}
      </div>
    </div>
    {dash_fig}
  </section>
</div>

<div class="page">
  <section>
    <div class="kicker">Built to connect</div>
    <h2>Connect the work. Reduce the repetition.</h2>
    <div class="two">
      <div>
        <p>BoldDesk does not have to stand alone. During the trial we tested an integration with
        ClickUp: a ticket is pushed into ClickUp as a project task with its information carried over,
        and the task number and link come back into the ticket. The bigger opportunity is connecting
        the tools teams already use instead of duplicating work between systems.</p>
        <div class="chips"><span>Automated responses</span><span>Routing</span><span>Assignment</span>
        <span>Document handling</span><span>Repetitive tasks</span></div>
        <p>Every time we automate something repetitive, we give agents back time for the work that
        actually needs a person.</p>
        <h3>And down the road…</h3>
        <p>BoldDesk has an AI connector that could summarize a long ticket conversation so a manager or
        agent understands it quickly. That is a future possibility, with the approval of our AI Use Case
        Review Committee, of course.</p>
      </div>
      <div>
        {fig(s("sec10"), "From the video: a ticket becomes a linked project task and comes back connected.")}
        {fig(s("sec11"), "From the video: a long thread, summarized — marked as a future possibility.")}
      </div>
    </div>
  </section>
</div>

<div class="page">
  <section>
    <div class="kicker">From the portal</div>
    <h2>Real examples</h2>
    <p class="note">Screens from the BoldDesk trial, showing test data.</p>
    {slots}
  </section>
</div>

<div class="page">
  <section>
    <div class="kicker">Why it matters</div>
    <h2>We all play a part in the customer experience</h2>
    <p>This is not about moving emails from one place to another. It is about making it easier for
    employees to get help, and about helping the employees who serve our customers do their jobs more
    effectively. Whether you work directly with a borrower, support a business partner, serve a retail
    customer, or help another Northpointe employee behind the scenes, we all play a part in the
    customer experience.</p>
  </section>
  <section>
    <div class="kicker">The invitation</div>
    <h2>A one-stop shop for support, for all of Northpointe</h2>
    <p>A handful of teams have already started testing BoldDesk. Wouldn't it be amazing if every team
    was on it? One universally great experience: literally a one-stop shop for support across the
    company. We are still exploring what this could look like, but the possibilities are exciting:
    better tracking, better communication, more visibility, more automation, and a better experience
    for the requesters asking for help, which means a better experience for the customers we are all here
    to serve.</p>
    {fig(s("sec14"), "From the video: the close.", "small")}
    <div class="footer">Why BoldDesk? · BoldDesk is in trial; vendor review is ongoing. Illustrations use sample figures; portal screens show test data.</div>
  </section>
</div>
</body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--screens", default=os.path.join(ROOT, "handout", "screens"))
    ap.add_argument("--out", default=OUT)
    a = ap.parse_args()

    figs = screens(a.screens) if os.path.isdir(a.screens) else []
    doc = html(figs)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    html_path = os.path.splitext(a.out)[0] + ".html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(doc)

    args = ["--force-device-scale-factor=1"]
    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(args=args)
        except Exception:
            browser = pw.chromium.launch(channel="msedge", args=args)
        page = browser.new_page()
        page.goto("file:///" + html_path.replace("\\", "/"))
        page.wait_for_load_state("load")
        page.pdf(path=a.out, format="Letter", print_background=True, prefer_css_page_size=True)
        browser.close()
    print(f"{a.out}  ({os.path.getsize(a.out)/1e6:.1f} MB)  screens: {len(figs)}")


if __name__ == "__main__":
    main()
