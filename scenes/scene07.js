/* ===================================================================
   SCENE 7 — "Thirty seconds that save time"             2:36 – 2:54

   Two paths, same request. One spends thirty seconds up front; the other
   spends the afternoon finding out what the first one already said.

   This pays off Scene 3 directly — the email round-trip there was
   "Which system?" and the form here has Application as a required
   field, which is the same problem solved at the other end.

   Build note honoured: no claimed time saving. The upper path carries a
   specific, honest "+30 seconds" because that is what the narration
   says. The lower path gets a clock with moving hands and no number on
   it, so the contrast is visual rather than a metric anyone could
   dispute.
=================================================================== */

import {
  node, svgNode, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeIn, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';
import { chip, panelLabel } from '../lib/ui.js';

export const id = 'scene07';
export const title = 'Thirty seconds that save time';
export const dur = 18.0;
export const visemes = null;

const CUES = [
  [0.30,  5.80, "Sometimes giving us the right information up front takes an extra thirty seconds."],
  [6.00, 10.80, "But that small step can prevent a much longer email exchange."],
  [11.20,12.40, "Less back-and-forth."],
  [12.60,13.80, "Less waiting."],
  [14.00,16.00, "Faster answers."],
];

/* The three required fields, in the platform's own words. */
const FIELDS = [
  { t: 1.90, label: 'Group' },
  { t: 2.75, label: 'Application' },
  { t: 3.60, label: 'Request type' },
];

/* Five messages that only exist because the first one was vague. */
const NOTES = [6.30, 7.20, 8.10, 9.00, 9.90];

const GAINS = [
  { t: 11.25, text: 'Less back-and-forth' },
  { t: 12.65, text: 'Less waiting' },
  { t: 14.05, text: 'Faster answers' },
];

const TRACK = { x0: 780, x1: 1470 };
const LANE_A = 348;      // with the details
const LANE_B = 738;      // without them

const T = {
  lanesIn:  0.25,
  fastGo:   4.60,        // the detailed request starts moving
  fastDone: 7.40,
  slowGo:   6.30,        // the vague one starts, and crawls
  slowDone: 15.30,
  line:     10.90,
  handoff:  16.40,       // the tick becomes a dashboard tile
};

let root, labels = [], form, fieldEls = [], badge, notes = [], clock,
    dotA, dotB, tickA, tickB, gains = [], onscreen, tile, cc;

function track(parent, y) {
  const el = node('div', { style: {
    position: 'absolute', left: TRACK.x0 + 'px', top: y + 'px',
    width: (TRACK.x1 - TRACK.x0) + 'px', height: '6px', borderRadius: '3px',
    background: 'rgba(22,67,86,.12)', opacity: 0,
  }}, parent);
  const fill = node('div', { style: {
    position: 'absolute', left: 0, top: 0, height: '6px', width: '0%',
    borderRadius: '3px', background: BLUE,
  }}, el);
  return { el, fill };
}

function tickMark(parent, x, y) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '96px', height: '96px', opacity: 0, transformOrigin: '50% 50%',
  }}, parent);
  const svg = svgNode('svg', { viewBox: '0 0 64 64', width: 96, height: 96 }, g);
  svgNode('circle', { cx: 32, cy: 32, r: 27, fill: 'rgba(0,134,177,.10)',
    stroke: BLUE, 'stroke-width': 4 }, svg);
  const p = svgNode('path', { d: 'M20 33l9 9 16-18', fill: 'none', stroke: BLUE,
    'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'stroke-dasharray': 44, 'stroke-dashoffset': 44 }, svg);
  g.tick = p;
  return g;
}

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(170deg, #FBFDFE 0%, #E5EFF4 100%)',
  }}, root);

  /* faint band behind the upper lane, so the two read as compared */
  node('div', { style: {
    position: 'absolute', left: '90px', top: '206px',
    width: '1740px', height: '250px', borderRadius: '24px',
    background: 'rgba(0,134,177,.055)',
  }}, root);
  node('div', { style: {
    position: 'absolute', left: '90px', top: '596px',
    width: '1740px', height: '250px', borderRadius: '24px',
    background: 'rgba(22,67,86,.038)',
  }}, root);

  labels.push(panelLabel(root, 'WITH THE DETAILS', 130, 172));
  labels.push(panelLabel(root, 'WITHOUT THEM', 130, 562));

  /* --- upper path: a short form ------------------------------------ */
  form = node('div', { style: {
    position: 'absolute', left: '140px', top: '246px', width: '560px',
    background: '#fff', borderRadius: '16px', padding: '20px 24px',
    boxShadow: '0 14px 34px rgba(14,46,60,.13)', opacity: 0,
  }}, root);
  FIELDS.forEach(f => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '9px 0', opacity: 0,
    }}, form);
    const box = node('div', { style: {
      width: '30px', height: '30px', borderRadius: '8px',
      background: 'rgba(0,134,177,.12)', flex: '0 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}, r);
    const sv = svgNode('svg', { viewBox: '0 0 24 24', width: 18, height: 18 }, box);
    svgNode('path', { d: 'M5 13l4 4 10-11', fill: 'none', stroke: BLUE,
      'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
    node('div', { text: f.label, style: {
      fontSize: '24px', fontWeight: 700, color: NAVY,
    }}, r);
    node('div', { text: 'required', style: {
      marginLeft: 'auto', fontSize: '17px', color: 'rgba(14,46,60,.42)',
    }}, r);
    fieldEls.push(r);
  });

  badge = node('div', { style: {
    marginTop: '12px', paddingTop: '14px',
    borderTop: '1px solid rgba(22,67,86,.10)', opacity: 0,
  }}, form);
  chip(badge, '+ 30 seconds', 'open', 22);

  /* --- lower path: messages that should not have been needed -------- */
  NOTES.forEach((_, i) => {
    const b = node('div', { style: {
      position: 'absolute', left: (140 + i * 106) + 'px',
      top: (i % 2 ? 690 : 636) + 'px',
      width: '96px', height: '58px', background: '#fff',
      borderRadius: '11px', opacity: 0,
      borderLeft: '5px solid ' + (i % 2 ? NAVY : 'rgba(22,67,86,.45)'),
      boxShadow: '0 8px 20px rgba(14,46,60,.13)',
    }}, root);
    /* two short lines, standing in for "another question" */
    for (let k = 0; k < 2; k++) {
      node('div', { style: {
        position: 'absolute', left: '16px', right: '14px',
        top: (18 + k * 14) + 'px', height: '6px', borderRadius: '3px',
        background: 'rgba(22,67,86,.22)',
      }}, b);
    }
    notes.push(b);
  });

  /* A clock with no numbers on it. The build note asks for contrast,
     not a metric. */
  const cw = node('div', { style: {
    position: 'absolute', left: '672px', top: '652px',
    width: '96px', height: '96px', opacity: 0,
  }}, root);
  const csvg = svgNode('svg', { viewBox: '0 0 96 96', width: 96, height: 96 }, cw);
  svgNode('circle', { cx: 48, cy: 48, r: 42, fill: '#fff',
    stroke: 'rgba(22,67,86,.22)', 'stroke-width': 5 }, csvg);
  const ch = svgNode('line', { x1: 48, y1: 48, x2: 48, y2: 26, stroke: NAVY,
    'stroke-width': 6, 'stroke-linecap': 'round' }, csvg);
  const cm = svgNode('line', { x1: 48, y1: 48, x2: 48, y2: 16, stroke: BLUE,
    'stroke-width': 4.5, 'stroke-linecap': 'round' }, csvg);
  svgNode('circle', { cx: 48, cy: 48, r: 5, fill: NAVY }, csvg);
  clock = { wrap: cw, hour: ch, min: cm };

  /* --- the race ---------------------------------------------------- */
  const trA = track(root, LANE_A + 10);
  const trB = track(root, LANE_B + 10);
  dotA = trA; dotB = trB;

  tickA = tickMark(root, TRACK.x1 + 40, LANE_A - 34);
  tickB = tickMark(root, TRACK.x1 + 40, LANE_B - 34);

  /* --- the three gains --------------------------------------------- */
  const gainRow = node('div', { style: {
    position: 'absolute', left: '0px', width: '1920px', top: '498px',
    display: 'flex', justifyContent: 'center', gap: '26px',
  }}, root);
  GAINS.forEach(g => {
    const el = node('div', { text: g.text, style: {
      padding: '11px 24px', borderRadius: '999px', background: '#fff',
      border: '2px solid rgba(0,134,177,.30)',
      fontSize: '25px', fontWeight: 700, color: BLUE, opacity: 0,
    }}, gainRow);
    gains.push(el);
  });

  /* --- the line ---------------------------------------------------- */
  onscreen = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '82px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: '30 seconds now can save much more time later.', style: {
    fontSize: '46px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, onscreen);

  /* --- transition: the tick becomes a dashboard tile ---------------- */
  tile = node('div', { style: {
    position: 'absolute', left: '810px', top: '396px', width: '300px',
    background: '#fff', borderRadius: '18px', padding: '26px 30px',
    boxShadow: '0 26px 60px rgba(14,46,60,.22)', opacity: 0,
    textAlign: 'center', transformOrigin: '50% 50%',
  }}, root);
  node('div', { text: 'Closed', style: {
    fontSize: '20px', letterSpacing: '.14em', color: 'rgba(14,46,60,.5)',
    fontWeight: 700, marginBottom: '8px',
  }}, tile);
  node('div', { text: 'on time', style: {
    fontSize: '38px', fontWeight: 700, color: NAVY,
  }}, tile);

  cc = makeCaptions(root);
  return { cc };
}

export function render(t) {
  root.style.transform = `scale(${lerp(1.0, 1.025, easeInOut(span(t, 0, dur)))})`;
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 17.5, dur));

  labels.forEach((l, i) => { l.style.opacity = stagger(t, T.lanesIn, 0.18, 0.5, i) * 0.9; });
  dotA.el.style.opacity = String(span(t, T.lanesIn + 0.3, T.lanesIn + 0.9));
  dotB.el.style.opacity = String(span(t, T.lanesIn + 0.45, T.lanesIn + 1.05));

  /* --- the form fills ---------------------------------------------- */
  const fi = span(t, 1.30, 2.00);
  form.style.opacity = fi;
  form.style.transform = `translateY(${lerp(18, 0, easeOut(fi))}px)`;
  FIELDS.forEach((f, i) => {
    const u = span(t, f.t, f.t + 0.4);
    fieldEls[i].style.opacity = u;
    fieldEls[i].style.transform = `translateX(${lerp(-12, 0, easeOut(u))}px)`;
  });
  const bg = span(t, 4.10, 4.70);
  badge.style.opacity = bg;
  badge.firstChild.style.transform = `scale(${lerp(0.7, 1, easeBack(bg))})`;

  /* --- the detailed request goes straight through ------------------- */
  const fast = easeInOut(span(t, T.fastGo, T.fastDone));
  dotA.fill.style.width = (fast * 100) + '%';
  const tA = span(t, T.fastDone - 0.1, T.fastDone + 0.4);
  tickA.style.opacity = tA;
  tickA.style.transform = `scale(${lerp(0.7, 1, easeBack(tA))})`;
  tickA.tick.setAttribute('stroke-dashoffset',
    String(lerp(44, 0, easeOut(span(t, T.fastDone + 0.1, T.fastDone + 0.7)))));

  /* --- the vague one collects questions and crawls ------------------ */
  notes.forEach((b, i) => {
    const u = span(t, NOTES[i], NOTES[i] + 0.35);
    b.style.opacity = u;
    b.style.transform = `translateY(${lerp(14, 0, easeOut(u))}px)`;
  });
  clock.wrap.style.opacity = String(span(t, T.slowGo, T.slowGo + 0.5));
  /* hands turn steadily for the rest of the scene; no readout */
  const spin = span(t, T.slowGo, T.slowDone);
  clock.min.setAttribute('transform', `rotate(${spin * 1080} 48 48)`);
  clock.hour.setAttribute('transform', `rotate(${spin * 90} 48 48)`);

  const slow = easeInOut(span(t, T.slowGo + 0.4, T.slowDone));
  dotB.fill.style.width = (slow * 100) + '%';
  const tB = span(t, T.slowDone - 0.1, T.slowDone + 0.4);
  tickB.style.opacity = tB;
  tickB.style.transform = `scale(${lerp(0.7, 1, easeBack(tB))})`;
  tickB.tick.setAttribute('stroke-dashoffset',
    String(lerp(44, 0, easeOut(span(t, T.slowDone + 0.1, T.slowDone + 0.7)))));

  /* --- the gains --------------------------------------------------- */
  GAINS.forEach((g, i) => {
    const u = span(t, g.t, g.t + 0.45);
    gains[i].style.opacity = u * (1 - span(t, T.handoff, T.handoff + 0.5));
    gains[i].style.transform = `scale(${lerp(0.82, 1, easeBack(u))})`;
  });

  /* --- the line ---------------------------------------------------- */
  const ou = span(t, T.line, T.line + 0.7);
  onscreen.style.opacity = ou * (1 - span(t, T.handoff, T.handoff + 0.5));
  onscreen.style.transform = `translateY(${lerp(-16, 0, easeOut(ou))}px)`;

  /* --- transition: the upper tick becomes a dashboard tile ---------- */
  /* Scene 8 opens on a dashboard, so the thing that finished on time
     turns into the tile that reports it. */
  const ho = span(t, T.handoff, dur);
  const h = easeInOut(ho);
  tile.style.opacity = Math.min(1, ho * 2);
  tile.style.transform = `scale(${lerp(0.5, 1, easeBack(h))})`;
  tickA.style.opacity = String(tA * (1 - Math.min(1, ho * 2.2)));
  [form, badge, clock.wrap, dotA.el, dotB.el, tickB].forEach(el => {
    el.style.opacity = String(parseFloat(el.style.opacity || '1') * (1 - h));
  });
  notes.forEach((b, i) => {
    b.style.opacity = String(span(t, NOTES[i], NOTES[i] + 0.35) * (1 - h));
  });
  labels.forEach((l, i) => {
    l.style.opacity = String(stagger(t, T.lanesIn, 0.18, 0.5, i) * 0.9 * (1 - h));
  });

  cc.update(t, CUES);
  return null;
}

export { CUES };
