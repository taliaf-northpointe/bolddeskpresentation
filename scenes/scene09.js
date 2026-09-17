/* ===================================================================
   SCENE 9 — "Continuity, teamwork, and the record"      3:25 – 3:55

   Someone steps away and the request does not go with them. Then the
   audit beat: the same history, rendered as something you could print
   and hand to an examiner.

   The audit line is the one moment in the film aimed squarely at a
   compliance-minded viewer, and the build note asks for about three
   seconds — a reassurance, not a feature pitch. So the document appears
   at 16.6, stamps at 17.4, and is gone by 19.8, with the ticket
   returning underneath it.

   Continuity: this is ticket #1042 from Scene 5, same reference and
   same title, because the storyboard asks for the same ticket and
   because a film that reuses its own props feels built.

   The figure here is rigged differently from Scene 3's — that one needed
   an arm that swings a phone, this one needs a lean toward a screen — so
   the two scenes keep their own, rather than sharing a factory that
   would have to do both.
=================================================================== */

import {
  node, svgNode, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';
import { ticketCard, chip, panelLabel } from '../lib/ui.js';

export const id = 'scene09';
export const title = 'Continuity, teamwork, and the record';
export const dur = 30.0;
export const visemes = null;

const CUES = [
  [0.30,  5.20, "When someone is out, the request doesn't leave with them."],
  [5.60, 14.30, "The team can see the history and what's already been done, so someone else can pick it up and keep moving."],
  [14.80,22.60, "That record is also a complete, printable history — start to finish — if it's ever needed for audit."],
  [23.00,30.00, "The goal isn't to make people work harder. It's to make it easier to work together."],
];

const T = {
  deskIn:   0.30,
  ooo:      2.00,        // the badge lands
  leave:    3.40,        // and they step away
  slide:    6.20,        // the ticket moves to the teammate
  lean:     7.40,
  history:  8.20,        // notes reveal, one at a time
  doc:     16.60,        // the audit beat, ~3 seconds
  stamp:   17.40,
  docOut:  19.40,
  line:    23.20,
  handoff: 28.40,        // the timeline reaches toward ClickUp
};

let root, labels = [], a, b, oooBadge, ticket, doc, stamp, onscreen,
    closing, link, linkSvg, clickup, cc;

/* A seated person with two moving parts: a head that can tilt, and a
   body that can lean toward the screen. */
function seated(parent, x, y, flip) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '360px', height: '340px', opacity: 0,
    transformOrigin: '50% 100%',
  }}, parent);
  const inner = node('div', { style: {
    position: 'absolute', inset: 0,
    transform: flip ? 'scaleX(-1)' : 'none',
    transformOrigin: '50% 100%',
  }}, g);

  const head = node('div', { style: {
    position: 'absolute', left: '74px', top: '10px', width: '72px', height: '72px',
    borderRadius: '50%', background: NAVY, transformOrigin: '50% 130%',
  }}, inner);
  const body = node('div', { style: {
    position: 'absolute', left: '42px', top: '90px', width: '136px', height: '118px',
    borderRadius: '50px 50px 14px 14px', background: 'rgba(22,67,86,.88)',
    transformOrigin: '50% 100%',
  }}, inner);

  node('div', { style: {   // desk
    position: 'absolute', left: '10px', top: '200px', width: '330px', height: '16px',
    borderRadius: '8px', background: 'rgba(22,67,86,.28)',
  }}, inner);

  const lid = node('div', { style: {  // screen on the desk
    position: 'absolute', left: '176px', top: '122px', width: '132px', height: '80px',
    background: '#fff', borderRadius: '7px', overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(14,46,60,.22)',
  }}, inner);
  const lines = [];
  for (let i = 0; i < 4; i++) {
    lines.push(node('div', { style: {
      position: 'absolute', left: '12px', right: '12px', top: (14 + i * 15) + 'px',
      height: '5px', borderRadius: '3px', background: 'rgba(22,67,86,.24)',
    }}, lid));
  }

  return { g, inner, head, body, lid, lines };
}

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(170deg, #FBFDFE 0%, #E4EEF3 100%)',
  }}, root);

  labels.push(panelLabel(root, 'OUT TODAY', 150, 384));
  labels.push(panelLabel(root, 'ON THE TEAM', 1560, 384));

  a = seated(root, 120, 560, false);
  b = seated(root, 1444, 560, true);

  oooBadge = node('div', { style: {
    position: 'absolute', left: '146px', top: '428px', opacity: 0,
    transformOrigin: '10% 120%',
  }}, root);
  chip(oooBadge, 'Out of office', 'closed', 24);

  /* The same ticket as Scene 5, deliberately. */
  ticket = ticketCard(root, {
    x: 610, y: 208, w: 700,
    title: 'Access to a system', ref: '#1042',
  });

  /* --- the audit beat ---------------------------------------------- */
  /* A printable page of the same history, with a stamp. It sits exactly
     where the ticket is, so it reads as the same record in another form
     rather than as a different object. */
  doc = node('div', { style: {
    position: 'absolute', left: '838px', top: '196px', width: '628px',
    background: '#fff', borderRadius: '6px', padding: '34px 38px 92px',
    boxShadow: '0 30px 72px rgba(14,46,60,.26)', opacity: 0,
    transformOrigin: '50% 30%',
  }}, root);
  node('div', { text: 'REQUEST RECORD  ·  #1042', style: {
    fontSize: '16px', letterSpacing: '.16em', color: 'rgba(14,46,60,.52)',
    fontWeight: 700, marginBottom: '6px',
  }}, doc);
  node('div', { text: 'Access to a system', style: {
    fontSize: '28px', fontWeight: 700, color: NAVY, marginBottom: '20px',
  }}, doc);
  ['Received', 'Assigned to the team', 'Note added', 'Reply sent',
   'Picked up by a teammate', 'Resolved'].forEach(txt => {
    const r = node('div', { style: {
      display: 'flex', justifyContent: 'space-between',
      padding: '9px 0', borderBottom: '1px solid rgba(22,67,86,.09)',
    }}, doc);
    node('div', { text: txt, style: {
      fontSize: '20px', color: 'rgba(14,46,60,.72)',
    }}, r);
    node('div', { text: '\u2014', style: {
      fontSize: '20px', color: 'rgba(14,46,60,.34)',
    }}, r);
  });
  node('div', { text: 'Start to finish. Every action attributable.', style: {
    marginTop: '18px', fontSize: '19px', color: 'rgba(14,46,60,.50)',
  }}, doc);

  stamp = node('div', { text: 'COMPLETE RECORD', style: {
    position: 'absolute', right: '40px', bottom: '26px',
    padding: '10px 18px', border: '3px solid rgba(180,98,47,.72)',
    borderRadius: '8px', color: 'rgba(164,88,41,.86)',
    fontSize: '22px', fontWeight: 800, letterSpacing: '.08em',
    transform: 'rotate(-7deg) scale(1.6)', opacity: 0,
  }}, doc);

  /* --- lines ------------------------------------------------------- */
  onscreen = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '88px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'The request stays with the team.', style: {
    fontSize: '46px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, onscreen);

  closing = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '862px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'Not harder \u2014 easier, together.', style: {
    fontSize: '34px', fontWeight: 600, color: 'rgba(14,46,60,.66)',
  }}, closing);

  /* --- transition: the record reaches toward ClickUp ---------------- */
  linkSvg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, root);
  Object.assign(linkSvg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });
  link = svgNode('path', {
    d: 'M 1310 470 C 1420 470, 1470 470, 1560 470',
    fill: 'none', stroke: BLUE, 'stroke-width': 4,
    'stroke-dasharray': '10 12', 'stroke-opacity': 0,
  }, linkSvg);

  clickup = node('div', { style: {
    position: 'absolute', left: '1586px', top: '424px',
    padding: '20px 26px', background: '#fff', borderRadius: '14px',
    boxShadow: '0 18px 44px rgba(14,46,60,.18)', opacity: 0,
    fontSize: '24px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, root);
  clickup.textContent = 'Project work';

  cc = makeCaptions(root);
  return { cc };
}

export function render(t) {
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 29.5, dur));

  labels.forEach((l, i) => { l.style.opacity = stagger(t, 0.6, 0.2, 0.5, i) * 0.9; });

  /* --- both desks -------------------------------------------------- */
  const ai = easeOut(span(t, T.deskIn, T.deskIn + 1.0));
  const bi = easeOut(span(t, T.deskIn + 0.25, T.deskIn + 1.25));
  a.g.style.opacity = ai;
  b.g.style.opacity = bi;
  a.g.style.transform = `translateY(${lerp(20, 0, ai)}px) scale(1.24)`;
  b.g.style.transform = `translateY(${lerp(20, 0, bi)}px) scale(1.24)`;

  /* --- one of them is out ------------------------------------------ */
  const oo = span(t, T.ooo, T.ooo + 0.5);
  oooBadge.style.opacity = oo;
  oooBadge.style.transform = `scale(${lerp(0.72, 1, easeBack(oo))})`;

  const lv = easeInOut(span(t, T.leave, T.leave + 1.2));
  /* The chair empties. A faint ghost rather than nothing: removing them
     entirely reads as a deleted element, not as someone who is out. */
  a.head.style.opacity = String(lerp(1, 0.16, lv));
  a.body.style.opacity = String(lerp(1, 0.16, lv));
  a.lines.forEach(ln => { ln.style.opacity = String(lerp(1, 0.3, lv)); });

  /* --- the ticket goes to the teammate ----------------------------- */
  const tk = span(t, 1.10, 1.90);
  ticket.el.style.opacity = tk;
  const sl = easeInOut(span(t, T.slide, T.slide + 1.3));
  ticket.el.style.transform = `translateX(${lerp(0, 190, sl)}px)`;

  /* their assignee row swaps over as it lands */
  ticket.rows.owner.style.opacity = String(span(t, 1.6, 2.1));
  ticket.rows.status.style.opacity = String(span(t, 1.9, 2.4));
  ticket.rows.due.style.opacity = String(span(t, 2.2, 2.7));

  /* history and notes, one at a time */
  ticket.hist.style.opacity = String(span(t, T.history, T.history + 0.5));
  ticket.histRows.forEach((r, i) => {
    r.style.opacity = String(stagger(t, T.history + 0.2, 0.75, 0.5, i));
  });

  /* the teammate leans in and their screen wakes */
  const ln = easeOut(span(t, T.lean, T.lean + 0.9));
  b.body.style.transform = `rotate(${lerp(0, -3.5, ln)}deg)`;
  b.head.style.transform = `rotate(${lerp(0, -6, ln)}deg)`;
  b.lines.forEach((l, i) => {
    l.style.background = `rgba(0,134,177,${lerp(0.24, 0.55, ln)})`;
  });

  /* --- the audit beat, about three seconds -------------------------- */
  const dIn = span(t, T.doc, T.doc + 0.5);
  const dOut = span(t, T.docOut, T.docOut + 0.6);
  doc.style.opacity = dIn * (1 - dOut);
  doc.style.transform =
    `translateY(${lerp(18, 0, easeOut(dIn))}px) scale(${lerp(0.95, 1, easeOut(dIn))})`;
  const st = span(t, T.stamp, T.stamp + 0.35);
  stamp.style.opacity = String(st * (1 - dOut));
  stamp.style.transform = `rotate(-7deg) scale(${lerp(1.6, 1, easeOut(st))})`;
  /* the ticket dims under the page, then comes back */
  ticket.el.style.opacity = String(tk * lerp(1, 0.25, dIn * (1 - dOut)));

  /* --- lines -------------------------------------------------------- */
  const ou = span(t, 1.60, 2.30);
  onscreen.style.opacity = ou * (1 - span(t, T.handoff, T.handoff + 0.6));
  onscreen.style.transform = `translateY(${lerp(-14, 0, easeOut(ou))}px)`;

  const cl = span(t, T.line, T.line + 0.8);
  closing.style.opacity = cl * (1 - span(t, T.handoff, T.handoff + 0.6));
  closing.style.transform = `translateY(${lerp(16, 0, easeOut(cl))}px)`;

  /* --- transition --------------------------------------------------- */
  /* Scene 10 opens on the integration, so the record reaches out to it. */
  const ho = span(t, T.handoff, dur);
  link.setAttribute('stroke-opacity', String(Math.min(1, ho * 2) * 0.9));
  clickup.style.opacity = String(span(t, T.handoff + 0.3, T.handoff + 1.0));
  clickup.style.transform =
    `translateX(${lerp(24, 0, easeOut(span(t, T.handoff + 0.3, T.handoff + 1.0)))}px)`;

  cc.update(t, CUES);
  return null;
}

export { CUES };
