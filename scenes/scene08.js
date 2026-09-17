/* ===================================================================
   SCENE 8 — "Visibility for leaders"                    2:54 – 3:25

   The strategic heart of the submission. Every other scene explains
   something; this one hands leadership a decision.

   Two build notes govern it. Keep the dashboard illustrative and label
   sample values clearly — every number below is invented, none of them
   are the trial's real figures, and the panel says so on its face. And
   do not let the animation resolve the leadership question: the two
   options appear side by side, weighted identically, and nothing
   highlights either one. The open frame is the point.

   The tile set follows the real product rather than the storyboard's
   five: response overdue and resolution overdue are separate clocks,
   which is a sharper and more honest distinction than "answered on
   time". Acknowledging a request and finishing it are different
   failures with different fixes.
=================================================================== */

import {
  node, svgNode, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';
import { chip } from '../lib/ui.js';

export const id = 'scene08';
export const title = 'Visibility for leaders';
export const dur = 31.0;
export const visemes = null;

const CUES = [
  [0.30,  9.00, "Managers can see what's open, what's waiting, where the workload sits, and whether requests are being answered on time."],
  [9.40, 15.00, "And that raises a real question for Northpointe — one leadership should decide."],
  [15.40,23.60, "We could set a single standard across the bank, or let each team set its own, fitted to its work."],
  [24.00,30.20, "Either way, for the first time, we'd be able to see whether we're meeting it."],
];

/* Illustrative. Not the trial's figures. */
const TILES = [
  { t: 1.50, label: 'Open',               to: 22 },
  { t: 2.15, label: 'Waiting on customer',to: 11 },
  { t: 2.80, label: 'Closed this month',  to: 48 },
  { t: 3.45, label: 'Response overdue',   to:  5, warn: true },
  { t: 4.10, label: 'Resolution overdue', to:  7, warn: true },
];

/* One person carrying far more than the rest, then the work spread out. */
const LOAD_BEFORE = [4, 6, 13, 5, 3];
const LOAD_AFTER  = [6, 7,  7, 7, 4];
const LOAD_MAX = 14;

const OPTIONS = [
  { t: 16.00, kicker: 'OPTION ONE', title: 'One standard across the bank',
    body: 'The same first-response target everywhere.' },
  { t: 17.10, kicker: 'OPTION TWO', title: 'Each team sets its own',
    body: 'Fitted to the work that team actually does.' },
];

const T = {
  shellIn:  0.25,
  loadIn:   5.60,
  spot:     9.60,        // the bottleneck lights up
  spread:  12.60,        // and the work moves
  line:    15.30,
  decide:  24.20,        // "leadership decides" — still unanswered
  handoff: 29.30,        // someone goes out of office; the ticket stays
};

let root, shell, sample, tileEls = [], tileNums = [], bars = [], barWraps = [],
    avatars = [], loadPanel, optionEls = [], onscreen, decideNote,
    oooCard, cc;

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(170deg, #FAFCFE 0%, #E3EDF3 100%)',
  }}, root);

  /* --- dashboard shell --------------------------------------------- */
  shell = node('div', { style: {
    position: 'absolute', left: '130px', top: '126px',
    width: '1660px', height: '466px', background: '#F7FBFC',
    borderRadius: '22px', boxShadow: '0 28px 68px rgba(14,46,60,.18)',
    padding: '30px 36px', opacity: 0, transformOrigin: '50% 0%',
  }}, root);

  const head = node('div', { style: {
    display: 'flex', alignItems: 'center', marginBottom: '22px',
  }}, shell);
  node('div', { text: 'ALL GROUPS', style: {
    fontSize: '17px', letterSpacing: '.18em', color: BLUE, fontWeight: 700,
  }}, head);
  /* The build note asks for sample values to be clearly labelled. */
  sample = node('div', { style: { marginLeft: 'auto' }}, head);
  chip(sample, 'Sample figures', 'closed', 18);

  /* --- stat tiles --------------------------------------------------- */
  const row = node('div', { style: { display: 'flex', gap: '20px' }}, shell);
  TILES.forEach(spec => {
    const tl = node('div', { style: {
      flex: '1 1 0', background: '#fff', borderRadius: '15px',
      padding: '20px 22px', opacity: 0,
      boxShadow: '0 10px 26px rgba(14,46,60,.10)',
    }}, row);
    const n = node('div', { text: '0', style: {
      fontSize: '52px', fontWeight: 700, lineHeight: 1.05,
      color: spec.warn ? '#B4622F' : NAVY,
      fontVariantNumeric: 'tabular-nums',
    }}, tl);
    node('div', { text: spec.label, style: {
      marginTop: '6px', fontSize: '19px', color: 'rgba(14,46,60,.56)',
      lineHeight: 1.25,
    }}, tl);
    tileEls.push(tl);
    tileNums.push(n);
  });

  /* --- workload ----------------------------------------------------- */
  loadPanel = node('div', { style: {
    marginTop: '24px', background: '#fff', borderRadius: '15px',
    padding: '20px 24px 16px', opacity: 0,
    boxShadow: '0 10px 26px rgba(14,46,60,.10)',
  }}, shell);
  node('div', { text: 'WORKLOAD', style: {
    fontSize: '15px', letterSpacing: '.18em', color: 'rgba(14,46,60,.45)',
    fontWeight: 700, marginBottom: '14px',
  }}, loadPanel);

  const barRow = node('div', { style: {
    display: 'flex', gap: '30px', alignItems: 'flex-end', height: '132px',
  }}, loadPanel);
  LOAD_BEFORE.forEach(() => {
    const col = node('div', { style: {
      flex: '1 1 0', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '10px',
    }}, barRow);
    const track = node('div', { style: {
      width: '100%', height: '96px', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'center',
    }}, col);
    const b = node('div', { style: {
      width: '88px', height: '0%', borderRadius: '8px 8px 3px 3px',
      background: BLUE,
    }}, track);
    const av = node('div', { style: {
      width: '30px', height: '30px', borderRadius: '50%',
      background: 'rgba(22,67,86,.20)', flex: '0 0 auto',
    }}, col);
    bars.push(b); barWraps.push(col); avatars.push(av);
  });

  /* --- the question ------------------------------------------------- */
  onscreen = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '618px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: "One standard, or each team's own?", style: {
    fontSize: '44px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, onscreen);

  /* Two cards, identical weight. Nothing here recommends either one. */
  OPTIONS.forEach((o, i) => {
    const el = node('div', { style: {
      position: 'absolute', left: (i === 0 ? 190 : 990) + 'px', top: '700px',
      width: '740px', minHeight: '198px',
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
      fontSize: '22px', lineHeight: 1.4, color: 'rgba(14,46,60,.62)',
    }}, el);
    optionEls.push(el);
  });

  decideNote = node('div', { text: 'Leadership decides. Either way, it becomes measurable.', style: {
    position: 'absolute', left: '360px', width: '1200px', top: '898px',
    textAlign: 'center', fontSize: '25px', fontWeight: 600,
    color: 'rgba(14,46,60,.58)', opacity: 0,
  }}, root);

  /* --- transition: someone steps away, the ticket stays ------------- */
  oooCard = node('div', { style: {
    position: 'absolute', left: '660px', top: '420px', width: '600px',
    background: '#fff', borderRadius: '18px', padding: '26px 30px',
    boxShadow: '0 26px 62px rgba(14,46,60,.22)', opacity: 0,
    transformOrigin: '50% 50%',
  }}, root);
  const orow = node('div', { style: {
    display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px',
  }}, oooCard);
  node('div', { style: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'rgba(22,67,86,.18)',
  }}, orow);
  chip(orow, 'Out of office', 'closed', 20);
  node('div', { text: 'The request is still here.', style: {
    fontSize: '30px', fontWeight: 700, color: NAVY,
  }}, oooCard);

  cc = makeCaptions(root);
  return { cc };
}

export function render(t) {
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 30.5, dur));

  const si = span(t, T.shellIn, T.shellIn + 0.8);
  shell.style.opacity = si;
  shell.style.transform = `translateY(${lerp(22, 0, easeOut(si))}px)`;
  sample.style.opacity = String(span(t, T.shellIn + 0.5, T.shellIn + 1.2));

  /* --- tiles, counting up ------------------------------------------- */
  TILES.forEach((spec, i) => {
    const u = span(t, spec.t, spec.t + 0.5);
    tileEls[i].style.opacity = u;
    tileEls[i].style.transform =
      `translateY(${lerp(16, 0, easeOut(u))}px) scale(${lerp(0.94, 1, easeBack(u))})`;
    /* the count runs up rather than appearing, so the eye follows it */
    const c = span(t, spec.t + 0.15, spec.t + 0.95);
    tileNums[i].textContent = String(Math.round(spec.to * easeOut(c)));
  });

  /* --- workload ----------------------------------------------------- */
  const li = span(t, T.loadIn, T.loadIn + 0.7);
  loadPanel.style.opacity = li;

  const grow = easeOut(span(t, T.loadIn + 0.2, T.loadIn + 1.3));
  const spread = easeInOut(span(t, T.spread, T.spread + 1.6));
  bars.forEach((b, i) => {
    const v = lerp(LOAD_BEFORE[i], LOAD_AFTER[i], spread);
    b.style.height = (grow * (v / LOAD_MAX) * 100) + '%';
  });

  /* the bottleneck lights up, then settles once the work moves */
  const spot = span(t, T.spot, T.spot + 0.6) * (1 - span(t, T.spread + 0.8, T.spread + 1.6));
  bars[2].style.background = spot > 0.02
    ? `rgb(${Math.round(lerp(0,196,spot))}, ${Math.round(lerp(134,122,spot))}, ${Math.round(lerp(177,52,spot))})`
    : BLUE;
  barWraps[2].style.transform = `scale(${1 + pulse(span(t, T.spot, T.spot + 0.8)) * 0.04})`;
  /* the two who take some of it acknowledge it */
  [0, 3].forEach(i => {
    barWraps[i].style.transform =
      `scale(${1 + pulse(span(t, T.spread + 0.3 + i * 0.1, T.spread + 1.0 + i * 0.1)) * 0.035})`;
  });

  /* --- the question ------------------------------------------------- */
  /* The dashboard shrinks and rises to make room; it stays visible,
     because the question only makes sense next to what produced it. */
  const q = easeInOut(span(t, T.line, T.line + 1.2));
  shell.style.transform =
    `translateY(${lerp(0, -54, q)}px) scale(${lerp(1, 0.80, q)})`;

  const ou = span(t, T.line + 0.3, T.line + 1.0);
  onscreen.style.opacity = ou * (1 - span(t, T.handoff, T.handoff + 0.5));
  onscreen.style.transform = `translateY(${lerp(16, 0, easeOut(ou))}px)`;

  OPTIONS.forEach((o, i) => {
    const u = span(t, o.t, o.t + 0.6);
    optionEls[i].style.opacity = u * (1 - span(t, T.handoff, T.handoff + 0.5));
    optionEls[i].style.transform =
      `translateY(${lerp(22, 0, easeOut(u))}px) scale(${lerp(0.95, 1, easeBack(u))})`;
  });

  const dn = span(t, T.decide, T.decide + 0.7);
  decideNote.style.opacity = dn * (1 - span(t, T.handoff, T.handoff + 0.5));

  /* --- transition --------------------------------------------------- */
  /* Scene 9 is about continuity when someone is out, so this ends on the
     avatar that steps away and the request that does not. */
  const ho = span(t, T.handoff, dur);
  const h = easeInOut(ho);
  avatars.forEach((a, i) => {
    a.style.opacity = String(i === 2 ? 1 - h * 0.85 : 1);
  });
  oooCard.style.opacity = Math.min(1, ho * 2.2);
  oooCard.style.transform = `scale(${lerp(0.84, 1, easeBack(h))})`;
  shell.style.opacity = String(si * (1 - h * 0.55));

  cc.update(t, CUES);
  return null;
}

export { CUES };
