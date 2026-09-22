/* ===================================================================
   sec08 — "Visibility"                                          60.0s

   Adapted from scene08. A manager stands beside an empty dashboard
   frame; the frame fills with six tile outlines, and each of Ava's six
   questions lights its tile and runs its number up on the phrase. The
   workload tile is a small per-person bar chart: one bar turns amber on
   "bottlenecks" and the work spreads across the team on "move
   resources". Then the dashboard shrinks and rises to make room for the
   two option cards, which are identical in size and weight and stay
   that way — a check lands on BOTH at once, and nothing chooses.

   Every figure here is invented and the panel says so on its face
   ("Sample figures") for the whole section. No names, no team names.

   Every number below is read from data/cues-sec08.json /
   data/words-sec08.json (where Ava actually says the phrase) and kept
   as a constant so the beat can be re-timed in one place.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, figure, edges,
  node, svgNode, span, lerp, easeOut, easeInOut, easeBack, NAVY, BLUE, INK, INK_SOFT,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';
import { chip } from '../lib/ui.js';

export const id = 'sec08';
export const title = 'Visibility';
export const dur = 60.4;
export const visemes = null;

const CUES = loadCues('data/cues-sec08.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  cardOut:   3.28,   // title card (hold 2.60 + 0.60 out) has left the frame
  frameIn:   3.28,   // "visibility for the people leading" -> manager + empty frame
  tiles:     5.99,   // "dashboards"                        -> six tile outlines
  chipIn:    6.61,   // "that show"                         -> "Sample figures" chip
  glance:    8.93,   // "glance"                            -> manager looks at it
  q1:        10.33,   // "How many requests are open?"       -> Open
  q2:       12.40,   // "How many are waiting on the customer?" -> Waiting on customer
  q3:       14.58,   // "How many have been closed?"        -> Closed
  q4:       16.47,   // "How much work does each person have?" -> Workload bars
  q5:       19.10,   // "Are requests being answered within…"  -> Response within target
  q6:       22.48,   // "And are they being resolved within…"  -> Resolution within target
  armDown:  26.04,   // "That visibility gives managers"    -> arm relaxes
  line1:    30.13,   // "a clear picture"                   -> on-screen line
  line1Out: 41.89,   // just before the dashboard rises
  spot:     34.05,   // "bottlenecks"                       -> one bar turns amber
  issues:   34.87,   // "workload issues"                   -> second nudge
  spread:   37.40,   // "move resources"                    -> the work redistributes
  settled:  38.79,   // "needed"                            -> amber gone
  shrink:   42.14,   // "establish measurable"              -> dashboard shrinks and rises
  optA:     45.40,   // "Maybe that's a common standard"    -> option card A
  optB:     48.64,   // "Maybe each team has its own SLA"   -> option card B
  check:    54.18,   // "either approach"                   -> a check on BOTH at once
  back:     55.63,   // "The important part"                -> dashboard returns behind
  line2:    57.93,   // "actually see the results"          -> on-screen line
};

/* Illustrative. Every value invented; the panel is labelled as such. */
const TILES = [
  { t: T.q1, label: 'Open',                     to: 24 },
  { t: T.q2, label: 'Waiting on customer',      to:  9 },
  { t: T.q3, label: 'Closed',                   to: 57 },
  { t: T.q4, label: 'Workload',                 bars: true },
  { t: T.q5, label: 'Response within target',   to: 92, pct: true },
  { t: T.q6, label: 'Resolution within target', to: 88, pct: true },
];

/* One person carrying far more than the rest, then the work spread out. */
const LOAD_BEFORE = [4, 6, 13, 5, 3];
const LOAD_AFTER  = [6, 7,  7, 7, 4];
const LOAD_MAX = 14;
const HOT = 2;                       // the bar that becomes the bottleneck
const AMBER = [196, 122, 52];        // the one warning colour in the film
const BLUE_RGB = [0, 134, 177];

/* Two cards, identical size and weight. Nothing here recommends either. */
const OPTIONS = [
  { t: T.optA, x: 190, kicker: 'OPTION A', title: 'One standard across the bank',
    body: 'The same service target for every team.' },
  { t: T.optB, x: 990, kicker: 'OPTION B', title: 'Each team sets its own',
    body: 'Fitted to the kind of work that team does.' },
];

/* dashboard geometry */
const SHELL = { x: 420, y: 140, w: 1370, h: 620 };
const TILE  = { w: 419, h: 236, gap: 20, x0: 36, y0: 92 };

let root, card, cc, shell, sample, mgr,
    tileEls = [], tileNums = [], tileLabels = [],
    bars = [], barWraps = [], optionEls = [], checks = [],
    line1, line2;

export function build(container) {
  root = container;
  paper(root);

  /* --- dashboard shell --------------------------------------------- */
  shell = node('div', { style: {
    position: 'absolute', left: SHELL.x + 'px', top: SHELL.y + 'px',
    width: SHELL.w + 'px', height: SHELL.h + 'px',
    background: '#F7FBFC', borderRadius: '22px',
    border: '2px solid rgba(22,67,86,.14)',
    boxShadow: '0 28px 68px rgba(14,46,60,.14)',
    boxSizing: 'border-box', opacity: 0, transformOrigin: '50% 0%',
  }}, root);

  node('div', { text: 'TEAM OVERVIEW', style: {
    position: 'absolute', left: '36px', top: '34px',
    fontSize: '17px', letterSpacing: '.18em', color: BLUE, fontWeight: 700,
  }}, shell);
  /* the build note asks for sample values to be clearly labelled — and
     the chip stays up for the whole section */
  sample = node('div', { style: { position: 'absolute', right: '36px', top: '24px', opacity: 0 }}, shell);
  chip(sample, 'Sample figures', 'closed', 18);

  /* --- six tiles: outlines first, lit one by one -------------------- */
  TILES.forEach((spec, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const tl = node('div', { style: {
      position: 'absolute',
      left: (TILE.x0 + col * (TILE.w + TILE.gap)) + 'px',
      top:  (TILE.y0 + row * (TILE.h + TILE.gap)) + 'px',
      width: TILE.w + 'px', height: TILE.h + 'px', boxSizing: 'border-box',
      borderRadius: '15px', border: '2px dashed rgba(22,67,86,.22)',
      padding: '20px 22px', opacity: 0, transformOrigin: '50% 50%',
    }}, shell);

    if (spec.bars) {
      /* label on top, five people underneath */
      const lab = node('div', { text: spec.label, style: {
        fontSize: '20px', color: INK_SOFT, lineHeight: 1.25, marginBottom: '14px',
      }}, tl);
      tileLabels.push(lab);
      tileNums.push(null);

      const barRow = node('div', { style: {
        display: 'flex', gap: '18px', alignItems: 'flex-end', height: '150px',
      }}, tl);
      LOAD_BEFORE.forEach(() => {
        const colEl = node('div', { style: {
          flex: '1 1 0', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px', transformOrigin: '50% 100%',
        }}, barRow);
        const track = node('div', { style: {
          width: '100%', height: '118px', display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center',
        }}, colEl);
        const b = node('div', { style: {
          width: '44px', height: '0%', borderRadius: '7px 7px 3px 3px', background: BLUE,
        }}, track);
        node('div', { style: {
          width: '22px', height: '22px', borderRadius: '50%',
          background: 'rgba(22,67,86,.20)', flex: '0 0 auto',
        }}, colEl);
        bars.push(b); barWraps.push(colEl);
      });
    } else {
      const n = node('div', { text: spec.pct ? '0%' : '0', style: {
        fontSize: '64px', fontWeight: 700, lineHeight: 1.05, color: NAVY,
        fontVariantNumeric: 'tabular-nums', opacity: 0,
      }}, tl);
      const lab = node('div', { text: spec.label, style: {
        marginTop: '10px', fontSize: '20px', color: INK_SOFT, lineHeight: 1.25,
      }}, tl);
      tileNums.push(n);
      tileLabels.push(lab);
    }
    tileEls.push(tl);
  });

  /* --- the manager, beside the frame -------------------------------- */
  mgr = figure(root, { x: 150, y: 330, h: 300, label: 'Manager' });

  /* --- on-screen lines ---------------------------------------------- */
  line1 = onScreen(root, { text: "A clear picture while it's happening.", y: 800, size: 46,
                           t0: T.line1, t1: T.line1Out });

  /* --- two cards, identical weight ---------------------------------- */
  OPTIONS.forEach(o => {
    const el = node('div', { style: {
      position: 'absolute', left: o.x + 'px', top: '470px',
      width: '740px', height: '190px', boxSizing: 'border-box',
      background: '#fff', borderRadius: '18px',
      padding: '26px 30px', opacity: 0,
      border: '2px solid rgba(0,134,177,.22)',
      boxShadow: '0 18px 44px rgba(14,46,60,.14)',
    }}, root);
    node('div', { text: o.kicker, style: {
      fontSize: '16px', letterSpacing: '.18em', color: BLUE,
      fontWeight: 700, marginBottom: '12px',
    }}, el);
    node('div', { text: o.title, style: {
      fontSize: '32px', fontWeight: 700, color: NAVY, marginBottom: '10px',
    }}, el);
    node('div', { text: o.body, style: {
      fontSize: '22px', lineHeight: 1.4, color: INK,
    }}, el);
    /* the check: same size, same moment, on both */
    const ck = svgNode('svg', { viewBox: '0 0 24 24', width: 40, height: 40 }, el);
    Object.assign(ck.style, { position: 'absolute', right: '26px', top: '24px', opacity: 0,
                              transformOrigin: '50% 50%' });
    svgNode('circle', { cx: 12, cy: 12, r: 11, fill: BLUE }, ck);
    svgNode('path', { d: 'M6.5 12.5l3.5 3.5 7.5-8', fill: 'none', stroke: '#fff',
      'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck);
    optionEls.push(el);
    checks.push(ck);
  });

  line2 = onScreen(root, { text: 'Either way, you can see the results.', y: 720, size: 46, t0: T.line2 });

  card = titleCard(root, { n: 8, title: 'Visibility' });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* --- manager and the empty frame ------------------------------------ */
  const fi = span(t, T.frameIn, T.frameIn + 0.8);
  const mgrOut = span(t, T.shrink, T.shrink + 0.7);
  const glance = easeOut(span(t, T.glance, T.glance + 0.5));
  const point = easeInOut(span(t, T.q1 - 0.3, T.q1 + 0.3)) * (1 - easeInOut(span(t, T.armDown, T.armDown + 0.8)));
  mgr.set({ opacity: fi * (1 - mgrOut), headTilt: 8 * glance, armR: 34 * point });

  /* --- shell: in, then shrinks and rises, then returns behind ---------- */
  const q = easeInOut(span(t, T.shrink, T.shrink + 1.2));
  const r = easeInOut(span(t, T.back, T.back + 1.1));
  const ty = lerp(lerp(lerp(24, 0, easeOut(fi)), -95, q), 60, r);
  const sc = lerp(lerp(1, 0.55, q), 0.80, r);
  /* back as a backdrop: large, behind the two cards, faint enough that
     the cards stay the subject */
  shell.style.opacity = String(fi * lerp(1, 0.40, r));
  shell.style.transform = `translateY(${ty}px) scale(${sc})`;

  /* --- six outlines, then the chip ------------------------------------- */
  tileEls.forEach((tl, i) => {
    const o = stagger(t, T.tiles, 0.12, 0.4, i);
    const u = span(t, TILES[i].t, TILES[i].t + 0.45);
    tl.style.opacity = String(o);
    tl.style.transform = `translateY(${lerp(10, 0, easeOut(o))}px) scale(${lerp(1, 1.02, pulse(u))})`;
    tl.style.background = `rgba(255,255,255,${u})`;
    tl.style.borderColor = `rgba(22,67,86,${.22 * (1 - u)})`;
    tl.style.borderStyle = u > 0.5 ? 'solid' : 'dashed';
    tl.style.boxShadow = `0 10px 26px rgba(14,46,60,${(.10 * u).toFixed(3)})`;
    tileLabels[i].style.color = u > 0.5 ? INK : INK_SOFT;
  });
  sample.style.opacity = String(span(t, T.chipIn, T.chipIn + 0.5));

  /* --- the count runs up on each question ------------------------------ */
  TILES.forEach((spec, i) => {
    if (!tileNums[i]) return;
    const c = easeOut(span(t, spec.t + 0.1, spec.t + 0.9));
    tileNums[i].style.opacity = String(span(t, spec.t, spec.t + 0.3));
    tileNums[i].textContent = String(Math.round(spec.to * c)) + (spec.pct ? '%' : '');
  });

  /* --- workload: grow, bottleneck, spread ------------------------------ */
  const grow = easeOut(span(t, T.q4 + 0.1, T.q4 + 1.0));
  const spread = easeInOut(span(t, T.spread, T.spread + 1.5));
  bars.forEach((b, i) => {
    const v = lerp(LOAD_BEFORE[i], LOAD_AFTER[i], spread);
    b.style.height = (grow * (v / LOAD_MAX) * 100) + '%';
  });
  const spot = span(t, T.spot, T.spot + 0.5) * (1 - span(t, T.settled - 0.6, T.settled + 0.2));
  bars[HOT].style.background = spot > 0.02
    ? `rgb(${BLUE_RGB.map((c, k) => Math.round(lerp(c, AMBER[k], spot))).join(',')})`
    : BLUE;
  const nudge = pulse(span(t, T.spot, T.spot + 0.7)) + pulse(span(t, T.issues, T.issues + 0.7));
  barWraps[HOT].style.transform = `scale(${1 + nudge * 0.05})`;
  /* the people who take some of it acknowledge it */
  [0, 1, 3, 4].forEach((i, k) => {
    barWraps[i].style.transform =
      `scale(${1 + pulse(span(t, T.spread + 0.3 + k * 0.12, T.spread + 1.0 + k * 0.12)) * 0.04})`;
  });

  /* --- the open question ----------------------------------------------- */
  OPTIONS.forEach((o, i) => {
    const u = span(t, o.t, o.t + 0.6);
    optionEls[i].style.opacity = String(u);
    optionEls[i].style.transform =
      `translateY(${lerp(22, 0, easeOut(u))}px) scale(${lerp(0.95, 1, easeBack(u))})`;
  });
  const ck = span(t, T.check, T.check + 0.45);
  checks.forEach(c => {
    c.style.opacity = String(ck);
    c.style.transform = `scale(${lerp(0.4, 1, easeBack(ck))})`;
  });

  line1.update(t);
  line2.update(t);

  cc.update(t, CUES);
  return `frame ${fi.toFixed(2)} shrink ${q.toFixed(2)} back ${r.toFixed(2)}`;
}
