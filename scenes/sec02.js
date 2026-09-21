/* ===================================================================
   sec02 — "Why BoldDesk?"                                     27.5s

   The argument is simplicity, so the scene is built around one clean
   ticket card that never changes. Everything else is staged against
   it: a dense grey "other system" crowds it aside, then gives way; two
   people stand either side of it and each gets a tick on their word;
   the line lands last.

   Every beat is timed to where Ava actually says the phrase
   (data/cues-sec02.json, data/words-sec02.json). Times below are read
   from those files and noted with the phrase they belong to.
=================================================================== */

import {
  paper, titleCard, loadCues, loadJson, captions, onScreen, figure, edges, wordAt,
  span, lerp, easeOut, easeInOut, easeBack, node, svgNode, NAVY, BLUE,
} from '../lib/section.js';
import { ticketCard, chip } from '../lib/ui.js';
import { pulse, stagger } from '../lib/engine.js';

export const id = 'sec02';
export const title = 'Why BoldDesk?';
export const dur = 25.0;
export const visemes = null;                  // voice-over only

const CUES  = loadCues('data/cues-sec02.json');
const WORDS = loadJson('data/words-sec02.json', []);

/* ---------- timing, from the cue and word files ------------------- */
const T = {
  cardHold:  3.0,     // "So, why BoldDesk?" ends 2.97 — card recedes right after
  cleanIn:   3.75,    // "One of the things that stood out to us..." 3.67
  simple:    5.94,    // word "simple" 5.942
  clutterIn: 7.51,    // "A lot of ticketing systems are designed primarily..." 7.51
  approach:  12.60,   // "BoldDesk is much more approachable." 12.60
  figures:   15.00,   // "It's easy for the person submitting a request..." 15.00
  checkL:    16.26,   // word "submitting" 16.261  (fallback if words not loaded)
  checkR:    19.09,   // word "working"    19.093
  matters:   20.24,   // (line removed from the script) — same moment as the closing line
  line:      20.24,   // "The best system in the world..." 20.24
};

/* ---------- layout ------------------------------------------------ */
const CARD_W = 560;                    // ticketCard content width
const CARD_TOTAL = CARD_W + 68 + 10;   // + padding + accent border
const CARD_X = Math.round(960 - CARD_TOTAL / 2);   // 641
const CARD_Y = 300;
const CARD_SHIFT = 350;                // how far it is pushed aside by the clutter

const CLUTTER_W = 900, CLUTTER_H = 600;
const CLUTTER_X = 60, CLUTTER_Y = 250;

const FIG_H = 260;
const FIG_Y = 270;
const FIG_LX = 390, FIG_RX = 1370;

let root, card, cc, group, ticket, simpleChip, clutter, figL, figR, checkL, checkR, line;

/* A small tick badge that pops in above a figure */
function checkBadge(parent, cx, cy) {
  const s = 52;
  const svg = svgNode('svg', { viewBox: '0 0 52 52', width: s, height: s }, parent);
  Object.assign(svg.style, { position: 'absolute', left: (cx - s / 2) + 'px', top: (cy - s / 2) + 'px',
                             opacity: 0, transformOrigin: '50% 50%', overflow: 'visible' });
  svgNode('circle', { cx: 26, cy: 26, r: 24, fill: BLUE }, svg);
  svgNode('path', { d: 'M 15 27 L 23 35 L 38 18', fill: 'none', stroke: '#fff',
                    'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  return svg;
}

/* The deliberately technical "other system": grey on grey, tiny type,
   too many fields. None of the codes mean anything. */
function clutterPanel(parent) {
  const GREY = '#5A6570', LINE = '#C6CCD2', FIELD = '#FFFFFF';
  const el = node('div', { style: {
    position: 'absolute', left: CLUTTER_X + 'px', top: CLUTTER_Y + 'px',
    width: CLUTTER_W + 'px', height: CLUTTER_H + 'px',
    background: '#ECEEF0', border: '1px solid #B7BEC5', borderRadius: '6px',
    boxShadow: '0 18px 44px rgba(40,50,60,.18)', overflow: 'hidden', opacity: 0,
    color: GREY, zIndex: 3,
  }}, parent);

  /* window bar */
  const bar = node('div', { style: {
    height: '34px', background: '#D9DDE1', display: 'flex', alignItems: 'center',
    padding: '0 12px', gap: '8px', borderBottom: '1px solid ' + LINE,
  }}, el);
  for (let i = 0; i < 3; i++) node('div', { style: {
    width: '10px', height: '10px', borderRadius: '50%', background: '#AEB5BC' }}, bar);
  node('div', { text: 'SERVICE CONSOLE  ·  INC-2024-00812  ·  FORM v4.2.117', style: {
    marginLeft: '10px', fontSize: '12px', letterSpacing: '.12em', fontWeight: 700, color: '#6C7681',
  }}, bar);

  /* tabs */
  const tabs = node('div', { style: {
    display: 'flex', gap: '2px', padding: '8px 12px 0', borderBottom: '1px solid ' + LINE,
    background: '#E3E6E9',
  }}, el);
  ['Details', 'SLA', 'CI Relations', 'Tasks', 'Approvals', 'Audit', 'Metrics', 'Notes', 'Attachments']
    .forEach((tName, i) => node('div', { text: tName, style: {
      fontSize: '12px', padding: '6px 10px', color: GREY,
      background: i === 0 ? '#ECEEF0' : '#D6DADE', border: '1px solid ' + LINE, borderBottom: 'none',
      borderRadius: '4px 4px 0 0', fontWeight: i === 0 ? 700 : 400,
    }}, tabs));

  const body = node('div', { style: { display: 'flex', gap: '14px', padding: '12px 14px 0' }}, el);

  /* left: the field grid */
  const grid = node('div', { style: {
    flex: '1 1 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 10px',
  }}, body);
  const FIELDS = [
    ['Ticket ID', 'PRJ-00812'],         ['Severity', 'SEV-3', 1],           ['CI-ID', 'CI-4471-B'],
    ['Queue', 'L2-INFRA', 1],           ['SLA Class', 'P3 / 8h', 1],        ['Impact', '2 – Medium', 1],
    ['Urgency', '3 – Low', 1],     ['Category', 'HW > SRV > DISK', 1], ['Assign. Group', 'OPS-TIER2', 1],
    ['Change Ref', 'CHG-1193'],         ['Problem Ref', 'PRB-0072'],        ['Environment', 'PROD', 1],
    ['Business Svc', 'SVC-CORE-14', 1], ['Escalation', 'PATH-B', 1],        ['Resolution Code', '—', 1],
    ['Root Cause', 'RC-UNK', 1],        ['KB Article', 'KB0004471'],        ['Close Code', '—', 1],
    ['Sub-state', 'AWAIT-VENDOR', 1],   ['Contact Type', 'INTEGRATION', 1], ['Correlation ID', '7f3a-91c2'],
  ];
  FIELDS.forEach(([label, value, dd]) => {
    const f = node('div', {}, grid);
    node('div', { text: label.toUpperCase(), style: {
      fontSize: '10px', letterSpacing: '.08em', color: '#7C8690', marginBottom: '3px', fontWeight: 700,
    }}, f);
    const box = node('div', { style: {
      height: '26px', border: '1px solid ' + LINE, background: FIELD, borderRadius: '3px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 7px',
      fontSize: '13px', color: GREY, whiteSpace: 'nowrap', overflow: 'hidden',
    }}, f);
    node('span', { text: value }, box);
    if (dd) node('span', { text: '▾', style: { color: '#9AA3AC', fontSize: '12px' }}, box);
  });

  /* right: notes, related records, flags */
  const side = node('div', { style: { flex: '0 0 230px', display: 'flex', flexDirection: 'column', gap: '10px' }}, body);
  const notes = node('div', { style: {
    border: '1px solid ' + LINE, background: FIELD, borderRadius: '3px', padding: '8px', height: '150px',
  }}, side);
  node('div', { text: 'WORK NOTES (INTERNAL)', style: {
    fontSize: '10px', letterSpacing: '.08em', fontWeight: 700, color: '#7C8690', marginBottom: '8px' }}, notes);
  for (let i = 0; i < 8; i++) node('div', { style: {
    height: '4px', borderRadius: '2px', background: '#D5DADF', marginBottom: '8px',
    width: (92 - (i % 3) * 18) + '%' }}, notes);

  const rel = node('div', { style: {
    border: '1px solid ' + LINE, background: FIELD, borderRadius: '3px', padding: '8px' }}, side);
  node('div', { text: 'RELATED RECORDS (6)', style: {
    fontSize: '10px', letterSpacing: '.08em', fontWeight: 700, color: '#7C8690', marginBottom: '6px' }}, rel);
  ['INC-00811 · duplicate', 'TASK-2231 · open', 'CHG-1193 · scheduled', 'PRB-0072 · under review',
   'CI-4471-B · impacted', 'KB0004471 · linked']
    .forEach(r => node('div', { text: r, style: { fontSize: '12px', color: GREY, padding: '2px 0',
      borderBottom: '1px dotted ' + LINE, whiteSpace: 'nowrap' }}, rel));

  const flags = node('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px' }}, side);
  ['Notify on-call rota', 'Major incident candidate', 'Suppress customer comms', 'Requires CAB approval']
    .forEach((f, i) => {
      const r = node('div', { style: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}, flags);
      const cb = node('div', { style: { width: '12px', height: '12px', border: '1px solid #9AA3AC',
        borderRadius: '2px', background: FIELD, display: 'grid', placeItems: 'center', fontSize: '10px', color: GREY }}, r);
      if (i === 0 || i === 2) cb.textContent = '✓';
      node('span', { text: f }, r);
    });

  /* bottom: too many buttons */
  const btns = node('div', { style: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '46px', background: '#DDE1E5',
    borderTop: '1px solid ' + LINE, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px',
  }}, el);
  ['Save', 'Update', 'Escalate', 'Reassign', 'Link CI', 'Attach', 'Clone', 'Export', 'Audit Log', 'More ▾']
    .forEach(b => node('div', { text: b, style: {
      fontSize: '12px', padding: '5px 10px', border: '1px solid #AEB5BC', borderRadius: '3px',
      background: '#F2F4F6', color: GREY, whiteSpace: 'nowrap',
    }}, btns));
  return el;
}

export function build(container) {
  root = container;
  paper(root);

  /* --- the clutter (built first so the clean card sits above it) ---- */
  clutter = clutterPanel(root);

  /* --- the one clean card + its chip, grouped so they move together --- */
  group = node('div', { style: {
    position: 'absolute', left: CARD_X + 'px', top: CARD_Y + 'px',
    width: CARD_TOTAL + 'px', height: '210px', opacity: 0,
    transformOrigin: '50% 50%', zIndex: 4,
  }}, root);
  ticket = ticketCard(group, { x: 0, y: 0, w: CARD_W, title: 'Access to a report', ref: '#1042' });
  ticket.el.style.opacity = 1;
  /* only title + status: the other rows do not exist for this scene */
  ticket.rows.owner.style.display = 'none';
  ticket.rows.due.style.display = 'none';
  ticket.hist.style.display = 'none';
  ticket.rows.status.style.opacity = 1;

  simpleChip = chip(group, 'Simple', 'open', 24);
  Object.assign(simpleChip.style, {
    position: 'absolute', right: '-22px', top: '-22px', opacity: 0,
    background: BLUE, color: '#fff', boxShadow: '0 10px 24px rgba(0,134,177,.30)',
    transformOrigin: '50% 50%',
  });

  /* --- the two people ------------------------------------------------ */
  figL = figure(root, { x: FIG_LX, y: FIG_Y, h: FIG_H, accent: BLUE, label: 'Asking' });
  figR = figure(root, { x: FIG_RX, y: FIG_Y, h: FIG_H, accent: NAVY, label: 'Working' });
  figL.set({ opacity: 0 }); figR.set({ opacity: 0 });
  const fw = FIG_H * 0.62;
  checkL = checkBadge(root, FIG_LX + fw / 2, FIG_Y - 44);
  checkR = checkBadge(root, FIG_RX + fw / 2, FIG_Y - 44);

  /* --- the line ------------------------------------------------------- */
  line = onScreen(root, { text: 'The best system only helps if people want to use it.',
                          y: 660, size: 46, t0: T.line, width: 1500 });

  card = titleCard(root, { n: 2, title: 'Why BoldDesk?', hold: T.cardHold });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  /* very slow drift so long holds do not read as a still */
  root.style.transform = `scale(${lerp(1.0, 1.02, easeInOut(span(t, 0, dur)))})`;

  const covered = card.update(t);
  let beat = 'title';

  /* --- clean card arrives ------------------------------------------- */
  const ci = span(t, T.cleanIn, T.cleanIn + 0.8);
  if (ci > 0) beat = 'clean card';

  /* --- crowded aside by the clutter, then forward again -------------- */
  const cin  = easeInOut(span(t, T.clutterIn, T.clutterIn + 1.0));   // clutter slides in
  const cout = easeInOut(span(t, T.approach, T.approach + 0.9));     // clutter recedes
  const crowd = cin * (1 - cout);                                     // how pushed-aside the card is
  if (cin > 0) beat = 'clutter';
  if (cout > 0) beat = 'approachable';

  clutter.style.opacity = String(Math.min(1, cin * 1.4) * (1 - cout));
  clutter.style.transform =
    `translateX(${lerp(-(CLUTTER_X + CLUTTER_W + 40), 0, cin) - cout * 260}px)`
    + ` scale(${lerp(1, 0.96, cout)})`;

  const gx = lerp(0, CARD_SHIFT, crowd);
  const gs = lerp(1, 0.86, crowd);
  /* coming forward gets a little overshoot so it reads as a step toward us */
  const fwd = cout > 0 ? 1 + 0.03 * pulse(cout) : 1;
  group.style.opacity = String(ci * lerp(1, 0.58, crowd));
  group.style.transform =
    `translate(${gx}px, ${lerp(24, 0, easeOut(ci))}px) scale(${lerp(0.94, 1, easeBack(ci)) * gs * fwd})`;
  ticket.el.style.filter = `saturate(${lerp(1, 0.55, crowd)})`;

  /* --- "simple" ------------------------------------------------------- */
  const sp = span(t, T.simple, T.simple + 0.55);
  simpleChip.style.opacity = String(sp);
  simpleChip.style.transform = `scale(${lerp(0.4, 1, easeBack(sp))}) rotate(${lerp(-10, -4, easeOut(sp))}deg)`;

  /* --- the two people, one on each side ------------------------------- */
  const fl = stagger(t, T.figures, 0.25, 0.6, 0);
  const fr = stagger(t, T.figures, 0.25, 0.6, 1);
  if (fl > 0) beat = 'people';

  const tL = wordAt(WORDS, 'submitting', T.checkL);
  const tR = wordAt(WORDS, 'working',    T.checkR);
  const kl = span(t, tL, tL + 0.45);
  const kr = span(t, tR, tR + 0.45);

  /* each figure gives a small nod as its tick lands */
  figL.set({ opacity: fl, y: FIG_Y + lerp(28, 0, easeOut(fl)), headTilt: -6 * pulse(span(t, tL, tL + 0.8)) });
  figR.set({ opacity: fr, y: FIG_Y + lerp(28, 0, easeOut(fr)), headTilt:  6 * pulse(span(t, tR, tR + 0.8)) });

  checkL.style.opacity = String(kl);
  checkL.style.transform = `scale(${lerp(0.3, 1, easeBack(kl))})`;
  checkR.style.opacity = String(kr);
  checkR.style.transform = `scale(${lerp(0.3, 1, easeBack(kr))})`;
  if (kl > 0) beat = 'check: asking';
  if (kr > 0) beat = 'check: working';
  if (t >= T.matters) beat = 'hold';

  /* --- the line -------------------------------------------------------- */
  line.update(t);
  if (t >= T.line) beat = 'line';

  cc.update(t, CUES);
  return covered ? 'title card' : beat;
}
