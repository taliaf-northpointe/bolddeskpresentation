/* ===================================================================
   sec09 — "Better communication. Better accountability.
            Better customer experience."                         28.5s

   Adapted from scene09. Title card, then ticket #1042 (the same ticket
   as sec05) sits at centre with its response-due chip. On the left,
   the requester's view of the same thing: a status line that goes from
   "Awaiting your reply" to "In progress", and a small person who is
   not left wondering. On the right, the owner and a teammate: the
   owner goes out of office, the ticket slides to the teammate, and the
   history and notes reveal one row at a time. Two closing lines.

   Every number in T is read from data/words-sec09.json and kept as a
   constant so a beat can be re-timed in one place.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, figure, edges,
  node, svgNode, span, lerp, clamp, easeOut, easeInOut, easeBack, NAVY, BLUE, INK, INK_SOFT,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';
import { ticketCard, chip, TONE } from '../lib/ui.js';

export const id = 'sec09';
export const title = 'Better communication. Better accountability. Better customer experience.';
export const dur = 28.9;
export const visemes = null;

const CUES = loadCues('data/cues-sec09.json');

/* ---------- layout ------------------------------------------------- */
const TICKET_X = 560, TICKET_Y = 250, TICKET_W = 620, SLIDE = 100;   // slid edge 1280 stays clear of the owner at 1300
const FIG_H = 240, FIG_Y = 380, OWNER_X = 1300, MATE_X = 1620;
const CUST_X = 110, CUST_W = 360, CUST_FIG_H = 170;

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  cardOut:   3.00,    // title card (hold 2.40 + 0.60 out) has left the frame
  ticketIn:  3.00,    // the ticket, with its response-due chip, arrives at centre
  people:    3.30,    // owner and teammate arrive beside it
  custIn:    4.35,   // "requests are tracked"      -> the requester's view appears
  tracked:   5.00,   // "tracked"                   -> status row bumps
  slas:      5.72,   // "SLAs"                      -> response-due chip bumps
  flip:      8.13,   // "make sure"                 -> "Awaiting your reply" becomes "In progress" + check
  relax:     8.64,   // "customers aren't left wondering" -> a small relaxed head tilt
  focus:    12.78,   // "And when someone"          -> the requester's view recedes a little
  ooo:      13.82,   // "out"                       -> the owner fades to a ghost
  oooChip:  14.17,   // "office"                    -> "Out of office" chip
  slide:    15.71,   // "the rest of the team"      -> the ticket slides to the teammate
  swap:     16.26,   //                                assignee changes as it lands
  history:  17.10,   // "history"                   -> activity opens, rows one at a time
  pickup:   18.82,   // "pick up"                   -> the teammate takes it
  line1:    21.31,   // "The goal isn't to make people work harder."  -> "Not harder."
  line1Out: 24.12,
  line2:    24.42,   // "It's to make it easier..."                    -> "Easier to work together."
};

let root, card, cc, ticket, sla, ownerName, owner, mate, oooChip,
    cust, custCard, statusChip, check, line1, line2;

export function build(container) {
  root = container;
  paper(root);

  /* --- the ticket, same as sec05 ------------------------------------- */
  ticket = ticketCard(root, {
    x: TICKET_X, y: TICKET_Y, w: TICKET_W,
    title: 'Access to a system', ref: '#1042',
  });
  /* activity stays out of the layout until the handoff, so the card is
     compact while the accountability point is made */
  ticket.hist.style.display = 'none';
  /* a note row between "assigned" and "reply sent" — the narration says
     "history and notes", so both should be there to reveal */
  const noteRow = node('div', { style: {
    display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 0', opacity: 0,
  }});
  node('div', { style: {
    width: '10px', height: '10px', borderRadius: '50%', background: BLUE, flex: '0 0 auto',
  }}, noteRow);
  node('div', { text: 'Note added', style: { fontSize: '20px', color: 'rgba(14,46,60,.66)' }}, noteRow);
  ticket.hist.insertBefore(noteRow, ticket.histRows[2]);
  ticket.histRows.splice(2, 0, noteRow);

  /* the response-due chip in the card's top-right corner */
  sla = chip(ticket.el, 'Response due · Within target', 'open', 17);
  Object.assign(sla.style, { position: 'absolute', right: '30px', top: '28px', opacity: 0,
                             transformOrigin: '50% 50%' });
  /* the assignee text, so it can change hands */
  ownerName = ticket.rows.owner.lastChild.lastChild;

  /* --- the people on the team ------------------------------------------ */
  owner = figure(root, { x: OWNER_X, y: FIG_Y, h: FIG_H, accent: NAVY, label: 'Owner' });
  mate  = figure(root, { x: MATE_X,  y: FIG_Y, h: FIG_H, accent: BLUE, label: 'Teammate' });
  owner.set({ opacity: 0 }); mate.set({ opacity: 0 });

  oooChip = node('div', { style: {
    position: 'absolute', left: (OWNER_X - 16) + 'px', top: (FIG_Y - 56) + 'px', opacity: 0,
    transformOrigin: '30% 120%',
  }}, root);
  chip(oooChip, 'Out of office', 'closed', 22);

  /* --- the requester's view -------------------------------------------- */
  const cw = CUST_FIG_H * 0.62;
  cust = figure(root, { x: CUST_X + (CUST_W - cw) / 2, y: 300, h: CUST_FIG_H, accent: BLUE, label: 'Customer' });
  cust.set({ opacity: 0 });

  custCard = node('div', { style: {
    position: 'absolute', left: CUST_X + 'px', top: '536px', width: CUST_W + 'px',
    boxSizing: 'border-box', background: '#fff', borderRadius: '16px',
    boxShadow: '0 18px 44px rgba(14,46,60,.14)', padding: '22px 26px', opacity: 0,
  }}, root);
  node('div', { text: 'YOUR REQUEST', style: {
    fontSize: '14px', letterSpacing: '.18em', fontWeight: 700, color: INK_SOFT, marginBottom: '8px',
  }}, custCard);
  node('div', { text: 'Access to a system', style: {
    fontSize: '22px', fontWeight: 700, color: NAVY, marginBottom: '14px',
  }}, custCard);
  const statusRow = node('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' }}, custCard);
  statusChip = chip(statusRow, 'Awaiting your reply', 'waiting', 19);
  statusChip.style.transformOrigin = 'left center';
  check = svgNode('svg', { viewBox: '0 0 24 24', width: 28, height: 28 }, statusRow);
  svgNode('circle', { cx: 12, cy: 12, r: 11, fill: BLUE }, check);
  svgNode('path', { d: 'M6.5 12.5l3.5 3.5 7.5-8', fill: 'none', stroke: '#fff',
    'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);
  check.style.opacity = 0;

  /* --- the lines ------------------------------------------------------- */
  line1 = onScreen(root, { text: 'Not harder.', y: 60, size: 52, t0: T.line1, t1: T.line1Out });
  line2 = onScreen(root, { text: 'Easier to work together.', y: 60, size: 52, t0: T.line2 });

  /* The full title ("Better communication. Better accountability. Better
     customer experience.") runs to four lines at 84px in 1400px, so the
     card carries the short form — and breaks it on the full stops rather
     than letting "Customer / experience." wrap mid-phrase. */
  card = titleCard(root, { n: 9, title: 'Communication. Accountability. Customer experience.' });
  card.el.firstChild.children[1].innerHTML = 'Communication.<br>Accountability.<br>Customer experience.';
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* --- the ticket arrives with its chip -------------------------------- */
  const ti = span(t, T.ticketIn, T.ticketIn + 0.8);
  const sl = easeInOut(span(t, T.slide, T.slide + 1.1));
  const bump = pulse(span(t, T.pickup, T.pickup + 0.6));
  ticket.el.style.opacity = ti;
  ticket.el.style.transform =
    `translate(${lerp(0, SLIDE, sl)}px, ${lerp(22, 0, easeOut(ti))}px) scale(${lerp(0.94, 1, easeBack(ti)) + bump * 0.02})`;
  ticket.rows.owner.style.opacity  = span(t, T.ticketIn + 0.3, T.ticketIn + 0.7);
  ticket.rows.status.style.opacity = span(t, T.ticketIn + 0.45, T.ticketIn + 0.85);
  ticket.rows.due.style.opacity    = span(t, T.ticketIn + 0.6, T.ticketIn + 1.0);
  const si = span(t, T.ticketIn + 0.5, T.ticketIn + 0.9);
  sla.style.opacity = si;
  /* "tracked" bumps the status row, "SLAs" bumps the chip */
  const trk = pulse(span(t, T.tracked, T.tracked + 0.6));
  ticket.rows.statusChip.style.transform = `scale(${1 + trk * 0.12})`;
  const sb = pulse(span(t, T.slas, T.slas + 0.7));
  sla.style.transform = `scale(${lerp(0.7, 1, easeBack(si)) + sb * 0.12})`;
  sla.style.background = sb > 0.4 ? BLUE : TONE.open.bg;
  sla.style.color = sb > 0.4 ? '#fff' : TONE.open.fg;

  /* --- owner and teammate ---------------------------------------------- */
  const po = easeOut(span(t, T.people, T.people + 0.7));
  const pm = easeOut(span(t, T.people + 0.2, T.people + 0.9));
  const ghost = easeInOut(span(t, T.ooo, T.ooo + 1.0));
  owner.set({ opacity: po * lerp(1, 0.16, ghost), y: FIG_Y + lerp(28, 0, po) });
  const pk = easeOut(span(t, T.pickup, T.pickup + 0.7));
  mate.set({ opacity: pm, y: FIG_Y + lerp(28, 0, pm), armR: lerp(0, 42, pk), headTilt: lerp(0, -6, pk) });

  const oc = span(t, T.oooChip, T.oooChip + 0.5);
  oooChip.style.opacity = oc;
  oooChip.style.transform = `scale(${lerp(0.72, 1, easeBack(oc))})`;

  /* assignee changes hands as the ticket lands */
  const sw = span(t, T.swap, T.swap + 0.5);
  ownerName.textContent = sw > 0.5 ? 'Support / Teammate' : 'Support / Owner';
  ticket.rows.owner.lastChild.style.transform = `scale(${1 + pulse(sw) * 0.08})`;
  ticket.rows.owner.lastChild.style.transformOrigin = 'right center';

  /* history and notes, one at a time */
  ticket.hist.style.display = t >= T.history ? 'block' : 'none';
  ticket.hist.style.opacity = span(t, T.history, T.history + 0.4);
  ticket.histRows.forEach((r, i) => {
    r.style.opacity = stagger(t, T.history + 0.15, 0.42, 0.45, i);
  });

  /* --- the requester's view -------------------------------------------- */
  const fo = lerp(1, 0.45, span(t, T.focus, T.focus + 0.8));
  const ci = span(t, T.custIn, T.custIn + 0.7);
  const rl = easeOut(span(t, T.relax, T.relax + 1.0));
  const breathe = Math.sin((t - T.relax) * 1.3) * 1.5 * rl;
  cust.set({ opacity: ci * fo, y: 300 + lerp(24, 0, easeOut(ci)), headTilt: lerp(0, 9, rl) + breathe });
  custCard.style.opacity = span(t, T.custIn + 0.15, T.custIn + 0.75) * fo;
  custCard.style.transform = `translateY(${lerp(24, 0, easeOut(span(t, T.custIn + 0.15, T.custIn + 0.75)))}px)`;

  const fl = span(t, T.flip, T.flip + 0.5);
  if (fl > 0.5) {
    statusChip.textContent = 'In progress';
    statusChip.style.background = TONE.open.bg;
    statusChip.style.color = TONE.open.fg;
  } else {
    statusChip.textContent = 'Awaiting your reply';
    statusChip.style.background = TONE.waiting.bg;
    statusChip.style.color = TONE.waiting.fg;
  }
  statusChip.style.transform = `scale(${1 + pulse(fl) * 0.10})`;
  const ck = span(t, T.flip + 0.35, T.flip + 0.75);
  check.style.opacity = ck;
  check.style.transform = `scale(${lerp(0.4, 1, easeBack(ck))})`;

  /* --- the lines --------------------------------------------------------- */
  line1.update(t);
  line2.update(t);

  cc.update(t, CUES);
  return `ticket ${ti.toFixed(2)} flip ${fl.toFixed(2)} ghost ${ghost.toFixed(2)} slide ${sl.toFixed(2)}`;
}
