/* ===================================================================
   sec13 — "All of us against the problem"                     25.4s

   Four people, each squared off against a small problem of their own,
   become one group facing one problem. The three commitments stack in
   beneath them, one per phrase, and BoldDesk arrives last as a tool
   handed forward — the scene never argues; it just rearranges.

   Every beat is timed to where Ava actually says the phrase
   (data/cues-sec13.json, data/words-sec13.json). Times below are read
   from those files and noted with the phrase they belong to.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, figure, edges,
  span, lerp, easeOut, easeInOut, easeBack, node, NAVY, BLUE,
} from '../lib/section.js';
import { ticketCard } from '../lib/ui.js';
import { stagger, pulse } from '../lib/engine.js';

export const id = 'sec13';
export const title = 'All of us against the problem';
export const dur = 25.4;
export const visemes = null;                  // voice-over only

const CUES = loadCues('data/cues-sec13.json');

/* ---------- timing, from the cue and word files ------------------- */
const T = {
  cardHold:   1.5,    // "And when change feels difficult..." 0.9; card gone by ~2.1
  figs:       1.9,    // people appear, staggered, as "change feels difficult" is said
  probs:      2.14,   // word "difficult" 2.136 — each person's own problem card
  together:   6.36,   // "It's all of us against the problem, not against each other." 6.36
  oneProblem: 6.95,   // ...the single problem card, once the group has formed
  line:       6.50,   // on-screen: "All of us against the problem"
  same:      10.31,   // "We're all trying to accomplish the same thing." — hold
  s1:        13.35,   // "Serve our customers well."
  s2:        15.65,   // "Support each other."
  s3:        17.30,   // "And make it easier to get the right work to the right people at the right time."
  tool:      21.85,   // "BoldDesk is one way we could help do that." 21.85
};

/* ---------- layout ------------------------------------------------ */
const FIG_H = 260, FIG_Y = 330;
const FIG_W = FIG_H * 0.62;                       // 161
const APART_X = [150, 590, 1030, 1470];           // spread across the frame
const GROUP_X = [220, 365, 510, 655];             // shoulder to shoulder, left
const ACCENTS = [BLUE, NAVY, '#4A8FAE', '#2E5F76'];
const PROB_W = 170, PROB_H = 110, PROB_DX = 200, PROB_DY = 60;   // small problem, right of each person
const BIG = { x: 1380, y: 350, w: 380, h: 220 };  // the one problem, right

/* the problem tone: a grey-rose, deliberately outside the brand blues */
const PROB_BG = '#F2EAEA', PROB_LINE = 'rgba(160,80,80,.32)', PROB_INK = 'rgba(130,64,64,.85)';

/* the tool: compact ticket card handed forward between group and problem */
const TOOL_W = 280;
const TOOL_TOTAL = TOOL_W + 78;
const TOOL_X = Math.round((GROUP_X[3] + FIG_W + BIG.x) / 2 - TOOL_TOTAL / 2);   // centred in the gap
const TOOL_Y = 372;

let root, card, cc, figs = [], probs = [], big, line, stack = [], tool, ticket;

function smallProblem(parent) {
  const el = node('div', { style: {
    position: 'absolute', width: PROB_W + 'px', height: PROB_H + 'px',
    background: PROB_BG, border: '2px solid ' + PROB_LINE, borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(80,40,40,.10)', opacity: 0, transformOrigin: '0% 50%',
    display: 'flex', alignItems: 'center', gap: '14px', padding: '0 18px',
  }}, parent);
  node('div', { text: '!', style: {
    fontSize: '46px', fontWeight: 800, color: PROB_INK, lineHeight: 1, flex: '0 0 auto',
  }}, el);
  const lines = node('div', { style: { flex: '1 1 auto' }}, el);
  [88, 64, 76].forEach(w => node('div', { style: {
    height: '6px', borderRadius: '3px', background: 'rgba(130,64,64,.22)', width: w + '%', marginBottom: '10px',
  }}, lines));
  return el;
}

export function build(container) {
  root = container;
  paper(root);

  /* --- four people, each with a problem of their own ------------------ */
  for (let i = 0; i < 4; i++) {
    const f = figure(root, { x: APART_X[i], y: FIG_Y, h: FIG_H, accent: ACCENTS[i] });
    f.set({ opacity: 0 });
    figs.push(f);
    probs.push(smallProblem(root));
  }

  /* --- the one problem -------------------------------------------------- */
  big = node('div', { text: 'The problem', style: {
    position: 'absolute', left: BIG.x + 'px', top: BIG.y + 'px', width: BIG.w + 'px', height: BIG.h + 'px',
    background: PROB_BG, border: '2px solid ' + PROB_LINE, borderRadius: '24px',
    boxShadow: '0 22px 54px rgba(80,40,40,.14)', display: 'grid', placeItems: 'center',
    fontSize: '40px', fontWeight: 700, color: PROB_INK, opacity: 0, transformOrigin: '50% 50%',
  }}, root);

  /* --- the tool ------------------------------------------------------- */
  tool = node('div', { style: {
    position: 'absolute', left: TOOL_X + 'px', top: TOOL_Y + 'px', width: TOOL_TOTAL + 'px', height: '200px',
    opacity: 0, transformOrigin: '50% 50%', zIndex: 4,
  }}, root);
  ticket = ticketCard(tool, { x: 0, y: 0, w: TOOL_W, title: 'New request', ref: '#1043' });
  ticket.el.style.opacity = 1;
  ticket.rows.owner.style.display = 'none';
  ticket.rows.due.style.display = 'none';
  ticket.hist.style.display = 'none';
  ticket.rows.status.style.opacity = 1;

  /* --- on-screen copy -------------------------------------------------- */
  line = onScreen(root, { text: 'All of us against the problem', y: 120, size: 56, t0: T.line, width: 1500 });
  stack = [
    onScreen(root, { text: 'Serve our customers well.',            y: 660, size: 40, t0: T.s1, width: 1500 }),
    onScreen(root, { text: 'Support each other.',                  y: 728, size: 40, t0: T.s2, width: 1500 }),
    onScreen(root, { text: 'Right work. Right people. Right time.', y: 796, size: 40, t0: T.s3, width: 1500 }),
  ];

  card = titleCard(root, { n: 13, title: 'All of us against the problem', hold: T.cardHold });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  root.style.transform = `scale(${lerp(1.0, 1.02, easeInOut(span(t, 0, dur)))})`;

  const covered = card.update(t);
  let beat = 'title';

  /* --- apart, then together -------------------------------------------- */
  const tg = easeInOut(span(t, T.together, T.together + 1.1));   // 0 apart .. 1 grouped
  const handoff = easeOut(span(t, T.tool, T.tool + 0.7));         // front person offers the tool

  figs.forEach((f, i) => {
    const u = stagger(t, T.figs, 0.2, 0.55, i);
    const x = lerp(APART_X[i], GROUP_X[i], tg);
    /* apart: turned slightly toward their own problem, one arm up at it.
       together: upright, arms down — except the front person, who hands
       the tool forward on the last line. */
    const isFront = i === 3;
    f.set({
      opacity: u,
      x, y: FIG_Y + lerp(26, 0, easeOut(u)),
      headTilt: lerp(7, 0, tg),
      armR: lerp(28, 0, tg) + (isFront ? 62 * handoff : 0),
    });
    if (u > 0) beat = 'apart';

    /* each person's own problem: appears on "difficult", leaves as they gather */
    const p = stagger(t, T.probs, 0.15, 0.45, i);
    const gone = span(t, T.together, T.together + 0.5);
    const pe = probs[i];
    pe.style.left = (APART_X[i] + PROB_DX + lerp(0, 40, gone)) + 'px';
    pe.style.top  = (FIG_Y + PROB_DY) + 'px';
    pe.style.opacity = String(p * (1 - gone));
    pe.style.transform = `scale(${lerp(0.6, 1, easeBack(p)) * lerp(1, 0.8, gone)})`;
  });
  if (tg > 0) beat = 'together';

  /* --- one problem ------------------------------------------------------ */
  const bp = span(t, T.oneProblem, T.oneProblem + 0.7);
  big.style.opacity = String(bp);
  /* the problem card gives a little as the tool arrives */
  const give = 8 * pulse(span(t, T.tool + 0.5, T.tool + 1.2));
  big.style.transform = `translateX(${lerp(40, 0, easeOut(bp)) + give}px) scale(${lerp(0.84, 1, easeBack(bp))})`;

  line.update(t);
  if (t >= T.same) beat = 'hold';

  /* --- the three commitments ------------------------------------------- */
  stack.forEach(s => s.update(t));
  if (t >= T.s1) beat = 'serve';
  if (t >= T.s2) beat = 'support';
  if (t >= T.s3) beat = 'right work';

  /* --- the tool, handed forward ---------------------------------------- */
  const tu = span(t, T.tool, T.tool + 0.9);
  tool.style.opacity = String(Math.min(1, tu * 1.6));
  tool.style.transform =
    `translateX(${lerp(-170, 0, easeOut(tu))}px) scale(${0.85 * lerp(0.9, 1, easeBack(tu))})`
    + ` rotate(${lerp(-4, 0, easeOut(tu))}deg)`;
  if (tu > 0) beat = 'tool';

  cc.update(t, CUES);
  return covered ? 'title card' : beat;
}
