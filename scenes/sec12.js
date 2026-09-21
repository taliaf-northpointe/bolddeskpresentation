/* ===================================================================
   sec12 — "Why it matters"                                    31.6s

   Script card: "CUT TO: Customer / sales / employee animation" — no
   title card. Fades up on the connected path from scene12 (Someone asks
   -> The team -> A colleague -> Their customer). Two email icons appear
   on the path and fade — this is not about them. Two "It's about..."
   fragments land under the path, one per phrase. Then the path
   slides left and the four customer types return around its last node
   on their words, before everything recedes behind one line.

   Every number in T is read from data/words-sec12.json /
   data/cues-sec12.json and kept as a constant, commented with the
   phrase, so a beat can be re-timed in one place.
=================================================================== */

import {
  paper, loadCues, captions, onScreen, edges,
  node, svgNode, span, lerp, easeOut, easeInOut, easeBack, NAVY, BLUE, INK,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';

export const id = 'sec12';
export const title = 'Why it matters';
export const dur = 31.6;
export const visemes = null;

const CUES = loadCues('data/cues-sec12.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  pathIn:   0.6,    // "And I'll come back"            -> the path fades up
  mailIn:   5.60,   // "moving emails" (5.76)          -> two envelopes on the path
  mailOut:  7.30,   // "another"                       -> and they fade
  lines: [
    8.30,           // "It's about making it easier for people to get help."
    11.37,          // "And ultimately, it's about helping the people who serve our customers..."
  ],
  shift:    17.66,  // "Because whether"               -> list clears, path slides left
  cards: [
    19.63,          // "borrower"
    21.00,          // "business partner"
    22.92,          // "retail customer"
    25.51,          // "Northpointe employee"
  ],
  line:     28.00,  // "we all play a part" (28.18)    -> the closing line, all else recedes
};

/* Generic roles. No team is named anywhere in this film. */
const PATH = ['Someone asks', 'The team', 'A colleague', 'Their customer'];
const START_X = 480, GAP_X = 320, PATH_Y = 400, NODE_W = 260;
const SHIFT_X = -160;                  // room for the cards on the right
const nodeX = i => START_X + i * GAP_X;

/* Short fragments, never the sentence. */
const LINES = [
  'Easier to get help',
  'Serving customers better',
];
const LIST_X = 720, LIST_Y = 560, LIST_STEP = 72;

/* The four customer types, back around the last node. */
const CARDS = [
  { label: 'Borrower',             glyph: 'house',     dx: -176, dy: -170 },
  { label: 'Business partner',     glyph: 'briefcase', dx:  176, dy: -170 },
  { label: 'Retail customer',      glyph: 'card',      dx: -176, dy:  170 },
  { label: 'Northpointe employee', glyph: 'badge',     dx:  176, dy:  170 },
];
const CARD_W = 332, CARD_H = 104;

let root, cc, pathWrap, pathSvg, pathNodes = [], pathLinks = [], mails = [],
    listEls = [], cards = [], line;

/* ---------- glyphs: one stroke colour, inherited from the <g> ------ */
function glyph(parent, kind, size = 44) {
  const svg = svgNode('svg', { viewBox: '0 0 64 64', width: size, height: size }, parent);
  Object.assign(svg.style, { flex: '0 0 auto' });
  const g = svgNode('g', { fill: 'none', stroke: BLUE, 'stroke-width': 3.6,
                           'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  if (kind === 'briefcase') {
    svgNode('rect', { x: 10, y: 22, width: 44, height: 30, rx: 5 }, g);
    svgNode('path', { d: 'M24 22 V16 a3 3 0 0 1 3 -3 h10 a3 3 0 0 1 3 3 V22 M10 36 H54' }, g);
  } else if (kind === 'house') {
    svgNode('path', { d: 'M8 33 L32 12 L56 33' }, g);
    svgNode('path', { d: 'M14 29 V52 H50 V29' }, g);
    svgNode('path', { d: 'M27 52 V40 H37 V52' }, g);
  } else if (kind === 'card') {
    svgNode('rect', { x: 8, y: 16, width: 48, height: 32, rx: 5 }, g);
    svgNode('path', { d: 'M8 27 H56' }, g);
    svgNode('path', { d: 'M15 40 H27' }, g);
  } else if (kind === 'badge') {
    svgNode('rect', { x: 16, y: 14, width: 32, height: 40, rx: 5 }, g);
    svgNode('path', { d: 'M28 14 V8 H36 V14' }, g);
    svgNode('circle', { cx: 32, cy: 30, r: 6 }, g);
    svgNode('path', { d: 'M22 46 Q32 36 42 46' }, g);
  }
  return g;
}

function envelope(parent, cx, cy) {
  const g = svgNode('g', { opacity: 0 }, parent);
  svgNode('rect', { x: cx - 26, y: cy - 18, width: 52, height: 36, rx: 6,
    fill: '#fff', stroke: BLUE, 'stroke-width': 3 }, g);
  svgNode('path', { d: `M ${cx - 26} ${cy - 14} L ${cx} ${cy + 4} L ${cx + 26} ${cy - 14}`,
    fill: 'none', stroke: BLUE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  g.style.transformOrigin = `${cx}px ${cy}px`;
  return g;
}

/* ---------- build -------------------------------------------------- */
export function build(container) {
  root = container;
  paper(root);

  /* everything on the path lives in one wrapper so it can slide as one */
  pathWrap = node('div', { style: { position: 'absolute', inset: 0, opacity: 0,
                                     transformOrigin: '50% 50%' }}, root);

  pathSvg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, pathWrap);
  Object.assign(pathSvg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });

  PATH.forEach((label, i) => {
    const x = nodeX(i);
    if (i > 0) {
      pathLinks.push(svgNode('line', {
        x1: x - GAP_X + NODE_W / 2 + 2, y1: PATH_Y, x2: x - NODE_W / 2 - 2, y2: PATH_Y,
        stroke: BLUE, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-opacity': 0,
      }, pathSvg));
    }
  });
  /* the emails hover just above the first two links */
  mails.push(envelope(pathSvg, nodeX(0) + GAP_X / 2, PATH_Y - 78));
  mails.push(envelope(pathSvg, nodeX(1) + GAP_X / 2, PATH_Y - 78));

  PATH.forEach((label, i) => {
    const x = nodeX(i);
    const el = node('div', { text: label, style: {
      position: 'absolute', left: (x - NODE_W / 2) + 'px', top: (PATH_Y - 37) + 'px',
      width: NODE_W + 'px', padding: '22px 0', textAlign: 'center', boxSizing: 'border-box',
      background: '#fff', borderRadius: '16px', opacity: 0,
      border: '3px solid rgba(22,67,86,.08)',
      boxShadow: '0 16px 40px rgba(14,46,60,.14)',
      fontSize: '25px', fontWeight: 700, color: NAVY, transformOrigin: '50% 50%',
    }}, pathWrap);
    pathNodes.push(el);
  });

  /* the four customer types, around the last node */
  CARDS.forEach((c, i) => {
    const cx = nodeX(3) + c.dx, cy = PATH_Y + c.dy;
    const el = node('div', { style: {
      position: 'absolute', left: (cx - CARD_W / 2) + 'px', top: (cy - CARD_H / 2) + 'px',
      width: CARD_W + 'px', height: CARD_H + 'px', boxSizing: 'border-box',
      background: '#fff', borderRadius: '16px', border: '3px solid rgba(0,134,177,.22)',
      boxShadow: '0 14px 34px rgba(14,46,60,.12)', opacity: 0,
      display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px',
      transformOrigin: '50% 50%',
    }}, pathWrap);
    glyph(el, c.glyph, 44);
    node('div', { text: c.label, style: {
      fontSize: '21px', fontWeight: 700, color: NAVY, lineHeight: 1.15, whiteSpace: 'nowrap',
    }}, el);
    el.fromX = nodeX(3) - cx;
    el.fromY = PATH_Y - cy;
    cards.push(el);
  });

  /* the two fragments, stacked under the path */
  LINES.forEach((txt, i) => {
    const el = node('div', { style: {
      position: 'absolute', left: LIST_X + 'px', top: (LIST_Y + i * LIST_STEP) + 'px',
      display: 'flex', alignItems: 'center', gap: '18px', opacity: 0,
    }}, root);
    node('div', { style: {
      width: '14px', height: '14px', borderRadius: '50%', background: BLUE, flex: '0 0 auto',
    }}, el);
    node('div', { text: txt, style: {
      fontSize: '38px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
    }}, el);
    listEls.push(el);
  });

  line = onScreen(root, { text: 'We all play a part in the customer experience.',
                          x: 960, y: 700, size: 56, width: 1600, t0: T.line });

  cc = captions(root);
  return { cc };
}

/* ---------- render -------------------------------------------------- */
export function render(t) {
  edges(root, t, dur);

  /* the path fades up, slides left for the cards, recedes for the line */
  const pin = span(t, T.pathIn, T.pathIn + 0.8);
  const shift = easeInOut(span(t, T.shift, T.shift + 0.9));
  const recede = easeInOut(span(t, T.line, T.line + 0.9));
  pathWrap.style.opacity = String(pin * lerp(1, 0.22, recede));
  pathWrap.style.transform = `translateX(${SHIFT_X * shift}px) scale(${lerp(1, 0.97, recede)})`;

  pathNodes.forEach((el, i) => {
    const u = stagger(t, T.pathIn, 0.28, 0.5, i);
    let sc = lerp(0.9, 1, easeBack(u));
    /* the last node takes the accent as the customers gather round it */
    const acc = span(t, T.cards[0] - 0.4, T.cards[0] + 0.2);
    if (i === 3) {
      sc *= 1 + 0.04 * acc;
      el.style.border = acc > 0.5 ? '3px solid ' + BLUE : '3px solid rgba(22,67,86,.08)';
      el.style.color = acc > 0.5 ? BLUE : NAVY;
    }
    el.style.opacity = u;
    el.style.transform = `translateY(${lerp(18, 0, easeOut(u))}px) scale(${sc})`;
  });
  pathLinks.forEach((ln, i) => {
    const u = stagger(t, T.pathIn + 0.30, 0.28, 0.45, i);
    ln.setAttribute('stroke-opacity', String(u * 0.85));
  });

  /* two emails move along the path a little, then fade: not about them */
  mails.forEach((g, i) => {
    const u = span(t, T.mailIn + i * 0.25, T.mailIn + i * 0.25 + 0.4);
    const slide = easeInOut(span(t, T.mailIn, T.mailOut));
    const out = span(t, T.mailOut, T.mailOut + 0.7);
    g.setAttribute('opacity', String(u * (1 - out)));
    g.style.transform =
      `translate(${lerp(-36, 36, slide)}px, ${lerp(0, 14, easeOut(out))}px) scale(${lerp(0.7, 1, easeBack(u)) * lerp(1, 0.85, out)})`;
  });

  /* two fragments, one per phrase; the first softens as the second lands */
  const listOut = span(t, T.shift, T.shift + 0.6);
  listEls.forEach((el, i) => {
    const u = span(t, T.lines[i], T.lines[i] + 0.5);
    const next = i < LINES.length - 1 ? span(t, T.lines[i + 1], T.lines[i + 1] + 0.5) : 0;
    el.style.opacity = String(u * lerp(1, 0.55, next) * (1 - listOut));
    el.style.transform = `translateX(${lerp(-18, 0, easeOut(u)) - 20 * listOut}px)`;
  });

  /* the four customer types fan out from the last node, on their words */
  cards.forEach((el, i) => {
    const u = span(t, T.cards[i], T.cards[i] + 0.55);
    const e = easeOut(u);
    el.style.opacity = u;
    el.style.transform =
      `translate(${lerp(el.fromX, 0, e)}px, ${lerp(el.fromY, 0, e)}px) scale(${lerp(0.6, 1, easeBack(u))})`;
  });

  line.update(t);

  cc.update(t, CUES);
  return `path ${pin.toFixed(2)} shift ${shift.toFixed(2)} recede ${recede.toFixed(2)}`;
}
