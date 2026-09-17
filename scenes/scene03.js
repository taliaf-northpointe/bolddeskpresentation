/* ===================================================================
   SCENE 3 — "The customer feels the delay"              0:44 – 1:16

   The hero beat. Storyboard: split screen, an employee locked out of a
   system on the left, the email back-and-forth in the middle, a borrower
   waiting on the right. The clock moves. The build note asks for extra
   screen time and explicitly says not to fill the hold with narration,
   so 19.0-23.5 is silent: only the clock advances, and the on-screen
   line carries it.

   This is one of only two scenes in the film that needs real character
   acting. Everything here is a flat figure with two or three moving
   parts — a head that tilts, an arm that raises — which is enough, and
   sits in the same register as the stick-figure scene.

   Nothing in this scene uses real ticket content. The email exchange is
   invented, and it is the generic version of a problem that costs a day:
   a request that does not say which system.
=================================================================== */

import {
  node, svgNode, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeIn, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';

export const id = 'scene03';
export const title = 'The customer feels the delay';
export const dur = 32.0;
export const visemes = null;               // voice-over only

const CUES = [
  [0.40,  6.20, "Now imagine someone helping a borrower who suddenly cannot access the system they need."],
  [6.60,  8.40, "They send an email."],
  [8.80, 10.40, "A question comes back."],
  [10.80,12.20, "Then another."],
  [12.60,19.00, "While the request moves through that back-and-forth, their customer is waiting too."],
  /* 19.0 - 23.5 deliberately silent */
  [23.80,30.00, "Better internal support can have a very real impact outside the company."],
];

/* The exchange. Four messages, alternating direction, each one a round
   trip that buys nothing. The third is the employee finally supplying
   what the first message should have carried. */
const THREAD = [
  { t:  6.70, dir: 'out', text: "I can't log into the system" },
  { t:  9.00, dir: 'in',  text: 'Which system?' },
  { t: 11.00, dir: 'out', text: 'The one I need for this file' },
  { t: 13.10, dir: 'in',  text: 'Which environment?' },
];

const T = {
  panelsIn:  0.20,
  lock:      2.60,
  clockFrom: 6.40,      // clock starts moving with the first email
  clockTo:   19.00,
  glance:    14.60,     // borrower checks the time
  phoneDark: 17.20,     // then looks at a silent phone
  holdFrom:  19.00,
  line:      19.30,
  holdTo:    23.50,
  collapse:  29.60,     // bubbles converge into one ticket
};

/* Clock: 9:05 when the first email goes out, 10:20 by the hold. A bit
   over an hour, which is the honest version of this story — not a
   dramatised whole day. */
const CLOCK_START = 9 + 5 / 60;
const CLOCK_END   = 10 + 20 / 60;

const EMP_SCALE = 1.5;     // the left panel is 620px wide; natural size read tiny
const BOR_SCALE = 1.32;

let root, panels = [], dividers = [], emp, borrower, bubbles = [], lockChip,
    clock, onscreen, ticket, cc;

/* ---------- figures ----------------------------------------------- */
/* Two or three moving parts each. Named so the render function reads as
   direction rather than as DOM plumbing. */

function seatedEmployee(parent, x, y) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '420px', height: '420px', opacity: 0,
    transformOrigin: '50% 100%',
  }}, parent);

  const head = node('div', { style: {
    position: 'absolute', left: '92px', top: '26px', width: '78px', height: '78px',
    borderRadius: '50%', background: NAVY, transformOrigin: '50% 120%',
  }}, g);
  const body = node('div', { style: {
    position: 'absolute', left: '58px', top: '112px', width: '148px', height: '132px',
    borderRadius: '54px 54px 14px 14px', background: 'rgba(22,67,86,.88)',
  }}, g);

  /* desk */
  node('div', { style: {
    position: 'absolute', left: '24px', top: '236px', width: '372px', height: '18px',
    borderRadius: '9px', background: 'rgba(22,67,86,.30)',
  }}, g);

  /* laptop: a lid with a screen, sitting on the desk */
  const lid = node('div', { style: {
    position: 'absolute', left: '196px', top: '150px', width: '150px', height: '92px',
    background: '#fff', borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(14,46,60,.24)', overflow: 'hidden',
  }}, g);
  /* a login form: two fields and a button */
  const f1 = node('div', { style: { position: 'absolute', left: '16px', right: '16px',
    top: '22px', height: '12px', borderRadius: '6px', background: 'rgba(22,67,86,.22)' }}, lid);
  const f2 = node('div', { style: { position: 'absolute', left: '16px', right: '16px',
    top: '42px', height: '12px', borderRadius: '6px', background: 'rgba(22,67,86,.22)' }}, lid);
  const btn = node('div', { style: { position: 'absolute', left: '16px', width: '58px',
    top: '64px', height: '14px', borderRadius: '7px', background: BLUE }}, lid);

  return { g, head, body, lid, fields: [f1, f2], btn };
}

function standingBorrower(parent, x, y) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '300px', height: '460px', opacity: 0,
    transformOrigin: '50% 100%',
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
    borderRadius: '15px', background: 'rgba(22,67,86,.88)',
    transformOrigin: '50% 8%',
  }}, g);
  const phone = node('div', { style: {
    position: 'absolute', left: '-13px', top: '84px', width: '48px', height: '82px',
    borderRadius: '9px', background: '#1B2A33',
    border: '3px solid rgba(22,67,86,.95)',
  }}, arm);
  const screen = node('div', { style: {
    position: 'absolute', inset: '5px', borderRadius: '5px',
    background: 'rgba(63,230,255,.20)',
  }}, phone);

  return { g, head, arm, phone, screen };
}

/* ---------- clock -------------------------------------------------- */
function makeClock(parent, x, y, r) {
  const wrap = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: (r * 2) + 'px', height: (r * 2 + 54) + 'px', opacity: 0,
  }}, parent);

  const svg = svgNode('svg', { viewBox: `0 0 ${r*2} ${r*2}`, width: r*2, height: r*2 }, wrap);
  svgNode('circle', { cx: r, cy: r, r: r - 5, fill: '#fff',
    stroke: 'rgba(22,67,86,.22)', 'stroke-width': 5 }, svg);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r1 = r - 18, r2 = r - 11;
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

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(170deg, #FBFDFE 0%, #E4EEF3 100%)',
  }}, root);

  /* Three panels. Slightly different tints so the split reads without
     heavy borders, and so the middle lane feels like transit. */
  const cuts = [[0, 620, 'rgba(0,134,177,.05)'],
                [620, 1300, 'rgba(22,67,86,.035)'],
                [1300, 1920, 'rgba(0,134,177,.05)']];
  cuts.forEach(([x0, x1, bg]) => {
    panels.push(node('div', { style: {
      position: 'absolute', left: x0 + 'px', top: 0, width: (x1 - x0) + 'px',
      height: '1080px', background: bg, opacity: 0,
    }}, root));
  });
  [620, 1300].forEach(x => {
    dividers.push(node('div', { style: {
      position: 'absolute', left: x + 'px', top: '50%', width: '2px', height: '0px',
      background: 'rgba(22,67,86,.16)', transform: 'translateY(-50%)',
    }}, root));
  });

  /* panel labels — who am I looking at */
  const labelStyle = {
    position: 'absolute', top: '84px', fontSize: '22px', fontWeight: 700,
    letterSpacing: '.16em', color: 'rgba(22,67,86,.50)', opacity: 0,
  };
  const lblEmp = node('div', { text: 'AN EMPLOYEE', style: { ...labelStyle, left: '72px' }}, root);
  const lblCus = node('div', { text: 'THEIR CUSTOMER', style: { ...labelStyle, left: '1372px' }}, root);
  panels.labels = [lblEmp, lblCus];

  emp = seatedEmployee(root, 104, 452);
  borrower = standingBorrower(root, 1462, 524);

  /* Access-denied chip, anchored to the laptop inside the figure group so it
     scales with him and never lands on his body. */
  lockChip = node('div', { style: {
    position: 'absolute', left: '150px', top: '58px',
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 16px', background: '#fff', borderRadius: '12px',
    border: '3px solid #C4563B',
    boxShadow: '0 14px 34px rgba(14,46,60,.22)', opacity: 0,
    transformOrigin: '10% 130%', whiteSpace: 'nowrap',
  }}, emp.g);
  const padlock = svgNode('svg', { viewBox: '0 0 24 24', width: 23, height: 23 }, lockChip);
  svgNode('path', { d: 'M7 10V8a5 5 0 0 1 10 0v2', fill: 'none',
    stroke: '#C4563B', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, padlock);
  svgNode('rect', { x: 4.5, y: 10, width: 15, height: 10.5, rx: 2.4, fill: '#C4563B' }, padlock);
  node('div', { text: 'Access denied', style: {
    fontSize: '21px', fontWeight: 700, color: '#A8442C', whiteSpace: 'nowrap',
  }}, lockChip);

  /* The email lane. Bubbles alternate sides; each one is a round trip. */
  THREAD.forEach((m, i) => {
    const out = m.dir === 'out';
    const b = node('div', { style: {
      position: 'absolute',
      left: (out ? 676 : 836) + 'px',
      top: (306 + i * 118) + 'px',
      maxWidth: '390px', padding: '20px 26px',
      background: out ? '#fff' : NAVY,
      color: out ? NAVY : '#fff',
      borderRadius: out ? '18px 18px 18px 5px' : '18px 18px 5px 18px',
      boxShadow: '0 10px 26px rgba(14,46,60,.16)',
      fontSize: '27px', fontWeight: out ? 600 : 500, opacity: 0,
      transformOrigin: out ? '0% 100%' : '100% 100%',
    }}, root);
    b.textContent = m.text;
    bubbles.push(b);
  });

  clock = makeClock(root, 1348, 150, 78);
  setClock(clock, CLOCK_START);

  /* a soft glow behind the phone that dies when nothing arrives */
  onscreen = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '806px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'While the employee waits, the customer waits too.', style: {
    fontSize: '50px', lineHeight: 1.22, fontWeight: 700, color: NAVY,
  }}, onscreen);

  /* Transition target: the four bubbles converge into one ticket card,
     which is what Scene 4 opens on. */
  ticket = node('div', { style: {
    position: 'absolute', left: '740px', top: '404px', width: '440px',
    padding: '30px 34px', background: '#fff', borderRadius: '20px',
    borderLeft: '10px solid ' + BLUE,
    boxShadow: '0 30px 70px rgba(14,46,60,.26)', opacity: 0,
    transformOrigin: '50% 50%',
  }}, root);
  node('div', { text: 'ONE REQUEST', style: {
    fontSize: '18px', letterSpacing: '.18em', color: BLUE,
    fontWeight: 700, marginBottom: '14px',
  }}, ticket);
  node('div', { text: 'Tracked, owned, and answered', style: {
    fontSize: '34px', lineHeight: 1.2, fontWeight: 700, color: NAVY,
  }}, ticket);

  cc = makeCaptions(root);
  return { cc };
}

/* ---------- render -------------------------------------------------- */
export function render(t) {
  /* A very slow creep in, so 32 seconds of mostly-still frame stays alive */
  root.style.transform = `scale(${lerp(1.0, 1.035, easeInOut(span(t, 0, dur)))})`;
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 31.4, dur));

  /* --- panels and dividers open --------------------------------- */
  panels.forEach((p, i) => { p.style.opacity = stagger(t, T.panelsIn, 0.12, 0.5, i); });
  const dv = span(t, T.panelsIn + 0.15, T.panelsIn + 0.95);
  dividers.forEach(d => { d.style.height = (easeOut(dv) * 1080) + 'px'; });
  panels.labels.forEach((l, i) => { l.style.opacity = stagger(t, 0.7, 0.16, 0.5, i) * 0.9; });

  /* --- the employee, and the door that won't open ---------------- */
  const ein = easeOut(span(t, 0.5, 1.5));
  emp.g.style.opacity = ein;
  emp.g.style.transform =
    `translateY(${lerp(22, 0, ein)}px) scale(${EMP_SCALE * lerp(0.985, 1, ein)})`;

  /* tries the login twice before the lock lands */
  const try1 = pulse(span(t, 1.5, 1.9));
  const try2 = pulse(span(t, 2.15, 2.55));
  emp.btn.style.transform = `scale(${1 - 0.16 * Math.max(try1, try2)})`;

  const lk = span(t, T.lock, T.lock + 0.45);
  lockChip.style.opacity = lk;
  lockChip.style.transform = `scale(${lerp(0.72, 1, easeBack(lk))})`;
  /* the login fields grey out, the button loses its colour */
  emp.fields.forEach(f => { f.style.opacity = String(lerp(1, 0.45, lk)); });
  emp.btn.style.background = lk > 0.5 ? 'rgba(22,67,86,.25)' : BLUE;
  /* head drops a little — the only acting he does */
  emp.head.style.transform = `rotate(${lerp(0, 7, easeOut(lk))}deg)`;

  /* --- the borrower --------------------------------------------- */
  const bin = easeOut(span(t, 1.2, 2.2));
  borrower.g.style.opacity = bin;
  borrower.g.style.transform =
    `translateY(${lerp(22, 0, bin)}px) scale(${BOR_SCALE * lerp(0.985, 1, bin)})`;

  /* arm down until the glance, then up, then stays up */
  const glance = span(t, T.glance, T.glance + 0.7);
  const armDeg = lerp(-6, 62, easeOut(glance));
  borrower.arm.style.transform = `rotate(${armDeg}deg)`;
  /* keep the handset upright as the arm swings, or it reads as a blade */
  borrower.phone.style.transform = `rotate(${-armDeg}deg)`;
  borrower.head.style.transform = `rotate(${lerp(0, 9, easeOut(glance))}deg)`;

  /* the phone screen goes dark: nothing is arriving */
  const dark = span(t, T.phoneDark, T.phoneDark + 1.2);
  borrower.screen.style.background =
    `rgba(63,230,255,${lerp(0.22, 0.03, dark)})`;
  /* the light dies in her hand rather than as a blob on the floor */
  const lit = glance * (1 - dark);
  borrower.phone.style.boxShadow =
    `0 0 ${lerp(0, 34, lit)}px rgba(63,230,255,${lerp(0, .55, lit)})`;

  /* --- the exchange --------------------------------------------- */
  bubbles.forEach((b, i) => {
    const m = THREAD[i];
    const u = span(t, m.t, m.t + 0.42);
    const gone = span(t, T.collapse, T.collapse + 0.5);
    b.style.opacity = u * (1 - gone);
    const from = m.dir === 'out' ? -54 : 54;
    b.style.transform =
      `translateX(${lerp(from, 0, easeOut(u))}px) scale(${lerp(0.9, 1, easeBack(u))})`;
  });

  /* --- the clock ------------------------------------------------- */
  const cu = span(t, T.clockFrom - 1.2, T.clockFrom - 0.4);
  clock.wrap.style.opacity = cu * (1 - span(t, T.collapse, T.collapse + 0.6));
  setClock(clock, lerp(CLOCK_START, CLOCK_END,
                       easeInOut(span(t, T.clockFrom, T.clockTo))));

  /* --- the hold -------------------------------------------------- */
  /* 19.0 to 23.5, no narration. The left and middle drain back so the
     eye goes right, to the person who has been waiting the whole time.
     The build note asked for breathing room; this is it. */
  const hold = span(t, T.holdFrom, T.holdFrom + 1.0)
             * (1 - span(t, T.holdTo, T.holdTo + 1.0));
  const drain = hold * 0.55;
  emp.g.style.opacity = String(ein * (1 - drain) * (1 - span(t, T.collapse, T.collapse + 0.7)));
  /* the chip rides the group's opacity, so it needs no drain of its own */
  bubbles.forEach((b, i) => {
    const u = span(t, THREAD[i].t, THREAD[i].t + 0.42);
    b.style.opacity = String(u * (1 - drain) * (1 - span(t, T.collapse, T.collapse + 0.5)));
  });

  /* --- the line -------------------------------------------------- */
  const ou = span(t, T.line, T.line + 0.8);
  onscreen.style.opacity = ou * (1 - span(t, 28.6, 29.4));
  onscreen.style.transform = `translateY(${lerp(20, 0, easeOut(ou))}px)`;

  /* --- collapse into one ticket ---------------------------------- */
  const col = span(t, T.collapse, T.collapse + 1.0);
  ticket.style.opacity = col;
  ticket.style.transform = `scale(${lerp(0.82, 1, easeBack(col))})`;

  cc.update(t, CUES);
  return null;
}

export { CUES };
