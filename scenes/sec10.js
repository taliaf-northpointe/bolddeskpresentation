/* ===================================================================
   sec10 — "Built to connect"                                   53.1s

   Adapted from scene10. A ticket sits alone; two faint panels appear
   ("Project work", "Automation"); the Project work panel comes forward
   and the ticket is pushed into it as a task, the task number and link
   come back, a line stays between them. Then the bigger idea: unnamed
   tools link to the same ticket and the duplicate entry fades. Five
   automation chips land one per spoken word, recede, and a figure
   steps forward with the time given back.

   Product logos stay secondary: the panel leads with "Project work"
   and carries "in ClickUp" underneath, as scene10 did. All timings are
   read from data/words-sec10.json / data/cues-sec10.json.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, figure, edges,
  node, svgNode, span, lerp, clamp, easeOut, easeInOut, easeBack, NAVY, BLUE,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';

export const id = 'sec10';
export const title = 'Built to connect';
export const dur = 53.1;
export const visemes = null;

const CUES = loadCues('data/cues-sec10.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  ticketIn:  3.0,    // title card gone; "stand alone" (2.96) -> the ticket, alone
  panels:    4.46,   // "connect with other platforms"  -> two faint panels
  automate:  6.32,   // "automate repetitive work"      -> Automation panel breathes
  clickup:  12.21,   // "with ClickUp"                  -> Project work comes forward
  tick:     13.60,   // "A ticket"                      -> the checkbox ticks
  push:     14.25,   // "pushed into ClickUp"           -> it crosses
  task:     15.63,   // "as a project task"             -> the task card appears
  fields:   16.91,   // "information carried over"      -> fields fill in
  number:   20.20,   // "The ClickUp number"            -> TASK-318
  linkBack: 20.80,   // "and link can then come back"   -> link chip travels back
  onTicket: 22.42,   // "into the BoldDesk ticket"      -> lands as a linked row
  keep:     23.82,   // "keeping the two systems connected" -> connecting line stays
  tools:    30.14,   // "connect the tools teams already use" -> unnamed tools link in
  dupIn:    32.25,   // "instead of making people duplicate" -> "typed twice" ghost
  dupOut:   33.63,   // "duplicate"                     -> and it fades
  autoIn:   37.15,   // "opportunities for automated"   -> Automation panel forward
  chips: [38.69, 39.77, 40.32, 41.23, 43.17],   // responses, routing, assignment, document, repetitive
  recede:   45.35,   // "every time we automate"        -> chips and cards recede
  person:   46.20,   // "automate something repetitive" -> figure steps forward
  giving:   48.20,   // "giving people back time"       -> the clock winds back
  line:     49.51,   // "to work on the things..."      -> on-screen line
};

const CHIPS = [
  { label: 'Auto-reply',        glyph: 'reply' },
  { label: 'Routed',            glyph: 'route' },
  { label: 'Assigned',          glyph: 'owner' },
  { label: 'Documents handled', glyph: 'doc'   },
  { label: 'Repetitive tasks',  glyph: 'loop'  },
];

/* ticket card geometry (hard-coded; the card is laid out at build) */
const TK = { x: 190, y: 236, w: 620, h: 295 };
const PW = { x: 1060, y: 200, w: 720 };     // Project work panel
const AU = { x: 1060, y: 580, w: 720 };     // Automation panel

let root, card, cc, ticket, checkbox, checkTick, linkRow, flyer, backChip,
    panelPW, panelAU, task, taskId, fieldRows = [], linkSvg, connPath,
    tiles = [], tileLines = [], ghost, ghostStrike, chips = [], dim = [],
    person, clockSvg, clockHand, clockArc, line;

function glyph(kind, parent) {
  const svg = svgNode('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, parent);
  const st = { fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-linecap': 'round',
               'stroke-linejoin': 'round' };
  if (kind === 'reply') {
    svgNode('path', { ...st, d: 'M9 7L4 12l5 5' }, svg);
    svgNode('path', { ...st, d: 'M4 12h10a6 6 0 0 1 6 6v1' }, svg);
  } else if (kind === 'route') {
    svgNode('path', { ...st, d: 'M4 7h6l4 5h6' }, svg);
    svgNode('path', { ...st, d: 'M16 9l4 3-4 3' }, svg);
    svgNode('path', { ...st, d: 'M4 17h6' }, svg);
  } else if (kind === 'owner') {
    svgNode('circle', { ...st, cx: 12, cy: 8.5, r: 3.6 }, svg);
    svgNode('path', { ...st, d: 'M5 20a7 7 0 0 1 14 0' }, svg);
  } else if (kind === 'doc') {
    svgNode('path', { ...st, d: 'M7 3h7l4 4v14H7z' }, svg);
    svgNode('path', { ...st, d: 'M14 3v4h4M10 12h5M10 16h5' }, svg);
  } else {
    svgNode('path', { ...st, d: 'M4 12a8 8 0 0 1 13.7-5.6L20 8' }, svg);
    svgNode('path', { ...st, d: 'M20 4v4h-4' }, svg);
    svgNode('path', { ...st, d: 'M20 12a8 8 0 0 1-13.7 5.6L4 16' }, svg);
    svgNode('path', { ...st, d: 'M4 20v-4h4' }, svg);
  }
  return svg;
}

/* an unnamed tool: a rounded tile with an abstract mark */
function toolTile(parent, x, y, kind) {
  const el = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px', width: '180px', height: '120px',
    background: '#fff', borderRadius: '16px', boxShadow: '0 12px 30px rgba(14,46,60,.12)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '10px', opacity: 0, transformOrigin: '50% 50%',
  }}, parent);
  const svg = svgNode('svg', { viewBox: '0 0 40 40', width: 40, height: 40 }, el);
  const st = { fill: 'rgba(0,134,177,.18)', stroke: BLUE, 'stroke-width': 2.2, 'stroke-linejoin': 'round' };
  if (kind === 0) svgNode('circle', { ...st, cx: 20, cy: 20, r: 14 }, svg);
  else if (kind === 1) svgNode('rect', { ...st, x: 7, y: 7, width: 26, height: 26, rx: 6 }, svg);
  else if (kind === 2) svgNode('path', { ...st, d: 'M20 5l14 24H6z' }, svg);
  else svgNode('path', { ...st, d: 'M20 4l14 8v16l-14 8-14-8V12z' }, svg);
  node('div', { text: 'Tool', style: {
    fontSize: '20px', fontWeight: 700, color: 'rgba(14,46,60,.55)', letterSpacing: '.06em',
  }}, el);
  return el;
}

export function build(container) {
  root = container;
  paper(root);

  /* --- the ticket, with a checkbox --------------------------------- */
  ticket = node('div', { style: {
    position: 'absolute', left: TK.x + 'px', top: TK.y + 'px', width: TK.w + 'px',
    background: '#fff', borderRadius: '20px', borderLeft: '10px solid ' + BLUE,
    boxShadow: '0 24px 58px rgba(14,46,60,.18)', padding: '28px 32px', opacity: 0,
  }}, root);
  node('div', { text: 'TICKET #1042', style: {
    fontSize: '17px', letterSpacing: '.18em', color: BLUE,
    fontWeight: 700, marginBottom: '12px',
  }}, ticket);
  node('div', { text: 'Access to a system', style: {
    fontSize: '31px', fontWeight: 700, color: NAVY, marginBottom: '20px',
  }}, ticket);

  const cbRow = node('div', { style: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 18px', background: '#F5FAFC', borderRadius: '12px',
  }}, ticket);
  checkbox = node('div', { style: {
    width: '34px', height: '34px', borderRadius: '8px', flex: '0 0 auto',
    border: '3px solid rgba(0,134,177,.42)', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}, cbRow);
  const cbsvg = svgNode('svg', { viewBox: '0 0 24 24', width: 22, height: 22 }, checkbox);
  checkTick = svgNode('path', { d: 'M5 13l4 4 10-11', fill: 'none', stroke: '#fff',
    'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'stroke-dasharray': 26, 'stroke-dashoffset': 26 }, cbsvg);
  node('div', { text: 'Track this as project work', style: {
    fontSize: '24px', fontWeight: 700, color: NAVY,
  }}, cbRow);

  /* the row the integration writes back into the ticket */
  linkRow = node('div', { style: {
    display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px',
    padding: '14px 18px', background: '#fff', borderRadius: '12px',
    border: '2px dashed rgba(0,134,177,.40)', opacity: 0,
  }}, ticket);
  const lk = svgNode('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, linkRow);
  svgNode('path', { d: 'M10 14a4 4 0 0 1 0-5.6l2.2-2.2a4 4 0 0 1 5.6 5.6L16 13.6',
    fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-linecap': 'round' }, lk);
  svgNode('path', { d: 'M14 10a4 4 0 0 1 0 5.6l-2.2 2.2a4 4 0 0 1-5.6-5.6L8 10.4',
    fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-linecap': 'round' }, lk);
  node('div', { text: 'Linked  ·  TASK-318', style: {
    fontSize: '22px', fontWeight: 700, color: BLUE,
  }}, linkRow);

  /* --- project work panel ------------------------------------------ */
  panelPW = node('div', { style: {
    position: 'absolute', left: PW.x + 'px', top: PW.y + 'px', width: PW.w + 'px',
    background: '#F7FBFC', borderRadius: '20px', padding: '26px 30px',
    border: '2px dashed rgba(22,67,86,.18)',
    boxShadow: '0 20px 50px rgba(14,46,60,.14)', opacity: 0, transformOrigin: '50% 50%',
  }}, root);
  node('div', { text: 'Project work', style: {
    fontSize: '30px', fontWeight: 700, color: NAVY,
  }}, panelPW);
  /* the product name stays secondary */
  const inClickUp = node('div', { text: 'in ClickUp', style: {
    fontSize: '19px', color: 'rgba(14,46,60,.46)', marginBottom: '22px', opacity: 0,
  }}, panelPW);

  task = node('div', { style: {
    background: '#fff', borderRadius: '13px', padding: '20px 22px',
    boxShadow: '0 8px 22px rgba(14,46,60,.10)', opacity: 0, transformOrigin: '50% 50%',
  }}, panelPW);
  node('div', { text: 'Access to a system', style: {
    fontSize: '24px', fontWeight: 700, color: NAVY,
  }}, task);
  taskId = node('div', { text: 'TASK-318', style: {
    marginTop: '8px', fontSize: '20px', fontWeight: 700, color: BLUE, opacity: 0,
  }}, task);
  const fields = node('div', { style: { marginTop: '14px' }}, task);
  [['Requester', 'A colleague'], ['Priority', 'Normal'], ['Source', 'Ticket #1042']].forEach(([k, v]) => {
    const r = node('div', { style: {
      display: 'flex', justifyContent: 'space-between', padding: '7px 0',
      borderTop: '1px solid rgba(22,67,86,.10)', opacity: 0,
    }}, fields);
    node('div', { text: k, style: { fontSize: '19px', color: 'rgba(14,46,60,.55)' }}, r);
    node('div', { text: v, style: { fontSize: '19px', fontWeight: 700, color: NAVY }}, r);
    fieldRows.push(r);
  });

  /* --- automation panel -------------------------------------------- */
  panelAU = node('div', { style: {
    position: 'absolute', left: AU.x + 'px', top: AU.y + 'px', width: AU.w + 'px',
    background: '#F7FBFC', borderRadius: '20px', padding: '26px 30px',
    border: '2px dashed rgba(22,67,86,.18)',
    boxShadow: '0 20px 50px rgba(14,46,60,.14)', opacity: 0, transformOrigin: '50% 50%',
  }}, root);
  node('div', { text: 'Automation', style: {
    fontSize: '30px', fontWeight: 700, color: NAVY,
  }}, panelAU);
  node('div', { text: 'runs on its own', style: {
    fontSize: '19px', color: 'rgba(14,46,60,.46)', marginBottom: '20px',
  }}, panelAU);
  const chipWrap = node('div', { style: {
    display: 'flex', flexWrap: 'wrap', gap: '14px 16px',
  }}, panelAU);
  CHIPS.forEach(c => {
    const el = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '13px 20px', background: '#fff', borderRadius: '14px',
      boxShadow: '0 10px 26px rgba(14,46,60,.12)', opacity: 0, transformOrigin: '50% 50%',
    }}, chipWrap);
    glyph(c.glyph, el);
    node('div', { text: c.label, style: {
      fontSize: '22px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
    }}, el);
    chips.push(el);
  });

  /* --- the things that cross --------------------------------------- */
  flyer = node('div', { text: 'Access to a system', style: {
    position: 'absolute', left: '760px', top: '330px', width: '250px',
    padding: '16px 20px', background: '#fff', borderRadius: '12px',
    borderLeft: '6px solid ' + BLUE, opacity: 0,
    boxShadow: '0 14px 32px rgba(14,46,60,.20)',
    fontSize: '20px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, root);
  backChip = node('div', { style: {
    position: 'absolute', left: '1090px', top: '400px',
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 18px', background: '#fff', borderRadius: '999px',
    boxShadow: '0 12px 28px rgba(14,46,60,.18)', opacity: 0,
    fontSize: '20px', fontWeight: 700, color: BLUE, whiteSpace: 'nowrap',
  }}, root);
  const bl = svgNode('svg', { viewBox: '0 0 24 24', width: 22, height: 22 }, backChip);
  svgNode('path', { d: 'M10 14a4 4 0 0 1 0-5.6l2.2-2.2a4 4 0 0 1 5.6 5.6L16 13.6',
    fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-linecap': 'round' }, bl);
  svgNode('path', { d: 'M14 10a4 4 0 0 1 0 5.6l-2.2 2.2a4 4 0 0 1-5.6-5.6L8 10.4',
    fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-linecap': 'round' }, bl);
  node('div', { text: 'TASK-318' }, backChip);

  /* --- lines: ticket <-> task, ticket <-> tools ---------------------- */
  linkSvg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, root);
  Object.assign(linkSvg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });
  connPath = svgNode('path', {
    d: `M ${TK.x + TK.w} 470 C 940 470, 960 340, ${PW.x + 30} 340`,
    fill: 'none', stroke: BLUE, 'stroke-width': 3, 'stroke-dasharray': '8 10',
    'stroke-opacity': 0,
  }, linkSvg);

  /* unnamed tools under the ticket, each on a thin line to it */
  const tileXs = [190, 410, 630];
  tileXs.forEach((x, i) => {
    tiles.push(toolTile(root, x, 640, i));
    const cx = x + 90;
    const p = svgNode('path', {
      d: `M ${cx} 640 C ${cx} 590, ${lerp(cx, 500, 0.5)} 580, 500 ${TK.y + TK.h + 2}`,
      fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-opacity': 0.6,
      pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1,
    }, linkSvg);
    tileLines.push(p);
  });

  /* the thing we are not asking people to do */
  ghost = node('div', { style: {
    position: 'absolute', left: '862px', top: '640px', width: '210px',
    padding: '18px 20px', background: 'rgba(255,255,255,.7)', borderRadius: '12px',
    border: '2px dashed rgba(22,67,86,.30)', opacity: 0, transformOrigin: '50% 50%',
    fontSize: '21px', fontWeight: 700, color: 'rgba(22,67,86,.55)', textAlign: 'center',
    whiteSpace: 'nowrap',
  }}, root);
  node('div', { text: 'Typed twice' }, ghost);
  ghostStrike = node('div', { style: {
    position: 'absolute', left: '20px', right: '20px', top: '50%', height: '3px',
    background: BLUE, borderRadius: '2px', transformOrigin: '0 50%', transform: 'scaleX(0)',
  }}, ghost);

  /* --- the person the time goes back to ------------------------------ */
  person = figure(root, { x: 830, y: 500, h: 320 });
  person.set({ opacity: 0 });
  clockSvg = svgNode('svg', { viewBox: '0 0 100 100', width: 110, height: 110 }, root);
  Object.assign(clockSvg.style, { position: 'absolute', left: '1000px', top: '470px', opacity: 0 });
  svgNode('circle', { cx: 50, cy: 50, r: 44, fill: '#fff', stroke: NAVY, 'stroke-width': 4 }, clockSvg);
  clockArc = svgNode('circle', { cx: 50, cy: 50, r: 36, fill: 'none', stroke: 'rgba(0,134,177,.30)',
    'stroke-width': 14, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1,
    transform: 'rotate(-90 50 50)' }, clockSvg);
  clockHand = svgNode('path', { d: 'M50 50 L50 20', stroke: BLUE, 'stroke-width': 5,
    'stroke-linecap': 'round' }, clockSvg);
  svgNode('path', { d: 'M50 50 L68 50', stroke: NAVY, 'stroke-width': 4, 'stroke-linecap': 'round' }, clockSvg);
  svgNode('circle', { cx: 50, cy: 50, r: 4, fill: NAVY }, clockSvg);

  line = onScreen(root, { text: 'Time back for the work that needs a person.', y: 60, size: 46, t0: T.line });

  dim = [ticket, panelPW, panelAU];
  panelPW.inClickUp = inClickUp;

  card = titleCard(root, { n: 10, title: 'Built to connect' });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* everything from before recedes for the last beat */
  const rec = easeInOut(span(t, T.recede, T.recede + 0.9));

  /* --- the ticket, alone --------------------------------------------- */
  const ti = span(t, T.ticketIn, T.ticketIn + 0.7);
  ticket.style.opacity = ti * (1 - rec * 0.82);
  ticket.style.transform = `translateY(${lerp(22, 0, easeOut(ti))}px)`;

  /* --- two faint panels ----------------------------------------------- */
  const p1 = span(t, T.panels, T.panels + 0.6);
  const p2 = span(t, T.panels + 0.25, T.panels + 0.85);
  const fwd = easeOut(span(t, T.clickup, T.clickup + 0.6));       // Project work comes forward
  const afwd = easeOut(span(t, T.autoIn, T.autoIn + 0.6));        // Automation comes forward
  const breathe = pulse(span(t, T.automate, T.automate + 0.8)) * 0.02;

  panelPW.style.opacity = lerp(0.45, 1, fwd) * p1 * (1 - rec * 0.82);
  panelPW.style.transform = `translateY(${lerp(18, 0, easeOut(p1))}px) scale(${lerp(0.97, 1, fwd)})`;
  panelPW.style.borderColor = fwd > 0.5 ? 'rgba(22,67,86,0)' : 'rgba(22,67,86,.18)';
  panelPW.style.background = fwd > 0.5 ? '#F7FBFC' : 'rgba(247,251,252,.6)';
  panelPW.inClickUp.style.opacity = fwd;

  panelAU.style.opacity = lerp(0.45, 1, afwd) * p2 * (1 - rec * 0.82);
  panelAU.style.transform = `translateY(${lerp(18, 0, easeOut(p2))}px) scale(${lerp(0.97, 1, afwd) + breathe})`;
  panelAU.style.borderColor = afwd > 0.5 ? 'rgba(22,67,86,0)' : 'rgba(22,67,86,.18)';
  panelAU.style.background = afwd > 0.5 ? '#F7FBFC' : 'rgba(247,251,252,.6)';

  /* --- the checkbox --------------------------------------------------- */
  const ck = span(t, T.tick, T.tick + 0.4);
  checkbox.style.background = ck > 0.35 ? BLUE : '#fff';
  checkbox.style.borderColor = ck > 0.35 ? BLUE : 'rgba(0,134,177,.42)';
  checkTick.setAttribute('stroke-dashoffset',
    String(lerp(26, 0, easeOut(span(t, T.tick + 0.1, T.tick + 0.55)))));
  checkbox.style.transform = `scale(${1 + pulse(ck) * 0.12})`;

  /* --- it crosses, and becomes a task with its fields ----------------- */
  const fl = span(t, T.push, T.task);
  const f = easeInOut(fl);
  flyer.style.opacity = Math.min(span(t, T.push, T.push + 0.2), 1 - span(t, T.task - 0.2, T.task + 0.1));
  flyer.style.transform = `translateX(${lerp(0, 330, f)}px)`;

  const tk = span(t, T.task - 0.1, T.task + 0.5);
  task.style.opacity = tk;
  task.style.transform = `scale(${lerp(0.92, 1, easeBack(tk))})`;
  fieldRows.forEach((r, i) => {
    const u = stagger(t, T.fields, 0.45, 0.4, i);
    r.style.opacity = u;
    r.style.transform = `translateX(${lerp(12, 0, easeOut(u))}px)`;
  });
  taskId.style.opacity = String(span(t, T.number, T.number + 0.4));
  taskId.style.transform = `scale(${1 + pulse(span(t, T.number, T.number + 0.6)) * 0.08})`;

  /* --- the number and link travel back -------------------------------- */
  const lb = span(t, T.linkBack, T.onTicket);
  const g = easeInOut(lb);
  backChip.style.opacity = Math.min(span(t, T.linkBack, T.linkBack + 0.2), 1 - span(t, T.onTicket - 0.15, T.onTicket + 0.1));
  backChip.style.transform = `translate(${lerp(0, -560, g)}px, ${lerp(0, 46, g)}px)`;
  const lr = span(t, T.onTicket, T.onTicket + 0.5);
  linkRow.style.opacity = lr;
  linkRow.style.transform = `translateX(${lerp(22, 0, easeOut(lr))}px)`;

  /* the line between the two stays */
  connPath.setAttribute('stroke-opacity', String(span(t, T.keep, T.keep + 0.9) * 0.85 * (1 - rec)));

  /* --- the tools teams already use ------------------------------------ */
  const toolsOut = span(t, T.autoIn - 0.4, T.autoIn + 0.2);
  tiles.forEach((el, i) => {
    const u = stagger(t, T.tools, 0.55, 0.5, i);
    el.style.opacity = u * (1 - toolsOut);
    el.style.transform = `translateY(${lerp(20, 0, easeOut(u))}px) scale(${lerp(0.9, 1, easeBack(u))})`;
    tileLines[i].setAttribute('stroke-dashoffset', String(1 - easeOut(stagger(t, T.tools + 0.3, 0.55, 0.6, i))));
    tileLines[i].setAttribute('stroke-opacity', String(0.6 * (1 - toolsOut)));
  });

  /* the duplicate entry, struck through and gone */
  const gi = span(t, T.dupIn, T.dupIn + 0.4);
  const go = span(t, T.dupOut, T.dupOut + 0.9);
  ghost.style.opacity = gi * (1 - go);
  ghost.style.transform = `rotate(-4deg) translateY(${lerp(12, 0, easeOut(gi)) + go * 10}px) scale(${lerp(1, 0.9, go)})`;
  ghostStrike.style.transform = `scaleX(${easeOut(span(t, T.dupOut - 0.1, T.dupOut + 0.3))})`;

  /* --- five automation chips, one per word ---------------------------- */
  chips.forEach((el, i) => {
    const u = span(t, T.chips[i], T.chips[i] + 0.45);
    el.style.opacity = u * (1 - rec * 0.7);
    el.style.transform = `translateY(${lerp(16, 0, easeOut(u))}px) scale(${lerp(0.86, 1, easeBack(u))})`;
  });

  /* --- the person steps forward, and gets time back ------------------- */
  const pf = easeOut(span(t, T.person, T.person + 0.9));
  const wave = pulse(span(t, T.giving, T.giving + 1.2));
  person.set({ opacity: pf, scale: lerp(0.86, 1, pf), y: lerp(560, 500, pf), headTilt: -4 * wave, armR: 50 * pf + 10 * wave });

  const cl = span(t, T.giving, T.giving + 0.5);
  clockSvg.style.opacity = cl;
  clockSvg.style.transform = `translateY(${lerp(14, 0, easeOut(cl))}px) scale(${lerp(0.8, 1, easeBack(cl))})`;
  const wind = easeInOut(span(t, T.giving + 0.2, T.giving + 1.6));   // hand winds back — time returned
  clockHand.setAttribute('transform', `rotate(${lerp(0, -300, wind)} 50 50)`);
  clockArc.setAttribute('stroke-dashoffset', String(1 - wind * 0.83));

  line.update(t);

  cc.update(t, CUES);
  return `ticket ${ti.toFixed(2)} push ${fl.toFixed(2)} back ${lb.toFixed(2)} rec ${rec.toFixed(2)}`;
}
