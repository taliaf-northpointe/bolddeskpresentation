/* ===================================================================
   sec11 — "And down the road…"                                  33.5s

   Adapted from scene11. A long ticket thread sits centre frame. On
   "AI connector" a small labelled plug appears beside it; on
   "summarizing" the thread compresses into a three-line summary card
   tagged "Future possibility", and a manager glances at it. The tag
   pulses once on "future possibility"; a shield and two chips land on
   "security" and "data-governance". Then three small cards from earlier
   sections line up under "Today", the summary card shrinks to join
   them, and the line runs on into two faint empty outlines.

   The caveat is doing real work here: the future-facing part is brief
   and clearly labelled so the pitch does not overpromise.

   Every number below is read from data/cues-sec11.json /
   data/words-sec11.json (where Ava actually says the phrase) and kept
   as a constant so the beat can be re-timed in one place.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, figure, edges,
  node, svgNode, span, lerp, easeOut, easeInOut, easeBack, NAVY, BLUE, INK, INK_SOFT,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';
import { chip } from '../lib/ui.js';

export const id = 'sec11';
export const title = 'And down the road…';
export const dur = 33.5;
export const visemes = null;

const CUES = loadCues('data/cues-sec11.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  cardOut:   3.00,   // title card (hold 2.4 + 0.6 out) has left the frame
  threadIn:  3.00,   // "There's even room to think about what's next." -> long thread
  plug:      4.91,   // "AI"                    -> plug glyph
  plugLabel: 5.20,   // "connector"             -> "AI connector" label
  squash:    7.58,   // "summarizing"           -> the thread compresses
  summary:   8.20,   //                          -> three-line card, tagged
  manager:  10.14,   // "manager"               -> a manager glances at it
  tagPulse: 17.16,   // "future possibility"    -> the tag pulses once
  shield:   21.53,   // "security"              -> shield + "Security review"
  govern:   22.65,   // "data-governance"       -> "Data governance"
  step:     27.67,   // "We're not just looking at…" -> the card rises, the rest steps aside
  today:    28.93,   // "platform"              -> three small cards line up
  todayLab: 29.80,   // "today"                 -> the "Today" label
  join:     30.76,   // "We're looking at what it could grow into." -> summary joins the line
  outlines: 31.45,   //                          -> two faint empty outlines
  line:     31.70,   // "grow into"             -> "Room to grow."
};

const REPLIES = 16;                 // rows drawn in the thread

const SUMMARY = [
  'Access request, opened Monday.',
  'Waiting on the requester since Tuesday.',
  'One step left before it can be closed.',
];

/* the line of small cards: three from earlier sections, then the
   summary, then room */
const SLOT = { w: 230, gap: 26, x0: 205, y: 480 };
const slotX = i => SLOT.x0 + i * (SLOT.w + SLOT.gap);
const TODAY = ['Portal', 'Dashboard', 'Automation'];

/* geometry the joins depend on */
const THREAD = { x: 800, y: 130, w: 320 };
const SUM    = { x: 560, y: 300, w: 800 };
const PLUG   = { x: 1170, x2: 1420, y: 300 };

let root, card, cc, thread, threadBars = [], plug, plugLabel,
    summary, sumRows = [], tag, mgr, shieldRow, shieldIcon, chipSec, chipGov,
    todayLabel, todayCards = [], joined, outlines = [], line;

function smallCard(text, x, { future = false } = {}) {
  return node('div', { text, style: {
    position: 'absolute', left: x + 'px', top: SLOT.y + 'px',
    width: SLOT.w + 'px', padding: '20px 0', textAlign: 'center', boxSizing: 'border-box',
    background: future ? 'rgba(255,255,255,.7)' : '#fff', borderRadius: '14px', opacity: 0,
    border: future ? '2px dashed rgba(0,134,177,.55)' : '2px solid transparent',
    boxShadow: future ? 'none' : '0 12px 30px rgba(14,46,60,.12)',
    fontSize: '24px', fontWeight: 700, color: future ? BLUE : 'rgba(14,46,60,.70)',
    transformOrigin: '50% 50%',
  }}, root);
}

export function build(container) {
  root = container;
  paper(root);

  /* --- the long thread, centre ------------------------------------- */
  thread = node('div', { style: {
    position: 'absolute', left: THREAD.x + 'px', top: THREAD.y + 'px', width: THREAD.w + 'px',
    background: '#fff', borderRadius: '16px', padding: '22px',
    boxShadow: '0 24px 58px rgba(14,46,60,.20)', opacity: 0,
    transformOrigin: '50% 50%', boxSizing: 'border-box',
  }}, root);
  node('div', { text: 'TICKET THREAD · 27 REPLIES', style: {
    fontSize: '14px', letterSpacing: '.16em', color: BLUE, fontWeight: 700, marginBottom: '16px',
  }}, thread);
  for (let i = 0; i < REPLIES; i++) {
    const row = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px',
      flexDirection: i % 2 ? 'row-reverse' : 'row',
    }}, thread);
    node('div', { style: {
      width: '18px', height: '18px', borderRadius: '50%', flex: '0 0 auto',
      background: i % 2 ? 'rgba(22,67,86,.28)' : 'rgba(0,134,177,.30)',
    }}, row);
    threadBars.push(node('div', { style: {
      height: '16px', borderRadius: '5px',
      width: (i % 3 === 0 ? '78%' : i % 3 === 1 ? '58%' : '68%'),
      background: i % 2 ? 'rgba(22,67,86,.30)' : 'rgba(0,134,177,.24)',
    }}, row));
  }

  /* --- the connector ---------------------------------------------- */
  plug = svgNode('svg', { viewBox: '0 0 64 64', width: 96, height: 96 }, root);
  Object.assign(plug.style, { position: 'absolute', left: PLUG.x + 'px', top: PLUG.y + 'px',
                              opacity: 0, transformOrigin: '50% 50%', overflow: 'visible' });
  svgNode('rect', { x: 21, y: 5, width: 7, height: 15, rx: 2.5, fill: BLUE }, plug);
  svgNode('rect', { x: 36, y: 5, width: 7, height: 15, rx: 2.5, fill: BLUE }, plug);
  svgNode('rect', { x: 13, y: 19, width: 38, height: 26, rx: 7,
    fill: 'rgba(0,134,177,.12)', stroke: BLUE, 'stroke-width': 2.4 }, plug);
  svgNode('path', { d: 'M32 45 v7 q0 7 -7 7 h-9', fill: 'none', stroke: BLUE,
    'stroke-width': 2.4, 'stroke-linecap': 'round' }, plug);
  plugLabel = node('div', { text: 'AI connector', style: {
    position: 'absolute', left: (PLUG.x - 42) + 'px', top: (PLUG.y + 102) + 'px', width: '180px',
    textAlign: 'center', fontSize: '22px', fontWeight: 700, color: BLUE, letterSpacing: '.02em',
    opacity: 0,
  }}, root);

  /* --- what it becomes --------------------------------------------- */
  summary = node('div', { style: {
    position: 'absolute', left: SUM.x + 'px', top: SUM.y + 'px', width: SUM.w + 'px',
    background: '#fff', borderRadius: '18px', borderLeft: '10px solid ' + BLUE,
    padding: '28px 34px 24px', opacity: 0, boxSizing: 'border-box',
    boxShadow: '0 26px 62px rgba(14,46,60,.20)', transformOrigin: '50% 0%',
  }}, root);
  const head = node('div', { style: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px',
  }}, summary);
  node('div', { text: 'IN THREE LINES', style: {
    fontSize: '16px', letterSpacing: '.18em', color: BLUE, fontWeight: 700,
  }}, head);
  /* the tag: dashed, so it reads as "not yet" rather than as a status */
  tag = node('div', { text: 'Future possibility', style: {
    padding: '6px 16px', borderRadius: '999px', border: '2px dashed rgba(0,134,177,.6)',
    color: BLUE, fontSize: '20px', fontWeight: 700, whiteSpace: 'nowrap',
    transformOrigin: '50% 50%',
  }}, head);
  SUMMARY.forEach(txt => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '7px 0', opacity: 0,
    }}, summary);
    node('div', { style: {
      width: '9px', height: '9px', borderRadius: '50%', background: BLUE,
      flex: '0 0 auto', marginTop: '12px',
    }}, r);
    node('div', { text: txt, style: {
      fontSize: '27px', lineHeight: 1.35, color: NAVY, fontWeight: 600,
    }}, r);
    sumRows.push(r);
  });

  /* --- the manager who reads it in a glance ------------------------ */
  mgr = figure(root, { x: 300, y: 360, h: 280, label: 'Manager' });

  /* --- the caveat -------------------------------------------------- */
  shieldRow = node('div', { style: {
    position: 'absolute', left: SUM.x + 'px', top: '590px',
    display: 'flex', alignItems: 'center', gap: '18px', opacity: 0,
  }}, root);
  shieldIcon = svgNode('svg', { viewBox: '0 0 32 32', width: 56, height: 56 }, shieldRow);
  shieldIcon.style.transformOrigin = '50% 50%';
  svgNode('path', { d: 'M16 3l11 4v8c0 7.2-4.6 11.8-11 14-6.4-2.2-11-6.8-11-14V7z',
    fill: 'rgba(0,134,177,.10)', stroke: BLUE, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, shieldIcon);
  svgNode('path', { d: 'M11 16l4 4 7-8', fill: 'none', stroke: BLUE,
    'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, shieldIcon);
  chipSec = chip(shieldRow, 'Security review', 'open', 22);
  chipGov = chip(shieldRow, 'Data governance', 'open', 22);
  chipSec.style.transformOrigin = '0% 50%';
  chipGov.style.transformOrigin = '0% 50%';

  /* --- today, and the room beyond it -------------------------------- */
  todayLabel = node('div', { text: 'TODAY', style: {
    position: 'absolute', left: slotX(0) + 'px', top: (SLOT.y - 44) + 'px',
    fontSize: '20px', letterSpacing: '.18em', color: INK_SOFT, fontWeight: 700, opacity: 0,
  }}, root);
  TODAY.forEach((label, i) => todayCards.push(smallCard(label, slotX(i))));
  joined = smallCard('AI summary', slotX(3), { future: true });
  outlines = [4, 5].map(i => node('div', { style: {
    position: 'absolute', left: slotX(i) + 'px', top: SLOT.y + 'px',
    width: SLOT.w + 'px', height: '73px', boxSizing: 'border-box', borderRadius: '14px',
    border: '2px dashed rgba(22,67,86,.20)', opacity: 0,
  }}, root));

  line = onScreen(root, { text: 'Room to grow.', y: 640, size: 46, t0: T.line });

  card = titleCard(root, { n: 11, title: 'And down the road…' });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* --- the thread, then the squeeze --------------------------------- */
  const ti = span(t, T.threadIn, T.threadIn + 0.7);
  const sq = easeInOut(span(t, T.squash, T.squash + 0.8));
  thread.style.opacity = String(ti * (1 - sq));
  thread.style.transform =
    `translateY(${lerp(20, 0, easeOut(ti)) + lerp(0, 30, sq)}px) scaleY(${lerp(1, 0.12, sq)})`;

  /* --- the connector: appears, slides aside as the card grows, steps away */
  const pi = span(t, T.plug, T.plug + 0.5);
  const away = span(t, T.step, T.step + 0.5);
  const beat = pulse(span(t, T.squash - 0.1, T.squash + 0.6));
  const slide = lerp(0, PLUG.x2 - PLUG.x, sq);
  plug.style.opacity = String(pi * (1 - away));
  plug.style.transform = `translateX(${slide}px) scale(${lerp(0.6, 1, easeBack(pi)) * (1 + beat * 0.14)})`;
  const pl = span(t, T.plugLabel, T.plugLabel + 0.4);
  plugLabel.style.opacity = String(pl * (1 - away));
  plugLabel.style.transform = `translate(${slide}px, ${lerp(8, 0, easeOut(pl))}px)`;

  /* --- three lines, tagged ------------------------------------------- */
  const su = span(t, T.summary, T.summary + 0.7);
  const rise = easeInOut(span(t, T.step, T.step + 0.9));
  const jn = easeInOut(span(t, T.join, T.join + 0.75));
  /* the card grows out of the thread, rises to make room, then shrinks
     into its place in the line */
  const sx = lerp(lerp(lerp(0.42, 1, easeOut(su)), 0.72, rise), SLOT.w / SUM.w, jn);
  const sy = lerp(lerp(lerp(0.70, 1, easeOut(su)), 0.72, rise), SLOT.w / SUM.w, jn);
  const ty = lerp(lerp(0, -150, rise), SLOT.y - SUM.y, jn);
  const tx = lerp(0, (slotX(3) + SLOT.w / 2) - (SUM.x + SUM.w / 2), jn);
  summary.style.opacity = String(su * (1 - span(t, T.join + 0.45, T.join + 0.75)));
  summary.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
  sumRows.forEach((r, i) => {
    r.style.opacity = String(stagger(t, T.summary + 0.4, 0.3, 0.4, i));
  });
  /* the tag lands with the card and pulses once on "future possibility" */
  const tg = span(t, T.summary + 0.3, T.summary + 0.8);
  tag.style.opacity = String(tg);
  tag.style.transform = `scale(${lerp(0.76, 1, easeBack(tg)) * (1 + pulse(span(t, T.tagPulse, T.tagPulse + 0.8)) * 0.14)})`;

  /* --- the manager glances --------------------------------------------- */
  const mi = span(t, T.summary + 0.2, T.summary + 0.9);
  const gl = easeOut(span(t, T.manager, T.manager + 0.6));
  mgr.set({ opacity: mi * (1 - away), headTilt: 10 * gl });

  /* --- the caveat -------------------------------------------------------- */
  const sd = span(t, T.shield, T.shield + 0.6);
  shieldRow.style.opacity = String(Math.max(sd, 0) * (1 - away));
  shieldRow.style.transform = `translateY(${lerp(14, 0, easeOut(sd))}px)`;
  shieldIcon.style.transform = `scale(${lerp(0.5, 1, easeBack(sd))})`;
  chipSec.style.opacity = String(span(t, T.shield + 0.15, T.shield + 0.55));
  chipSec.style.transform = `scale(${lerp(0.8, 1, easeBack(span(t, T.shield + 0.15, T.shield + 0.6)))})`;
  const gv = span(t, T.govern, T.govern + 0.45);
  chipGov.style.opacity = String(gv);
  chipGov.style.transform = `scale(${lerp(0.8, 1, easeBack(gv))})`;

  /* --- today ---------------------------------------------------------- */
  todayCards.forEach((el, i) => {
    const u = stagger(t, T.today, 0.26, 0.5, i);
    el.style.opacity = String(u * 0.95);
    el.style.transform = `translateY(${lerp(18, 0, easeOut(u))}px) scale(${lerp(0.9, 1, easeBack(u))})`;
  });
  const tl = span(t, T.todayLab, T.todayLab + 0.5);
  todayLabel.style.opacity = String(tl * 0.9);
  todayLabel.style.transform = `translateY(${lerp(8, 0, easeOut(tl))}px)`;

  /* --- and what it could grow into ------------------------------------- */
  const jo = span(t, T.join + 0.4, T.join + 0.85);
  joined.style.opacity = String(jo);
  joined.style.transform = `scale(${lerp(0.9, 1, easeBack(jo))})`;
  outlines.forEach((el, i) => {
    const u = stagger(t, T.outlines, 0.25, 0.5, i);
    el.style.opacity = String(u);
    el.style.transform = `translateX(${lerp(-16, 0, easeOut(u))}px)`;
  });

  line.update(t);

  cc.update(t, CUES);
  return `thread ${ti.toFixed(2)} squash ${sq.toFixed(2)} rise ${rise.toFixed(2)} join ${jn.toFixed(2)}`;
}
