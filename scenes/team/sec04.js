/* ===================================================================
   sec04 — "Better experience for everyone"                    52.6s

   Two movements. First the idea: one figure in the centre with a soft
   ring (every one of us supports a customer), four customer cards fan
   out below it on their phrases, the employee card lifts and takes the
   accent, and three curves draw from it to the other three — helping
   the inside helps the outside. Then the story, adapted from scene03:
   the split screen, an employee locked out on the left, the email
   back-and-forth in the middle with a clock advancing, a borrower on
   the right who checks the time and looks at a silent phone.

   No team is named on screen: the narration says "someone in Sales",
   the figure is labelled EMPLOYEE. Every number in T is read from
   data/words-sec04.json / data/cues-sec04.json (where Ava actually
   says the phrase) and kept as a constant, commented with the phrase.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, figure, edges,
  node, svgNode, span, lerp, easeOut, easeInOut, easeBack, NAVY, BLUE,
} from '../../lib/section.js';
import { stagger, pulse } from '../../lib/engine.js';

export const id = 'sec04';
export const title = 'Better experience for everyone';
export const dur = 52.6;
export const visemes = null;

const CUES = loadCues('data/cues-sec04.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  cardOut:   3.00,    // title card (hold 2.40 + 0.60 out) has left the frame
  figIn:     3.10,    // the one figure, centre
  ring:      4.22,   // "Every one of us"              -> the soft ring
  ringPulse: 5.47,   // "customer"                     -> ring breathes once
  spread:    7.00,    // just before "That might be"    -> figure moves up, room for the row
  cards: [
    8.18,            // "external business partner"   -> Business partner
    10.13,           // "It might be a borrower."      -> Borrower
    11.84,           // "It might be a retail banking customer." -> Retail customer
    14.61,           // "Or it might be another Northpointe employee." -> Northpointe employee
  ],
  lift:      18.07,  // "that last one"                -> employee card lifts, takes the accent
  curves:    22.19,  // "help our internal teams"      -> curves draw to the other three
  serve:     25.89,  // "serve their customers"        -> the other three answer
  part1Out:  27.90,   // idea recedes before "Imagine"
  panelsIn:  28.40,   // split screen opens
  empIn:     28.90,   // "someone"                      -> employee at a laptop
  borIn:     30.97,  // "borrower"                     -> the borrower, phone in hand
  try1:      31.70,  // "and suddenly"                 -> tries the login
  try2:      32.15,
  lock:      32.49,  // "can't access"                 -> access denied
  clockIn:   34.60,   // clock appears with "If that request"
  clockFrom: 35.27,  // "request"                      -> clock starts moving
  clockTo:   45.67,  // "too"                          -> clock stops
  glance:    43.68,  // "waiting"                      -> borrower checks the time
  phoneDark: 44.53,  // "customer"                     -> looks at a silent phone
  dim:       44.36,  // "their customer is waiting"    -> employee side dims
  bubblesOut: 46.70,  // exchange clears for the line
  line:      47.03,  // "A better support experience"  -> "Internal support. External impact."
};

/* The exchange. Four messages, alternating direction, each a round trip
   spent working out which application the request is even about. */
const THREAD = [
  { t: 35.27, dir: 'out', text: "I can't get into the system" },   // "request"
  { t: 37.13, dir: 'in',  text: 'Which application?' },            // "emails"
  { t: 38.05, dir: 'out', text: 'The one I use for this file' },   // "forth"
  { t: 39.80, dir: 'in',  text: 'Which one is that?' },            // "application"
];

/* Clock: 9:05 when the first email goes out, 10:20 by the time the
   customer is checking hers. An hour and a bit — the honest version. */
const CLOCK_START = 9 + 5 / 60;
const CLOCK_END   = 10 + 20 / 60;

const EMP_SCALE = 1.5;
const BOR_SCALE = 1.32;

/* ---------- the four customers ------------------------------------ */
const CARDS = [
  { label: 'Business partner',     glyph: 'briefcase' },
  { label: 'Borrower',             glyph: 'house' },
  { label: 'Retail customer',      glyph: 'card' },
  { label: 'Northpointe employee', glyph: 'badge' },
];
const CARD_W = 340, CARD_H = 190, CARD_Y = 540, CARD_X0 = 220, CARD_GAP = 380;
const cardCX = i => CARD_X0 + i * CARD_GAP + CARD_W / 2;

/* Figure: centre of frame, then up top once the row needs the space. */
const FIG_H = 260, FIG_W = FIG_H * 0.62;
const FIG_Y_CENTRE = 330, FIG_Y_TOP = 120;
const FIG_SCALE_TOP = 0.85;

let root, card, cc, part1, part2,
    fig, ring, cards = [], glyphs = [], curveSvg, curves = [], dots = [],
    panels = [], dividers = [], labels = [], emp, borrower, lockChip, bubbles = [],
    clock, line;

/* ---------- glyphs: one stroke colour, inherited from the <g> ------ */
function glyph(parent, kind, size = 64) {
  const svg = svgNode('svg', { viewBox: '0 0 64 64', width: size, height: size }, parent);
  const g = svgNode('g', { fill: 'none', stroke: NAVY, 'stroke-width': 3.2,
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

/* ---------- scene03's figures, kept whole ---------------------------- */
function seatedEmployee(parent, x, y) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '420px', height: '420px', opacity: 0, transformOrigin: '50% 100%',
  }}, parent);
  const head = node('div', { style: {
    position: 'absolute', left: '92px', top: '26px', width: '78px', height: '78px',
    borderRadius: '50%', background: NAVY, transformOrigin: '50% 120%',
  }}, g);
  node('div', { style: {
    position: 'absolute', left: '58px', top: '112px', width: '148px', height: '132px',
    borderRadius: '54px 54px 14px 14px', background: 'rgba(22,67,86,.88)',
  }}, g);
  /* desk */
  node('div', { style: {
    position: 'absolute', left: '24px', top: '236px', width: '372px', height: '18px',
    borderRadius: '9px', background: 'rgba(22,67,86,.30)',
  }}, g);
  /* laptop lid with a login form: two fields and a button */
  const lid = node('div', { style: {
    position: 'absolute', left: '196px', top: '150px', width: '150px', height: '92px',
    background: '#fff', borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(14,46,60,.24)', overflow: 'hidden',
  }}, g);
  const f1 = node('div', { style: { position: 'absolute', left: '16px', right: '16px',
    top: '22px', height: '12px', borderRadius: '6px', background: 'rgba(22,67,86,.22)' }}, lid);
  const f2 = node('div', { style: { position: 'absolute', left: '16px', right: '16px',
    top: '42px', height: '12px', borderRadius: '6px', background: 'rgba(22,67,86,.22)' }}, lid);
  const btn = node('div', { style: { position: 'absolute', left: '16px', width: '58px',
    top: '64px', height: '14px', borderRadius: '7px', background: BLUE }}, lid);
  return { g, head, lid, fields: [f1, f2], btn };
}

function standingBorrower(parent, x, y) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '300px', height: '460px', opacity: 0, transformOrigin: '50% 100%',
  }}, parent);
  const head = node('div', { style: {
    position: 'absolute', left: '112px', top: '10px', width: '76px', height: '76px',
    borderRadius: '50%', background: NAVY, transformOrigin: '50% 130%',
  }}, g);
  node('div', { style: {
    position: 'absolute', left: '78px', top: '94px', width: '144px', height: '196px',
    borderRadius: '56px 56px 18px 18px', background: 'rgba(22,67,86,.88)',
  }}, g);
  /* the arm holding a phone — rotates up on the glance */
  const arm = node('div', { style: {
    position: 'absolute', left: '188px', top: '148px', width: '28px', height: '104px',
    borderRadius: '15px', background: 'rgba(22,67,86,.88)', transformOrigin: '50% 8%',
  }}, g);
  const phone = node('div', { style: {
    position: 'absolute', left: '-13px', top: '84px', width: '48px', height: '82px',
    borderRadius: '9px', background: '#1B2A33', border: '3px solid rgba(22,67,86,.95)',
  }}, arm);
  const screen = node('div', { style: {
    position: 'absolute', inset: '5px', borderRadius: '5px', background: 'rgba(0,134,177,.30)',
  }}, phone);
  return { g, head, arm, phone, screen };
}

function makeClock(parent, x, y, r) {
  const wrap = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: (r * 2) + 'px', height: (r * 2 + 54) + 'px', opacity: 0,
  }}, parent);
  const svg = svgNode('svg', { viewBox: `0 0 ${r*2} ${r*2}`, width: r*2, height: r*2 }, wrap);
  svgNode('circle', { cx: r, cy: r, r: r - 5, fill: '#fff',
    stroke: 'rgba(22,67,86,.22)', 'stroke-width': 5 }, svg);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, r1 = r - 18, r2 = r - 11;
    svgNode('line', {
      x1: r + Math.sin(a) * r1, y1: r - Math.cos(a) * r1,
      x2: r + Math.sin(a) * r2, y2: r - Math.cos(a) * r2,
      stroke: 'rgba(22,67,86,.30)', 'stroke-width': 3, 'stroke-linecap': 'round',
    }, svg);
  }
  const hour = svgNode('line', { x1: r, y1: r, x2: r, y2: r - (r * 0.50),
    stroke: NAVY, 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
  const min  = svgNode('line', { x1: r, y1: r, x2: r, y2: r - (r * 0.74),
    stroke: BLUE, 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
  svgNode('circle', { cx: r, cy: r, r: 7, fill: NAVY }, svg);
  const label = node('div', { style: {
    position: 'absolute', left: 0, right: 0, top: (r * 2 + 12) + 'px',
    textAlign: 'center', fontSize: '34px', fontWeight: 700, color: NAVY,
    fontVariantNumeric: 'tabular-nums',
  }}, wrap);
  return { wrap, hour, min, label, r };
}

function setClock(c, hoursFloat) {
  const h = Math.floor(hoursFloat), m = (hoursFloat - h) * 60;
  c.hour.setAttribute('transform', `rotate(${(h % 12) * 30 + m * 0.5} ${c.r} ${c.r})`);
  c.min.setAttribute('transform',  `rotate(${m * 6} ${c.r} ${c.r})`);
  c.label.textContent = `${h}:${String(Math.round(m)).padStart(2, '0')}`;
}

/* ---------- build -------------------------------------------------- */
export function build(container) {
  root = container;
  paper(root);

  /* ===== movement one: the idea ===================================== */
  part1 = node('div', { style: { position: 'absolute', inset: 0 }}, root);

  ring = node('div', { style: {
    position: 'absolute', borderRadius: '50%', opacity: 0,
    border: '3px solid rgba(0,134,177,.38)',
    background: 'radial-gradient(circle, rgba(0,134,177,.11), rgba(0,134,177,.04) 60%, transparent 72%)',
  }}, part1);

  fig = figure(part1, { x: 960 - FIG_W / 2, y: FIG_Y_CENTRE, h: FIG_H, accent: BLUE });
  fig.set({ opacity: 0 });

  /* curves from the employee card to the other three, drawn on t */
  curveSvg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, part1);
  Object.assign(curveSvg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });
  const ex = cardCX(3), ey = CARD_Y - 24;             // employee card, lifted
  [2, 1, 0].forEach(i => {
    const tx = cardCX(i), ty = CARD_Y;
    const cy = 496 - (3 - i) * 32;                     // farther cards arc higher, all under the ring
    const p = svgNode('path', {
      d: `M ${ex} ${ey} C ${ex} ${cy}, ${tx} ${cy}, ${tx} ${ty}`,
      fill: 'none', stroke: BLUE, 'stroke-width': 4, 'stroke-linecap': 'round',
      pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, 'stroke-opacity': 0,
    }, curveSvg);
    curves.push(p);
    dots.push(svgNode('circle', { cx: tx, cy: ty, r: 8, fill: BLUE, opacity: 0 }, curveSvg));
  });

  CARDS.forEach((c, i) => {
    const el = node('div', { style: {
      position: 'absolute', left: (CARD_X0 + i * CARD_GAP) + 'px', top: CARD_Y + 'px',
      width: CARD_W + 'px', height: CARD_H + 'px', boxSizing: 'border-box',
      background: '#fff', borderRadius: '20px', border: '3px solid rgba(22,67,86,.10)',
      boxShadow: '0 18px 44px rgba(14,46,60,.12)', opacity: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '16px', transformOrigin: '50% 50%',
    }}, part1);
    glyphs.push(glyph(el, c.glyph, 64));
    const lab = node('div', { text: c.label, style: {
      fontSize: '26px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
    }}, el);
    el.lab = lab;
    cards.push(el);
  });

  /* ===== movement two: the story ==================================== */
  part2 = node('div', { style: { position: 'absolute', inset: 0, opacity: 0 }}, root);

  [[0, 620, 'rgba(0,134,177,.05)'],
   [620, 1300, 'rgba(22,67,86,.035)'],
   [1300, 1920, 'rgba(0,134,177,.05)']].forEach(([x0, x1, bg]) => {
    panels.push(node('div', { style: {
      position: 'absolute', left: x0 + 'px', top: 0, width: (x1 - x0) + 'px',
      height: '1080px', background: bg, opacity: 0,
    }}, part2));
  });
  [620, 1300].forEach(x => {
    dividers.push(node('div', { style: {
      position: 'absolute', left: x + 'px', top: '50%', width: '2px', height: '0px',
      background: 'rgba(22,67,86,.16)', transform: 'translateY(-50%)',
    }}, part2));
  });
  const labelStyle = {
    position: 'absolute', top: '84px', fontSize: '22px', fontWeight: 700,
    letterSpacing: '.16em', color: 'rgba(22,67,86,.50)', opacity: 0,
  };
  labels.push(node('div', { text: 'EMPLOYEE', style: { ...labelStyle, left: '72px' }}, part2));
  labels.push(node('div', { text: 'THEIR CUSTOMER', style: { ...labelStyle, left: '1372px' }}, part2));

  emp = seatedEmployee(part2, 104, 452);
  borrower = standingBorrower(part2, 1462, 524);

  /* lock chip, anchored inside the employee group so it scales with him */
  lockChip = node('div', { style: {
    position: 'absolute', left: '150px', top: '58px',
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 16px', background: '#fff', borderRadius: '12px',
    border: '3px solid ' + NAVY,
    boxShadow: '0 14px 34px rgba(14,46,60,.22)', opacity: 0,
    transformOrigin: '10% 130%', whiteSpace: 'nowrap',
  }}, emp.g);
  const padlock = svgNode('svg', { viewBox: '0 0 24 24', width: 23, height: 23 }, lockChip);
  svgNode('path', { d: 'M7 10V8a5 5 0 0 1 10 0v2', fill: 'none',
    stroke: NAVY, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, padlock);
  svgNode('rect', { x: 4.5, y: 10, width: 15, height: 10.5, rx: 2.4, fill: NAVY }, padlock);
  node('div', { text: 'Access denied', style: {
    fontSize: '21px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, lockChip);

  /* the email lane */
  THREAD.forEach((m, i) => {
    const out = m.dir === 'out';
    const b = node('div', { text: m.text, style: {
      position: 'absolute',
      left: (out ? 676 : 836) + 'px', top: (306 + i * 118) + 'px',
      maxWidth: '390px', padding: '20px 26px',
      background: out ? '#fff' : NAVY, color: out ? NAVY : '#fff',
      borderRadius: out ? '18px 18px 18px 5px' : '18px 18px 5px 18px',
      boxShadow: '0 10px 26px rgba(14,46,60,.16)',
      fontSize: '27px', fontWeight: out ? 600 : 500, opacity: 0,
      transformOrigin: out ? '0% 100%' : '100% 100%',
    }}, part2);
    bubbles.push(b);
  });

  clock = makeClock(part2, 1348, 150, 78);
  setClock(clock, CLOCK_START);

  /* the line sits in the middle lane once the exchange has cleared */
  line = onScreen(root, { text: 'Internal support. External impact.',
                          x: 960, y: 400, size: 54, width: 600, t0: T.line });

  card = titleCard(root, { n: 4, title: 'Better experience for everyone' });
  cc = captions(root);
  return { cc };
}

/* ---------- render -------------------------------------------------- */
export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* ===== movement one ================================================ */
  const p1 = 1 - span(t, T.part1Out, T.part1Out + 0.7);
  part1.style.opacity = p1;
  part1.style.display = p1 > 0 ? 'block' : 'none';

  if (p1 > 0) {
    /* the one figure: centre, then up top */
    const fin = easeOut(span(t, T.figIn, T.figIn + 0.8));
    const up  = easeInOut(span(t, T.spread, T.spread + 0.9));
    const fy  = lerp(FIG_Y_CENTRE, FIG_Y_TOP, up) + lerp(18, 0, fin);
    const fs  = lerp(1, FIG_SCALE_TOP, up);
    fig.set({ opacity: fin, y: fy, scale: fs, headTilt: lerp(0, -3, up) });

    /* the soft ring around them — "every one of us supports a customer" */
    const rin = span(t, T.ring, T.ring + 0.7);
    const breathe = pulse(span(t, T.ringPulse, T.ringPulse + 0.9)) * 0.06
                  + pulse(span(t, T.serve, T.serve + 0.9)) * 0.05;
    const cx = 960, cy = fy + FIG_H / 2 + lerp(-8, 0, up);
    const d = lerp(FIG_H * 1.7, FIG_H * 1.3, up) * lerp(0.7, 1, easeBack(rin)) * (1 + breathe);
    ring.style.left = (cx - d / 2) + 'px';
    ring.style.top = (cy - d / 2) + 'px';
    ring.style.width = d + 'px';
    ring.style.height = d + 'px';
    ring.style.opacity = rin;
    ring.style.borderColor = `rgba(0,134,177,${lerp(0.38, 0.6, breathe / 0.06)})`;

    /* four cards fan out from the figure, one per phrase */
    const lift = easeOut(span(t, T.lift, T.lift + 0.6));
    cards.forEach((el, i) => {
      const u = span(t, T.cards[i], T.cards[i] + 0.55);
      const e = easeOut(u);
      const fromX = 960 - cardCX(i), fromY = 260 - (CARD_Y + CARD_H / 2);
      let ty = lerp(fromY, 0, e), sc = lerp(0.6, 1, easeBack(u));
      if (i === 3) ty -= 24 * lift;
      /* the other three answer the employee on "serve their customers" */
      if (i < 3) sc *= 1 + 0.05 * pulse(span(t, T.serve + i * 0.15, T.serve + i * 0.15 + 0.7));
      el.style.opacity = u;
      el.style.transform = `translate(${lerp(fromX, 0, e)}px, ${ty}px) scale(${sc})`;
      if (i === 3) {
        const acc = lift > 0.5;
        el.style.border = acc ? '4px solid ' + BLUE : '3px solid rgba(22,67,86,.10)';
        el.style.boxShadow = acc ? '0 26px 56px rgba(0,134,177,.26)' : '0 18px 44px rgba(14,46,60,.12)';
        el.lab.style.color = acc ? BLUE : NAVY;
        glyphs[3].setAttribute('stroke', acc ? BLUE : NAVY);
      }
    });

    /* curves draw from the employee card to the nearest, then the rest */
    curves.forEach((p, i) => {
      const u = stagger(t, T.curves, 0.36, 1.3, i);
      p.setAttribute('stroke-opacity', u > 0 ? 0.85 : 0);
      p.setAttribute('stroke-dashoffset', String(1 - easeInOut(u)));
      const dv = span(t, T.curves + i * 0.36 + 1.15, T.curves + i * 0.36 + 1.45);
      dots[i].setAttribute('opacity', String(dv));
      dots[i].setAttribute('r', String(lerp(2, 8, easeBack(dv))));
    });
  }

  /* ===== movement two ================================================ */
  const p2 = span(t, T.panelsIn, T.panelsIn + 0.6);
  part2.style.opacity = p2;
  part2.style.display = p2 > 0 ? 'block' : 'none';

  let ein = 0, glance = 0;
  if (p2 > 0) {
    panels.forEach((p, i) => { p.style.opacity = stagger(t, T.panelsIn, 0.12, 0.5, i); });
    const dv = span(t, T.panelsIn + 0.15, T.panelsIn + 0.95);
    dividers.forEach(d => { d.style.height = (easeOut(dv) * 1080) + 'px'; });
    labels[0].style.opacity = span(t, T.empIn, T.empIn + 0.5) * 0.9;
    labels[1].style.opacity = span(t, T.borIn, T.borIn + 0.5) * 0.9;

    /* the employee, and the door that won't open */
    ein = easeOut(span(t, T.empIn, T.empIn + 1.0));
    const dim = span(t, T.dim, T.dim + 1.0);
    emp.g.style.opacity = String(ein * (1 - dim * 0.45));
    emp.g.style.transform =
      `translateY(${lerp(22, 0, ein)}px) scale(${EMP_SCALE * lerp(0.985, 1, ein)})`;
    const tr1 = pulse(span(t, T.try1, T.try1 + 0.4));
    const tr2 = pulse(span(t, T.try2, T.try2 + 0.4));
    emp.btn.style.transform = `scale(${1 - 0.16 * Math.max(tr1, tr2)})`;
    const lk = span(t, T.lock, T.lock + 0.45);
    lockChip.style.opacity = lk;
    lockChip.style.transform = `scale(${lerp(0.72, 1, easeBack(lk))})`;
    emp.fields.forEach(f => { f.style.opacity = String(lerp(1, 0.45, lk)); });
    emp.btn.style.background = lk > 0.5 ? 'rgba(22,67,86,.25)' : BLUE;
    emp.head.style.transform = `rotate(${lerp(0, 7, easeOut(lk))}deg)`;

    /* the borrower */
    const bin = easeOut(span(t, T.borIn, T.borIn + 1.0));
    borrower.g.style.opacity = bin;
    borrower.g.style.transform =
      `translateY(${lerp(22, 0, bin)}px) scale(${BOR_SCALE * lerp(0.985, 1, bin)})`;
    glance = span(t, T.glance, T.glance + 0.7);
    const armDeg = lerp(-6, 62, easeOut(glance));
    borrower.arm.style.transform = `rotate(${armDeg}deg)`;
    /* the handset counter-rotates so it stays upright as the arm swings */
    borrower.phone.style.transform = `rotate(${-armDeg}deg)`;
    borrower.head.style.transform = `rotate(${lerp(0, 9, easeOut(glance))}deg)`;
    const dark = span(t, T.phoneDark, T.phoneDark + 1.2);
    borrower.screen.style.background = `rgba(0,134,177,${lerp(0.30, 0.04, dark)})`;
    const lit = glance * (1 - dark);
    borrower.phone.style.boxShadow =
      `0 0 ${lerp(0, 34, lit)}px rgba(0,134,177,${lerp(0, .55, lit)})`;

    /* the exchange */
    const gone = span(t, T.bubblesOut, T.bubblesOut + 0.5);
    bubbles.forEach((b, i) => {
      const m = THREAD[i];
      const u = span(t, m.t, m.t + 0.42);
      b.style.opacity = String(u * (1 - dim * 0.35) * (1 - gone));
      const from = m.dir === 'out' ? -54 : 54;
      b.style.transform =
        `translateX(${lerp(from, 0, easeOut(u))}px) scale(${lerp(0.9, 1, easeBack(u))})`;
    });

    /* the clock */
    clock.wrap.style.opacity = span(t, T.clockIn, T.clockIn + 0.6);
    setClock(clock, lerp(CLOCK_START, CLOCK_END, easeInOut(span(t, T.clockFrom, T.clockTo))));
  }

  line.update(t);

  cc.update(t, CUES);
  return `idea ${p1.toFixed(2)} story ${p2.toFixed(2)} emp ${ein.toFixed(2)} glance ${glance.toFixed(2)}`;
}
