/* ===================================================================
   sec03 — "The shared mailbox"                                  40.7s

   Adapted from scene02, retimed to the revision-3 lines. The script
   card is "CUT TO: Shared mailbox / email animation", so there is no
   title card: the mailbox is the first thing in frame, nearly empty,
   and then it fills while Ava says the requests live there.

   Beats (every number read from data/words-sec03.json and kept in T):
     panel arrives near centre, two mails trickle in
     "Requests"            -> twelve more land fast, badge counts and heats
     panel clears left
     "searching"           -> a figure with a magnifier, list scrubs up and back
     "Forwarding"          -> one row lifts and splits into two FW: copies
     "CC'ing"              -> CC counts pile onto rows; a second person appears
     "who owns something"  -> the "Who has this?" bubble, bobbing slowly
     "Looking back"        -> a long thread unrolls and scrolls to the bottom,
                              where the original question is tiny and lit
     "out of the office"   -> the second figure fades to a ghost with a chip,
                              one row gets a "?" status
     "The result"          -> colour drains from everything but the pile;
                              on-screen line

   Every visual is a function of t. Filters go on individual elements
   (a filtered parent cannot be undone by a child), and the lifted row
   scales from its left edge so it stays inside the list's clip.
=================================================================== */

import {
  paper, loadCues, captions, onScreen, figure, edges,
  node, svgNode, span, lerp, clamp, easeOut, easeInOut, easeBack, NAVY, BLUE, INK, INK_SOFT,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';
import { chip } from '../lib/ui.js';

export const id = 'sec03';
export const title = 'The shared mailbox';
export const dur = 41.6;
export const visemes = null;

const CUES = loadCues('data/cues-sec03.json');

/* Invented senders, category subjects. Nothing here is a real person,
   team, client or request. */
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

/* ---------- layout ------------------------------------------------- */
const ROW_H = 100;
const PANEL_W = 880, PANEL_H = 780, PANEL_TOP = 120, LIST_TOP = 160;   // bottom 900: captions clear
const VISIBLE = 6;             // rows that fit before the list scrolls
const PANEL_X0 = 520;          // centred while the mailbox is the whole scene
const PANEL_X1 = 150;          // cleared left once the right side is needed
const LIFT_ROW = 8;            // 'Urgent — please advise' gets forwarded
const UNKNOWN_ROW = 11;        // 'Any update?' gets the "?" status
const CC_ROWS = [[9, '+3'], [10, '+2'], [12, '+4'], [13, '+2']];   // all visible after the fill

const FIG_H = 240, FIG_Y = 580, FIG_AX = 1500, FIG_BX = 1720;
const THREAD_X = 1080, THREAD_Y = 140, THREAD_W = 330, THREAD_H = 720;

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  panelIn:   0.50,          // "As we've talked"                       0.60
  early:    [2.30, 3.70],   // two mails while she is still on "teams across Northpointe"
  fill:      5.90,          // "Requests"                              5.89
  fillGap:   0.27,          // 12 more -> last lands ~9.20 ("mailboxes" ends 9.34)
  panelMove: 9.50,          // clears left before "People"           10.04
  search:   10.72,          // "searching"                            10.72
  scrubEnd: 12.56,          //   list scrubbed up and back by here
  fwdLift:  12.66,          // "Forwarding"                           12.89
  fwdSplit: 13.09,
  ccIn:     14.66,          // "CC'ing"                               14.66
  figB:     15.42,          // "multiple people"                      15.42
  ghostOut: 16.60,          // FW: copies clear before the bubble
  who:      17.40,          // "figure out who owns something"  (who  17.81)
  thread:   19.12,          // "Looking back"                         19.12
  scroll0:  19.79,          // "through a long chain"                 19.79
  scroll1:  21.90,          // "...what the actual"                   21.74
  question: 22.17,          // "question"                             22.17
  ooo:      24.99,          // "out"                                  24.99
  oooChip:  25.39,          // "office"                               25.39
  unknown:  28.03,          // "know where something stands"          28.03
  dim:      32.50,          // "The result"                           32.50
  line:     33.89,          // "extra back-and-forth"                 33.89
};

let root, cc, panel, head, unread, list, inner, rows = [], fwdGhosts = [], ccChips = [],
    unknown, who, figA, figB, glass, oooChip, thread, threadInner, orig, thumb, line;

/* ---------- pieces ------------------------------------------------- */
function mailRow(i, parent) {
  const [from, subj] = MAIL[i];
  const r = node('div', { style: {
    position: 'absolute', left: 0, right: 0, top: (i * ROW_H) + 'px',
    height: (ROW_H - 12) + 'px', background: '#fff',
    borderRadius: '12px', boxShadow: '0 2px 8px rgba(14,46,60,.10)',
    display: 'flex', alignItems: 'center', padding: '0 26px',
    opacity: 0, borderLeft: '5px solid ' + BLUE, transformOrigin: 'left center',
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
  return { el: r, col };
}

/* The long chain: a subject with too many Re:'s, a stack of quoted
   replies, and the original question tiny at the very bottom. */
function buildThread(parent) {
  const box = node('div', { style: {
    position: 'absolute', left: THREAD_X + 'px', top: THREAD_Y + 'px', width: THREAD_W + 'px',
    height: '0px', background: '#fff', borderRadius: '16px',
    boxShadow: '0 22px 54px rgba(14,46,60,.18)', overflow: 'hidden', opacity: 0,
  }}, parent);
  const content = node('div', { style: {
    position: 'absolute', left: 0, right: 0, top: 0, padding: '22px 30px 26px 24px',
  }}, box);
  node('div', { text: 'EMAIL THREAD', style: {
    fontSize: '13px', letterSpacing: '.18em', fontWeight: 700, color: INK_SOFT, marginBottom: '8px',
  }}, content);
  node('div', { text: 'Re: Re: Re: Re: Follow-up', style: {
    fontSize: '22px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
  }}, content);
  node('div', { text: '14 replies', style: {
    fontSize: '15px', color: INK_SOFT, marginTop: '4px', marginBottom: '10px',
  }}, content);

  const senders = MAIL.map(m => m[0]);
  const widths = [[92, 70, 55], [88, 62], [95, 78, 40], [80, 66], [90, 58, 72], [84, 46]];
  for (let k = 0; k < 12; k++) {
    const blk = node('div', { style: {
      marginTop: '12px', marginLeft: Math.min(k, 6) * 9 + 'px', paddingLeft: '12px',
      borderLeft: '3px solid rgba(22,67,86,.16)',
    }}, content);
    node('div', { text: senders[(k * 5 + 3) % senders.length] + ' wrote:', style: {
      fontSize: '14px', fontWeight: 700, color: 'rgba(14,46,60,.55)', marginBottom: '7px',
    }}, blk);
    widths[k % widths.length].forEach(wd => {
      node('div', { style: {
        height: '7px', width: wd + '%', borderRadius: '4px',
        background: 'rgba(22,67,86,.14)', marginBottom: '6px',
      }}, blk);
    });
  }

  /* the thing everyone is scrolling to find */
  orig = node('div', { style: {
    marginTop: '20px', marginLeft: '54px', padding: '8px 10px', borderRadius: '8px',
    border: '2px solid rgba(0,134,177,0)', background: 'rgba(0,134,177,0)',
    transformOrigin: 'left center',
  }}, content);
  node('div', { text: 'Original message', style: {
    fontSize: '11px', letterSpacing: '.12em', fontWeight: 700, color: INK_SOFT, marginBottom: '4px',
  }}, orig);
  node('div', { text: 'Could someone send the updated document?', style: {
    fontSize: '13px', fontWeight: 700, color: NAVY, lineHeight: 1.3,
  }}, orig);

  /* a scrollbar, so the depth of the chain is legible at a glance */
  node('div', { style: {
    position: 'absolute', right: '8px', top: '16px', bottom: '16px', width: '6px',
    borderRadius: '3px', background: 'rgba(22,67,86,.08)',
  }}, box);
  thumb = node('div', { style: {
    position: 'absolute', right: '8px', top: '16px', width: '6px', height: '80px',
    borderRadius: '3px', background: 'rgba(22,67,86,.32)',
  }}, box);
  return { box, content };
}

export function build(container) {
  root = container;
  paper(root);

  /* --- the mailbox panel -------------------------------------------- */
  panel = node('div', { style: {
    position: 'absolute', left: '0px', top: PANEL_TOP + 'px',
    width: PANEL_W + 'px', height: PANEL_H + 'px',
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
  node('div', { text: 'Inbox', style: {
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
    height: (PANEL_H - LIST_TOP) + 'px',
    overflow: 'hidden',          // scrolled rows must not ride over the header
  }}, panel);
  inner = node('div', { style: { position: 'absolute', inset: 0 }}, list);
  rows = MAIL.map((_, i) => mailRow(i, inner));

  /* CC counts, attached to specific rows */
  CC_ROWS.forEach(([i, label]) => {
    const c = node('div', { text: 'CC ' + label, style: {
      position: 'absolute', fontSize: '20px', fontWeight: 700,
      color: '#fff', background: 'rgba(22,67,86,.82)',
      padding: '6px 14px', borderRadius: '14px', opacity: 0,
      right: '28px', top: (i * ROW_H + 26) + 'px',
    }}, inner);
    ccChips.push(c);
  });

  /* the row nobody can place */
  unknown = node('div', { text: '?', style: {
    position: 'absolute', right: '28px', top: (UNKNOWN_ROW * ROW_H + 22) + 'px',
    width: '44px', height: '44px', borderRadius: '50%', boxSizing: 'border-box',
    background: '#fff', border: '3px solid ' + NAVY, color: NAVY,
    fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center',
    justifyContent: 'center', opacity: 0,
  }}, inner);

  /* --- forwarded copies --------------------------------------------- */
  for (let k = 0; k < 2; k++) {
    const g = node('div', { style: {
      position: 'absolute', width: '400px', height: '80px',
      background: '#fff', borderRadius: '12px',
      boxShadow: '0 12px 30px rgba(14,46,60,.22)',
      borderLeft: '5px solid ' + NAVY,
      display: 'flex', alignItems: 'center', padding: '0 20px',
      opacity: 0, left: '1080px', top: '270px',
    }}, root);
    node('div', { text: 'FW:', style: {
      fontSize: '22px', fontWeight: 700, color: BLUE, marginRight: '12px',
    }}, g);
    node('div', { text: MAIL[LIFT_ROW][1], style: {
      fontSize: '22px', color: 'rgba(14,46,60,.70)', whiteSpace: 'nowrap',
    }}, g);
    fwdGhosts.push(g);
  }

  /* --- the people ---------------------------------------------------- */
  figA = figure(root, { x: FIG_AX, y: FIG_Y, h: FIG_H, accent: BLUE });
  figB = figure(root, { x: FIG_BX, y: FIG_Y, h: FIG_H, accent: NAVY });
  figA.set({ opacity: 0 }); figB.set({ opacity: 0 });

  /* the magnifier the first one holds */
  glass = svgNode('svg', { viewBox: '0 0 64 64', width: 64, height: 64 }, root);
  Object.assign(glass.style, { position: 'absolute', left: '0px', top: '0px', opacity: 0, overflow: 'visible' });
  svgNode('line', { x1: 40, y1: 40, x2: 58, y2: 58, stroke: NAVY, 'stroke-width': 7, 'stroke-linecap': 'round' }, glass);
  svgNode('circle', { cx: 26, cy: 26, r: 19, fill: 'rgba(255,255,255,.78)', stroke: BLUE, 'stroke-width': 5 }, glass);

  oooChip = node('div', { style: {
    position: 'absolute', left: (FIG_BX - 20) + 'px', top: (FIG_Y - 58) + 'px', opacity: 0,
    transformOrigin: '30% 120%',
  }}, root);
  chip(oooChip, 'Out of office', 'closed', 22);

  /* --- "Who has this?" ------------------------------------------------ */
  who = node('div', { style: {
    position: 'absolute', left: '1440px', top: '380px',
    padding: '26px 34px', background: '#fff',
    border: '3px solid ' + BLUE, borderRadius: '20px',
    boxShadow: '0 22px 50px rgba(14,46,60,.24)',
    opacity: 0, transformOrigin: '20% 80%',
  }}, root);
  node('div', { text: 'Who has this?', style: {
    fontSize: '44px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, who);

  /* --- the long chain ------------------------------------------------- */
  const th = buildThread(root);
  thread = th.box; threadInner = th.content;

  /* --- the line ------------------------------------------------------- */
  line = onScreen(root, { text: 'Managing the request instead of solving it.', y: 44, size: 44, t0: T.line });

  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  /* very slow drift so long holds do not read as a still */
  root.style.transform = `scale(${lerp(1.0, 1.02, easeInOut(span(t, 0, dur)))})`;

  /* the drain at the end: everything but the pile */
  const d = span(t, T.dim, T.dim + 1.2);
  const dimF = `saturate(${lerp(1, .15, d)}) brightness(${lerp(1, .96, d)})`;
  const dimO = lerp(1, .32, d);

  /* --- panel arrives near centre, then clears left -------------------- */
  const pin = span(t, T.panelIn, T.panelIn + 0.7);
  const px = lerp(PANEL_X0, PANEL_X1, easeInOut(span(t, T.panelMove, T.panelMove + 1.0)));
  panel.style.opacity = pin;
  panel.style.transform = `translate(${px}px, ${lerp(30, 0, easeOut(pin))}px)`;

  /* --- two mails, then the flood -------------------------------------- */
  let landed = 0;
  rows.forEach((r, i) => {
    const u = i < T.early.length
      ? span(t, T.early[i], T.early[i] + 0.5)
      : stagger(t, T.fill, T.fillGap, 0.38, i - T.early.length);
    r.el.style.opacity = u;
    r.el.style.transform = `translateX(${lerp(46, 0, easeOut(u))}px)`;
    if (u > 0.5) landed++;
  });
  unread.textContent = String(landed);
  const heat = clamp(landed / MAIL.length);
  unread.style.background = heat < 0.55 ? BLUE
    : `rgb(${Math.round(lerp(0, 196, (heat - 0.55) / 0.45))}, ${Math.round(lerp(134, 86, (heat - 0.55) / 0.45))}, ${Math.round(lerp(177, 52, (heat - 0.55) / 0.45))})`;

  /* the list scrolls so mail lands into a pile deeper than the window;
     while she says "searching" it scrubs back up through it and returns */
  const overflow = Math.max(0, landed - VISIBLE);
  const scrub = Math.sin(Math.PI * span(t, T.search, T.scrubEnd)) * 3;
  inner.style.transform = `translateY(${-(overflow - scrub) * ROW_H}px)`;

  /* --- one email gets forwarded --------------------------------------- */
  const lift = span(t, T.fwdLift, T.fwdLift + 0.6);
  const target = rows[LIFT_ROW];
  if (lift > 0) {
    target.el.style.transform = `scale(${lerp(1, 1.03, easeOut(lift))})`;
    target.el.style.boxShadow =
      `0 ${lerp(2, 20, lift)}px ${lerp(8, 44, lift)}px rgba(14,46,60,${lerp(.10, .26, lift)})`;
    target.el.style.zIndex = 5;
  }
  fwdGhosts.forEach((g, k) => {
    const u = span(t, T.fwdSplit + k * 0.22, T.fwdSplit + k * 0.22 + 0.85);
    const out = span(t, T.ghostOut + k * 0.14, T.ghostOut + k * 0.14 + 0.6);
    g.style.opacity = u > 0 ? Math.min(1, u * 1.6) * (1 - out) : 0;
    g.style.transform =
      `translate(${lerp(-230, 0, easeOut(u))}px, ${lerp(30, k * 112, easeOut(u))}px)`
      + ` rotate(${lerp(-4, k === 0 ? -2 : 2, u)}deg)`;
  });

  /* --- CCs pile on ------------------------------------------------------ */
  ccChips.forEach((c, k) => {
    const u = stagger(t, T.ccIn, 0.30, 0.4, k);
    c.style.opacity = u;
    c.style.transform = `scale(${lerp(0.7, 1, easeBack(u))})`;
  });

  /* --- the "?" status --------------------------------------------------- */
  const uq = span(t, T.unknown, T.unknown + 0.45);
  unknown.style.opacity = uq;
  unknown.style.transform = `scale(${lerp(0.5, 1, easeBack(uq))})`;
  rows[UNKNOWN_ROW].el.style.borderLeftColor = uq > 0.5 ? 'rgba(22,67,86,.45)' : BLUE;

  /* --- the people ------------------------------------------------------- */
  const ua = span(t, T.search, T.search + 0.6);
  const sway = Math.sin((t - T.search) * 1.6) * ua;
  const aL = lerp(0, 64, easeOut(ua)) + sway * 7;
  figA.set({ opacity: ua * dimO, y: FIG_Y + lerp(28, 0, easeOut(ua)), headTilt: sway * 6, armL: aL });
  figA.svg.style.filter = dimF;
  /* the magnifier sits in the left hand, so it follows the arm's angle */
  const fw = FIG_H * 0.62;
  const th = aL * Math.PI / 180, L = FIG_H * 0.40;
  const hx = FIG_AX + fw * 0.13 - L * Math.sin(th);
  const hy = FIG_Y + lerp(28, 0, easeOut(ua)) + FIG_H * 0.36 + L * Math.cos(th);
  glass.style.left = (hx - 26) + 'px';
  glass.style.top = (hy - 26) + 'px';
  glass.style.opacity = ua * dimO;
  glass.style.filter = dimF;

  const ub = span(t, T.figB, T.figB + 0.6);
  const ghost = easeInOut(span(t, T.ooo, T.ooo + 1.0));
  figB.set({ opacity: ub * lerp(1, 0.16, ghost) * dimO, y: FIG_Y + lerp(28, 0, easeOut(ub)),
             headTilt: -5 * pulse(span(t, T.figB + 0.2, T.figB + 1.0)) });
  figB.svg.style.filter = dimF;

  const oc = span(t, T.oooChip, T.oooChip + 0.5);
  oooChip.style.opacity = oc * dimO;
  oooChip.style.transform = `scale(${lerp(0.72, 1, easeBack(oc))})`;
  oooChip.style.filter = dimF;

  /* --- who has this? ------------------------------------------------------ */
  const wu = span(t, T.who, T.who + 0.5);
  who.style.opacity = wu * dimO;
  const bob = Math.sin((t - T.who) * 1.4) * 6 * clamp(wu);
  who.style.transform = `translateY(${lerp(22, bob, easeOut(wu))}px) scale(${lerp(0.82, 1, easeBack(wu))})`;
  who.style.filter = dimF;

  /* --- the long chain -------------------------------------------------- */
  const tu = span(t, T.thread, T.thread + 0.9);
  thread.style.opacity = span(t, T.thread, T.thread + 0.3) * dimO;
  thread.style.height = lerp(0, THREAD_H, easeOut(tu)) + 'px';
  thread.style.filter = dimF;
  const contentH = threadInner.offsetHeight || THREAD_H;
  const scrollMax = Math.max(0, contentH - THREAD_H);
  const sc = easeInOut(span(t, T.scroll0, T.scroll1));
  threadInner.style.transform = `translateY(${-scrollMax * sc}px)`;
  const trackH = THREAD_H - 32;
  const thumbH = Math.max(40, trackH * THREAD_H / contentH);
  thumb.style.height = thumbH + 'px';
  thumb.style.top = (16 + (trackH - thumbH) * sc) + 'px';
  /* and the original question, tiny, lit for a moment */
  const hq = span(t, T.question, T.question + 0.4);
  orig.style.borderColor = `rgba(0,134,177,${hq})`;
  orig.style.background = `rgba(0,134,177,${.12 * hq})`;
  orig.style.transform = `scale(${1 + 0.06 * pulse(span(t, T.question, T.question + 0.8))})`;

  /* --- the line ------------------------------------------------------------ */
  line.update(t);

  cc.update(t, CUES);
  return `landed ${landed} px ${Math.round(px)} scroll ${sc.toFixed(2)} dim ${d.toFixed(2)}`;
}
