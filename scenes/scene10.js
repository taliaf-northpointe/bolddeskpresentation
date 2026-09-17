/* ===================================================================
   SCENE 10 — "Automation gives time back"               3:55 – 4:20

   The extensibility argument. A ticket becomes a task in the tool a
   team already uses, the link comes back, and then four things happen
   without anyone doing them.

   Build note: keep product logos secondary — the value is connected
   work, not the integration. So the right-hand panel leads with
   "Project work" and carries the product name as a small sub-label.
   The narration names it; the screen does not shout it.

   Framed as tried during the trial rather than as delivered
   infrastructure, consistent with the rest of the film.
=================================================================== */

import {
  node, svgNode, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';
import { chip } from '../lib/ui.js';

export const id = 'scene10';
export const title = 'Automation gives time back';
export const dur = 25.0;
export const visemes = null;

const CUES = [
  [0.30,  7.60, "BoldDesk can also connect with tools like ClickUp, carrying information into project work without entering it twice."],
  [8.00, 17.80, "It can automate acknowledgments, routing, and assignment — a team can even publish its support hours, so nothing that arrives overnight goes unanswered."],
  [18.20,24.40, "Every task we automate gives someone time back for work that actually needs a person."],
];

const AUTOS = [
  { t:  9.00, label: 'Acknowledgment sent',      glyph: 'reply' },
  { t: 11.10, label: 'Routed to the right team',  glyph: 'route' },
  { t: 13.20, label: 'Owner assigned',            glyph: 'owner' },
  { t: 15.40, label: 'After-hours reply',         glyph: 'moon' },
];

const T = {
  ticketIn:  0.35,
  tick:      2.20,        // the checkbox
  send:      3.30,        // task crosses into project work
  taskId:    5.00,
  linkBack:  5.90,        // and the link returns
  line:     18.00,
  freed:    19.60,
  thread:   23.30,        // the long thread Scene 11 opens on
};

let root, ticket, linkRow, checkbox, checkTick, panel, task, taskId,
    flyer, autos = [], onscreen, freed, thread, threadBars = [], sparkle, cc;

function glyph(kind, parent) {
  const svg = svgNode('svg', { viewBox: '0 0 24 24', width: 26, height: 26 }, parent);
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
  } else {
    svgNode('path', { ...st, d: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5z' }, svg);
  }
  return svg;
}

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(170deg, #FBFDFE 0%, #E4EEF3 100%)',
  }}, root);

  onscreen = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '86px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'Connect the work. Reduce the repetition.', style: {
    fontSize: '46px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, onscreen);

  /* --- the ticket, with a checkbox --------------------------------- */
  ticket = node('div', { style: {
    position: 'absolute', left: '190px', top: '236px', width: '620px',
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
  panel = node('div', { style: {
    position: 'absolute', left: '1110px', top: '236px', width: '620px',
    background: '#F7FBFC', borderRadius: '20px', padding: '26px 30px',
    boxShadow: '0 20px 50px rgba(14,46,60,.14)', opacity: 0,
  }}, root);
  node('div', { text: 'Project work', style: {
    fontSize: '30px', fontWeight: 700, color: NAVY,
  }}, panel);
  /* the product name stays secondary, per the build note */
  node('div', { text: 'in ClickUp', style: {
    fontSize: '19px', color: 'rgba(14,46,60,.46)', marginBottom: '22px',
  }}, panel);

  task = node('div', { style: {
    background: '#fff', borderRadius: '13px', padding: '20px 22px',
    boxShadow: '0 8px 22px rgba(14,46,60,.10)', opacity: 0,
  }}, panel);
  node('div', { text: 'Access to a system', style: {
    fontSize: '24px', fontWeight: 700, color: NAVY,
  }}, task);
  taskId = node('div', { text: 'TASK-318', style: {
    marginTop: '8px', fontSize: '20px', fontWeight: 700,
    color: BLUE, opacity: 0,
  }}, task);
  node('div', { text: 'Details carried across. Nothing re-typed.', style: {
    marginTop: '18px', fontSize: '19px', color: 'rgba(14,46,60,.50)',
  }}, panel);

  /* the thing that crosses */
  flyer = node('div', { style: {
    position: 'absolute', left: '790px', top: '330px', width: '250px',
    padding: '16px 20px', background: '#fff', borderRadius: '12px',
    borderLeft: '6px solid ' + BLUE, opacity: 0,
    boxShadow: '0 14px 32px rgba(14,46,60,.20)',
    fontSize: '20px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, root);
  flyer.textContent = 'Access to a system';

  /* --- the automations --------------------------------------------- */
  const autoRow = node('div', { style: {
    position: 'absolute', left: '0px', width: '1920px', top: '652px',
    display: 'flex', justifyContent: 'center', gap: '24px',
  }}, root);
  AUTOS.forEach(a => {
    const el = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '20px 26px', background: '#fff', borderRadius: '14px',
      boxShadow: '0 12px 30px rgba(14,46,60,.12)', opacity: 0,
      transformOrigin: '50% 50%',
    }}, autoRow);
    glyph(a.glyph, el);
    node('div', { text: a.label, style: {
      fontSize: '24px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
    }}, el);
    autos.push(el);
  });

  freed = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '806px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'Time back for the work that needs a person.', style: {
    fontSize: '32px', fontWeight: 600, color: 'rgba(14,46,60,.66)',
  }}, freed);

  /* --- transition: a long thread, and a sparkle -------------------- */
  /* Scene 11 opens on a thread being compressed into a summary, so this
     ends by showing the thread getting long enough to be a problem. */
  thread = node('div', { style: {
    position: 'absolute', left: '810px', top: '210px', width: '300px',
    background: '#fff', borderRadius: '16px', padding: '20px',
    boxShadow: '0 26px 62px rgba(14,46,60,.22)', opacity: 0,
  }}, root);
  for (let i = 0; i < 12; i++) {
    threadBars.push(node('div', { style: {
      height: '16px', marginBottom: '10px', borderRadius: '5px',
      width: (i % 3 === 0 ? '92%' : i % 3 === 1 ? '74%' : '84%'),
      marginLeft: (i % 2 ? '8%' : '0'),
      background: i % 2 ? 'rgba(22,67,86,.40)' : 'rgba(0,134,177,.30)',
      opacity: 0,
    }}, thread));
  }
  sparkle = node('div', { text: '\u2726', style: {
    position: 'absolute', left: '1072px', top: '168px',
    fontSize: '54px', color: BLUE, opacity: 0,
  }}, root);

  cc = makeCaptions(root);
  return { cc };
}

export function render(t) {
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 24.6, dur));

  /* --- ticket and panel -------------------------------------------- */
  const ti = span(t, T.ticketIn, T.ticketIn + 0.7);
  ticket.style.opacity = ti;
  ticket.style.transform = `translateY(${lerp(22, 0, easeOut(ti))}px)`;
  const pi = span(t, T.ticketIn + 0.4, T.ticketIn + 1.1);
  panel.style.opacity = pi * 0.98;
  panel.style.transform = `translateY(${lerp(22, 0, easeOut(pi))}px)`;

  /* --- the checkbox ------------------------------------------------- */
  const ck = span(t, T.tick, T.tick + 0.4);
  checkbox.style.background = ck > 0.35 ? BLUE : '#fff';
  checkbox.style.borderColor = ck > 0.35 ? BLUE : 'rgba(0,134,177,.42)';
  checkTick.setAttribute('stroke-dashoffset',
    String(lerp(26, 0, easeOut(span(t, T.tick + 0.1, T.tick + 0.55)))));
  checkbox.style.transform = `scale(${1 + pulse(ck) * 0.12})`;

  /* --- it crosses, and gets an id ----------------------------------- */
  const fl = span(t, T.send, T.send + 1.3);
  const f = easeInOut(fl);
  flyer.style.opacity = Math.min(span(t, T.send, T.send + 0.2),
                                 1 - span(t, T.send + 1.1, T.send + 1.4));
  flyer.style.transform = `translateX(${lerp(0, 372, f)}px)`;

  const tk = span(t, T.send + 1.15, T.send + 1.75);
  task.style.opacity = tk;
  task.style.transform = `scale(${lerp(0.92, 1, easeBack(tk))})`;
  taskId.style.opacity = String(span(t, T.taskId, T.taskId + 0.5));

  /* --- and the link comes back -------------------------------------- */
  const lb = span(t, T.linkBack, T.linkBack + 0.6);
  linkRow.style.opacity = lb;
  linkRow.style.transform = `translateX(${lerp(22, 0, easeOut(lb))}px)`;

  /* --- the automations, one at a time ------------------------------- */
  AUTOS.forEach((a, i) => {
    const u = span(t, a.t, a.t + 0.5);
    autos[i].style.opacity = u * (1 - span(t, T.thread, T.thread + 0.5));
    autos[i].style.transform =
      `translateY(${lerp(18, 0, easeOut(u))}px) scale(${lerp(0.88, 1, easeBack(u))})`;
  });

  /* --- lines -------------------------------------------------------- */
  const ou = span(t, T.line, T.line + 0.7);
  onscreen.style.opacity = ou * (1 - span(t, T.thread, T.thread + 0.5));
  onscreen.style.transform = `translateY(${lerp(-14, 0, easeOut(ou))}px)`;

  const fr = span(t, T.freed, T.freed + 0.8);
  freed.style.opacity = fr * (1 - span(t, T.thread, T.thread + 0.5));
  freed.style.transform = `translateY(${lerp(16, 0, easeOut(fr))}px)`;

  /* --- transition --------------------------------------------------- */
  const th = span(t, T.thread, dur);
  const h = easeInOut(th);
  thread.style.opacity = Math.min(1, th * 2.4);
  thread.style.transform = `scale(${lerp(0.9, 1, easeBack(h))})`;
  threadBars.forEach((b, i) => {
    b.style.opacity = String(stagger(t, T.thread + 0.15, 0.055, 0.25, i));
  });
  sparkle.style.opacity = String(span(t, T.thread + 0.9, T.thread + 1.5));
  sparkle.style.transform =
    `scale(${lerp(0.5, 1, easeBack(span(t, T.thread + 0.9, T.thread + 1.5)))})`;

  ticket.style.opacity = String(ti * (1 - h * 0.85));
  panel.style.opacity = String(pi * 0.98 * (1 - h * 0.85));

  cc.update(t, CUES);
  return null;
}

export { CUES };
