/* ===================================================================
   SCENE 2 — "The work behind the work"                  0:20 – 0:44

   No Nora on camera; her voice continues over animation. This is the
   first scene that is pure motion graphics, and it is the cheap kind:
   stacking cards, badges, staggered reveals. Easier in SVG and CSS than
   in a GUI animation tool, which is most of the case for building the
   film this way.

   Storyboard build note: keep sender names generic and avoid anything
   resembling real customer information. Every name below is invented and
   every subject line is a category, not a request.
=================================================================== */

import {
  node, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';

export const id = 'scene02';
export const title = 'The work behind the work';
export const dur = 24.0;
export const visemes = null;          // voice-over only

const CUES = [
  [0.30,  5.20, "Across Northpointe, many requests still live in shared mailboxes."],
  [5.40, 11.80, "They get forwarded, copied to multiple people, and buried in long email chains."],
  [12.20,15.00, "People are working hard,"],
  [15.20,22.60, "but sometimes we spend too much time managing the request instead of solving it."],
];

/* Generic senders and category subjects. Nothing here is a real person,
   a real client, or a real request. */
const MAIL = [
  ['A. Whitfield',  'Access request'],
  ['D. Mercer',     'Report question'],
  ['P. Lindqvist',  'Document needed'],
  ['R. Okonkwo',    'Status check'],
  ['S. Bramhall',   'Follow-up'],
  ['J. Castellano', 'Password help'],
  ['M. Ferreira',   'Missing file'],
  ['T. Nakamura',   'Question on process'],
  ['L. Abernathy',  'Urgent — please advise'],
  ['C. Duval',      'Re: Re: Re: Follow-up'],
  ['K. Oyelaran',   'Second request'],
  ['B. Thorsen',    'Any update?'],
  ['N. Villalobos', 'Checking in again'],
  ['E. Haruna',     'Re: Document needed'],
];

const ROW_H = 92;
const LIST_TOP = 168;
const VISIBLE = 7;            // rows that fit the panel before it scrolls

const PANEL_X0 = 520;         // centred while the mailbox is the whole scene
const PANEL_X1 = 250;         // cleared left once the right side is needed

const T = {
  panelIn:   0.25,
  firstMail: 1.05,
  mailGap:   0.52,            // 14 mails -> last lands about 8.0s
  fwdLift:   8.6,
  fwdSplit:  9.6,
  ccIn:      11.2,
  panelMove: 11.4,
  figures:   12.6,            // lands on "people are working hard"
  whoHas:    13.4,
  ghostOut:  15.4,
  onscreen:  16.4,
  dim:       21.6,
};

let root, panel, head, list, rows = [], badge, fwdGhosts = [], ccChips = [], who,
    figures = [], onscreen, cc, unread;

function mailRow(i, parent) {
  const [from, subj] = MAIL[i];
  const r = node('div', { style: {
    position: 'absolute', left: 0, right: 0, top: (i * ROW_H) + 'px',
    height: (ROW_H - 12) + 'px', background: '#fff',
    borderRadius: '12px', boxShadow: '0 2px 8px rgba(14,46,60,.10)',
    display: 'flex', alignItems: 'center', padding: '0 26px',
    opacity: 0, borderLeft: '5px solid ' + BLUE,
  }}, parent);

  node('div', { style: {
    width: '46px', height: '46px', borderRadius: '50%', flex: '0 0 auto',
    background: 'rgba(0,134,177,.14)', marginRight: '22px',
  }}, r);

  const col = node('div', { style: { flex: '1 1 auto', minWidth: 0 }}, r);
  node('div', { text: from, style: {
    fontSize: '25px', fontWeight: 700, color: NAVY, marginBottom: '4px',
  }}, col);
  node('div', { text: subj, style: {
    fontSize: '23px', color: 'rgba(14,46,60,.62)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  }}, col);

  const right = node('div', { style: { flex: '0 0 auto', display: 'flex',
    alignItems: 'center', gap: '10px' }}, r);
  return { el: r, right, col };
}

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(165deg, #F4F8FB 0%, #DFEAF1 100%)',
  }}, root);

  /* --- the mailbox panel ---------------------------------------- */
  /* Starts near centre, because for the first ten seconds the mailbox IS
     the whole scene and a panel hugging the left edge leaves two thirds of
     frame empty. It slides left at 11.4s to make room for the figures and
     the on-screen line. */
  panel = node('div', { style: {
    position: 'absolute', left: '0px', top: '112px',
    width: '880px', height: '856px',
    background: '#F8FBFD', borderRadius: '22px',
    boxShadow: '0 34px 80px rgba(14,46,60,.20)',
    overflow: 'hidden', opacity: 0,
  }}, root);

  head = node('div', { style: {
    position: 'absolute', left: 0, right: 0, top: 0, height: '116px',
    background: NAVY, display: 'flex', alignItems: 'center', padding: '0 34px',
  }}, panel);
  const hcol = node('div', {}, head);
  node('div', { text: 'SHARED MAILBOX', style: {
    fontSize: '17px', letterSpacing: '.18em', color: 'rgba(255,255,255,.62)',
    fontWeight: 700, marginBottom: '6px',
  }}, hcol);
  node('div', { text: 'Requests', style: {
    fontSize: '34px', fontWeight: 700, color: '#fff',
  }}, hcol);

  unread = node('div', { text: '0', style: {
    marginLeft: 'auto', minWidth: '62px', height: '46px', padding: '0 16px',
    borderRadius: '23px', background: BLUE, color: '#fff',
    fontSize: '26px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}, head);

  list = node('div', { style: {
    position: 'absolute', left: '26px', right: '26px', top: LIST_TOP + 'px',
    height: (856 - LIST_TOP) + 'px',
    overflow: 'hidden',          // without this, scrolled rows ride over the header
  }}, panel);
  const inner = node('div', { style: { position: 'absolute', inset: 0 }}, list);
  rows = MAIL.map((_, i) => mailRow(i, inner));
  list.inner = inner;

  /* --- forwarded copies ----------------------------------------- */
  /* Two ghost cards that peel off one email and fly to other mailboxes,
     which is the visual for "it got forwarded and now lives in three
     places and none of them own it". */
  for (let k = 0; k < 2; k++) {
    const g = node('div', { style: {
      position: 'absolute', width: '400px', height: '80px',
      background: '#fff', borderRadius: '12px',
      boxShadow: '0 12px 30px rgba(14,46,60,.22)',
      borderLeft: '5px solid ' + NAVY,
      display: 'flex', alignItems: 'center', padding: '0 20px',
      opacity: 0, left: '1330px', top: '286px',
    }}, root);
    node('div', { text: 'FW:', style: {
      fontSize: '22px', fontWeight: 700, color: BLUE, marginRight: '12px',
    }}, g);
    node('div', { text: 'Urgent — please advise', style: {
      fontSize: '22px', color: 'rgba(14,46,60,.70)',
    }}, g);
    fwdGhosts.push(g);
  }

  badge = node('div', { text: 'FW:', style: {
    position: 'absolute', fontSize: '22px', fontWeight: 800, color: BLUE,
    opacity: 0, left: 0, top: 0,
  }}, root);

  /* --- CC chips -------------------------------------------------- */
  /* Attached to specific rows, so they read as the same requests picking
     up more recipients rather than as decoration. */
  [[3, '+3'], [5, '+2'], [8, '+4'], [9, '+2'], [11, '+5']].forEach(([i, label]) => {
    const chip = node('div', { text: 'CC ' + label, style: {
      position: 'absolute', fontSize: '20px', fontWeight: 700,
      color: '#fff', background: 'rgba(22,67,86,.82)',
      padding: '6px 14px', borderRadius: '14px', opacity: 0,
      right: '28px', top: '0px',
    }}, list.inner);
    ccChips.push({ chip, i });
  });

  /* --- "Who has this?" ------------------------------------------ */
  who = node('div', { style: {
    position: 'absolute', left: '806px', top: '516px',
    padding: '26px 34px', background: '#fff',
    border: '3px solid ' + BLUE, borderRadius: '20px',
    boxShadow: '0 22px 50px rgba(14,46,60,.24)',
    opacity: 0, transformOrigin: '20% 80%',
  }}, root);
  node('div', { text: 'Who has this?', style: {
    fontSize: '44px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, who);

  /* --- three figures -------------------------------------------- */
  /* Flat figures, same register as the optional stick-figure scene.
     Two comparing screens, one scrolling a long thread. */
  const figSpecs = [
    { x: 1250, y: 620, kind: 'compare' },
    { x: 1420, y: 620, kind: 'compare', flip: true },
    { x: 1650, y: 620, kind: 'scroll' },
  ];
  figSpecs.forEach(spec => figures.push(makeFigure(root, spec)));

  /* --- the on-screen line --------------------------------------- */
  onscreen = node('div', { style: {
    position: 'absolute', left: '1200px', top: '300px', width: '560px',
    opacity: 0,
  }}, root);
  node('div', { text: 'WHAT HAPPENS', style: {
    fontSize: '19px', letterSpacing: '.18em', color: BLUE,
    fontWeight: 700, marginBottom: '16px',
  }}, onscreen);
  node('div', { text: 'Managing the request instead of solving it', style: {
    fontSize: '56px', lineHeight: 1.14, fontWeight: 700, color: NAVY,
  }}, onscreen);

  cc = makeCaptions(root);
  return { cc };
}

/* A figure is a head, a body and a screen. Deliberately simple — it has
   to read at a glance and it has to sit beside the stick-figure scene
   without looking like a different film. */
function makeFigure(parent, { x, y, kind, flip }) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '150px', height: '250px', opacity: 0,
    transform: flip ? 'scaleX(-1)' : 'none',
  }}, parent);

  node('div', { style: {   // head
    position: 'absolute', left: '44px', top: 0, width: '62px', height: '62px',
    borderRadius: '50%', background: NAVY,
  }}, g);
  node('div', { style: {   // body
    position: 'absolute', left: '26px', top: '74px', width: '98px', height: '116px',
    borderRadius: '44px 44px 16px 16px', background: 'rgba(22,67,86,.86)',
  }}, g);

  const screen = node('div', { style: {  // laptop / phone screen
    position: 'absolute',
    left: kind === 'scroll' ? '92px' : '104px',
    top: kind === 'scroll' ? '104px' : '118px',
    width: kind === 'scroll' ? '52px' : '76px',
    height: kind === 'scroll' ? '84px' : '56px',
    background: '#fff', borderRadius: '6px',
    boxShadow: '0 3px 10px rgba(14,46,60,.25)', overflow: 'hidden',
  }}, g);
  const lines = [];
  const n = kind === 'scroll' ? 9 : 4;
  for (let i = 0; i < n; i++) {
    lines.push(node('div', { style: {
      position: 'absolute', left: '7px', right: '7px', top: (8 + i * 9) + 'px',
      height: '4px', borderRadius: '2px', background: 'rgba(22,67,86,.30)',
    }}, screen));
  }
  return { g, screen, lines, kind };
}

export function render(t) {
  /* Very slow drift, so a long static scene doesn't feel like a still */
  root.style.transform = `scale(${lerp(1.0, 1.03, easeInOut(span(t, 0, dur)))})`;
  root.style.opacity = Math.min(span(t, 0, 0.45), 1 - span(t, 23.5, dur));

  /* --- panel arrives, then clears left -------------------------- */
  const pin = span(t, T.panelIn, T.panelIn + 0.7);
  const px = lerp(PANEL_X0, PANEL_X1,
                  easeInOut(span(t, T.panelMove, T.panelMove + 1.0)));
  panel.style.opacity = pin;
  panel.style.transform = `translate(${px}px, ${lerp(30, 0, easeOut(pin))}px)`;

  /* --- mail stacks up ------------------------------------------- */
  let landed = 0;
  rows.forEach((r, i) => {
    const u = stagger(t, T.firstMail, T.mailGap, 0.42, i);
    r.el.style.opacity = u;
    r.el.style.transform = `translateX(${lerp(46, 0, easeOut(u))}px)`;
    if (u > 0.5) landed++;
  });
  unread.textContent = String(landed);
  /* Once the list overflows, scroll it so mail keeps arriving into a pile
     that is visibly deeper than the window. */
  const overflow = Math.max(0, landed - VISIBLE);
  list.inner.style.transform = `translateY(${-overflow * ROW_H}px)`;
  list.inner.style.transition = 'none';

  /* The badge count turning from blue to a warning tone as it climbs is
     the whole scene in one element. */
  const heat = clamp(landed / MAIL.length);
  unread.style.background = heat < 0.55 ? BLUE
    : `rgb(${Math.round(lerp(0,196,(heat-0.55)/0.45))}, ${Math.round(lerp(134,86,(heat-0.55)/0.45))}, ${Math.round(lerp(177,52,(heat-0.55)/0.45))})`;

  /* --- one email gets forwarded --------------------------------- */
  const lift = span(t, T.fwdLift, T.fwdLift + 0.6);
  const target = rows[8];
  target.el.style.transformOrigin = 'left center';
  if (lift > 0) {
    /* Scale from the left edge only. Translating it up left a gap in the
       list, and scaling about the centre pushed its accent bar out past
       the panel's clip. */
    target.el.style.transform = `scale(${lerp(1, 1.03, easeOut(lift))})`;
    target.el.style.boxShadow =
      `0 ${lerp(2, 20, lift)}px ${lerp(8, 44, lift)}px rgba(14,46,60,${lerp(.10,.26,lift)})`;
    badge.style.opacity = 0;   // the lift + shadow reads better without it
  }

  fwdGhosts.forEach((g, k) => {
    const u = span(t, T.fwdSplit + k * 0.22, T.fwdSplit + k * 0.22 + 0.85);
    const out = span(t, T.ghostOut + k * 0.14, T.ghostOut + k * 0.14 + 0.6);
    g.style.opacity = u > 0 ? Math.min(1, u * 1.6) * (1 - out) : 0;
    g.style.transform =
      `translate(${lerp(-230, 0, easeOut(u))}px, ${lerp(80, k * 122, easeOut(u))}px)`
      + ` rotate(${lerp(-4, k === 0 ? -2 : 2, u)}deg)`;
  });

  /* --- CCs pile on ---------------------------------------------- */
  ccChips.forEach(({ chip, i }, k) => {
    const u = stagger(t, T.ccIn, 0.34, 0.4, k);
    chip.style.opacity = u;
    chip.style.top = (i * ROW_H + 26) + 'px';
    chip.style.transform = `scale(${lerp(0.7, 1, easeBack(u))})`;
  });

  /* --- who has this? -------------------------------------------- */
  const wu = span(t, T.whoHas, T.whoHas + 0.5);
  who.style.opacity = wu * (1 - span(t, T.onscreen, T.onscreen + 0.7));
  /* small idle bob so it reads as a nagging question, not a label */
  const bob = Math.sin((t - T.whoHas) * 2.1) * 5 * clamp(wu);
  who.style.transform = `translateY(${lerp(22, bob, easeOut(wu))}px) scale(${lerp(0.82, 1, easeBack(wu))})`;

  /* --- figures --------------------------------------------------- */
  figures.forEach((f, k) => {
    const u = stagger(t, T.figures, 0.26, 0.5, k);
    f.g.style.opacity = u * (1 - span(t, T.dim + 0.2, T.dim + 1.0));
    f.g.style.transform =
      (f.g.style.transform.includes('scaleX') ? 'scaleX(-1) ' : '')
      + `translateY(${lerp(26, 0, easeOut(u))}px)`;
    /* the one reading a thread scrolls it, endlessly */
    if (f.kind === 'scroll' && u > 0) {
      const off = ((t - T.figures) * 26) % 18;
      f.lines.forEach((ln, i) => { ln.style.top = (8 + i * 9 - off) + 'px'; });
    }
  });

  /* --- the point ------------------------------------------------- */
  const ou = span(t, T.onscreen, T.onscreen + 0.8);
  onscreen.style.opacity = ou;
  onscreen.style.transform = `translateY(${lerp(24, 0, easeOut(ou))}px)`;

  /* --- dim to one unresolved email ------------------------------ */
  /* Storyboard transition: freeze on one email, then pull back to reveal
     it on a laptop in Scene 3. The colour drains out of everything except
     that row, so the cut has somewhere to land.

     The filter goes on each row and on the header, NOT on the panel: a
     filter on the parent cannot be undone by a child, so filtering the
     panel dimmed the one row that was supposed to stay lit. */
  const d = span(t, T.dim, T.dim + 1.1);
  const dim = `saturate(${lerp(1, .18, d)}) brightness(${lerp(1, .94, d)})`;
  head.style.filter = dim;
  onscreen.style.opacity = ou * (1 - d * 0.8);
  ccChips.forEach(({ chip }) => { chip.style.filter = dim; });
  rows.forEach((r, i) => {
    if (i === 8) {
      r.el.style.zIndex = 5;
      r.el.style.transform = `scale(${lerp(1.03, 1.07, easeOut(d))})`;
      if (d > 0) {
        r.el.style.boxShadow = `0 ${lerp(20,36,d)}px ${lerp(44,74,d)}px rgba(14,46,60,${lerp(.26,.34,d)})`;
      }
    } else {
      r.el.style.filter = dim;
      r.el.style.opacity = String(Math.min(
        parseFloat(r.el.style.opacity || '1') || 1, lerp(1, .55, d)));
    }
  });

  cc.update(t, CUES);
  return null;
}

export { CUES };
