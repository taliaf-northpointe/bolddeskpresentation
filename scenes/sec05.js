/* ===================================================================
   sec05 — "Nothing changes for the person emailing you"      54.8s

   Adapted from scene05. The person asking keeps emailing the address
   they always have; behind the centre line that email becomes a
   ticket whose rows appear only on the words that name them. The same
   state is then labelled twice — "Awaiting your reply" for the person,
   "Waiting for Customer Response" for the team — and one curve joins
   the two. Simple outside, organized inside. Then the point for
   employees: email still works, but the portal (which takes the reply
   card's place) captures more up front and gets them help faster.

   Every number below is read from data/words-sec05.json /
   data/cues-sec05.json (where Ava actually says the phrase) and kept
   as a constant so the beat can be re-timed in one place.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, edges,
  node, svgNode, span, lerp, easeOut, easeInOut, easeBack, NAVY, BLUE,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';
import { emailCard, ticketCard, chip, panelLabel, TONE } from '../lib/ui.js';

export const id = 'sec05';
export const title = 'Nothing changes for the person emailing you';
export const dur = 55.1;
export const visemes = null;

const CUES = loadCues('data/cues-sec05.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  cardOut:   3.00,    // title card (hold 2.40 + 0.60 out) has left the frame
  mailIn:    3.10,    // the requester's email arrives on the left
  behind:    5.51,   // "behind the scenes"          -> right panel label
  person:    8.20,   // "the person asking"          -> left panel label
  address:  15.44,   // "support email addresses"    -> "support@ (same address)" chip
  check:    15.80,   // "addresses"                  -> small check
  external: 16.92,   // "external customers"         -> "External customers still email" chip
  fly:      23.94,   // "that email"                 -> crosses the centre line
  become:   24.70,   // "becomes a ticket"           -> and is a ticket
  tracked:  25.67,   // "tracked"                    -> status row
  assigned: 26.67,   // "assigned"                   -> assignee row
  documented: 27.70, // "documented"                 -> activity history
  measured: 28.79,   // "measured"                   -> resolution-due row
  reply:    30.04,   // "So what changes for the customer" -> a plain reply lands
  replyChip: 33.60,  // "the service they get"       -> "Awaiting your reply"
  team:     36.56,   // "And for the agents"         -> "Waiting for Customer Response"
  curve:    39.89,   // "organized"                  -> one curve joins the two
  line:     34.79,   // "better, and faster"         -> on-screen line
  employees: 41.52,  // "Email works for Northpointe employees too" -> reply gives way
  portal:   45.97,   // "portal"                     -> the portal card takes its place
  info:     50.41,   // "more information up front"  -> its fields fill
  faster:   53.43,   // "faster"                     -> check + chip
};

let root, card, cc, tint, divider, labelL, labelR,
    mail, addrChip, addrCheck, extChip, flyer, ticket, reply, replyChip,
    linkSvg, linkPath, linkNote, line, line2, portal, portalRows = [], portalDone;

export function build(container) {
  root = container;
  paper(root);

  /* the requester's half stays plain all scene, on purpose */
  tint = node('div', { style: {
    position: 'absolute', left: 0, top: 0, width: '960px', height: '1080px',
    background: 'rgba(0,134,177,.045)', opacity: 0,
  }}, root);
  divider = node('div', { style: {
    position: 'absolute', left: '959px', top: '50%', width: '2px', height: '0px',
    background: 'rgba(22,67,86,.14)', transform: 'translateY(-50%)',
  }}, root);

  labelL = panelLabel(root, 'THE PERSON ASKING', 120, 150);
  labelR = panelLabel(root, 'BEHIND THE SCENES', 1056, 150);

  /* --- requester side --------------------------------------------- */
  mail = emailCard(root, {
    x: 120, y: 250, w: 700,
    from: 'A colleague',
    subject: 'Access to a system',
    body: 'Sent to the same address as always.',
  });
  /* sits on the card's "to" line; mail.el is the containing block */
  addrChip = node('div', { style: {
    position: 'absolute', left: '196px', top: '52px',
    display: 'flex', alignItems: 'center', gap: '10px', opacity: 0,
  }}, mail.el);
  chip(addrChip, 'support@  (same address)', 'open', 17);
  addrCheck = svgNode('svg', { viewBox: '0 0 24 24', width: 26, height: 26 }, addrChip);
  svgNode('circle', { cx: 12, cy: 12, r: 11, fill: BLUE }, addrCheck);
  svgNode('path', { d: 'M6.5 12.5l3.5 3.5 7.5-8', fill: 'none', stroke: '#fff',
    'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, addrCheck);

  /* external customers keep emailing — a chip under the card */
  extChip = node('div', { style: {
    position: 'absolute', left: '32px', bottom: '-22px', opacity: 0,
  }}, mail.el);
  chip(extChip, 'External customers still email, exactly as today', 'open', 17);

  /* the plain reply that arrives later — still just an email */
  reply = emailCard(root, {
    x: 120, y: 560, w: 700,
    from: 'Support',
    subject: 'Re: Access to a system',
    body: "We've got this — we'll follow up shortly.",
  });
  replyChip = chip(reply.footer, 'Awaiting your reply', 'waiting', 22);

  /* --- the thing that crosses the divider -------------------------- */
  flyer = node('div', { text: 'Access to a system', style: {
    position: 'absolute', left: '640px', top: '330px', width: '230px',
    padding: '18px 22px', background: '#fff', borderRadius: '13px',
    borderLeft: '6px solid ' + BLUE,
    boxShadow: '0 16px 36px rgba(14,46,60,.20)', opacity: 0,
    fontSize: '21px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, root);

  /* --- team side --------------------------------------------------- */
  ticket = ticketCard(root, {
    x: 1056, y: 210, w: 700,
    title: 'Access to a system', ref: '#1042',
  });

  /* --- one curve from the requester's chip to the agent's ---------- */
  linkSvg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, root);
  Object.assign(linkSvg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });
  linkPath = svgNode('path', {
    d: 'M 392 793 C 720 793, 760 428, 1046 428',
    fill: 'none', stroke: BLUE, 'stroke-width': 3,
    'stroke-dasharray': '8 10', 'stroke-opacity': 0,
  }, linkSvg);
  linkNote = node('div', { text: 'the same request', style: {
    position: 'absolute', left: '850px', top: '580px',
    fontSize: '20px', fontWeight: 700, color: BLUE,
    letterSpacing: '.04em', opacity: 0, whiteSpace: 'nowrap',
  }}, root);

  /* --- the portal card, for employees: takes the reply's place -------- */
  portal = node('div', { style: {
    position: 'absolute', left: '120px', top: '560px', width: '700px',
    background: '#fff', borderRadius: '16px', border: '3px solid rgba(0,134,177,.35)',
    boxShadow: '0 18px 44px rgba(14,46,60,.14)', padding: '24px 32px 26px', opacity: 0,
  }}, root);
  const ph = node('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}, portal);
  node('div', { text: 'PORTAL', style: { fontSize: '17px', letterSpacing: '.18em', color: BLUE, fontWeight: 700 }}, ph);
  chip(ph, 'Northpointe employees only', 'open', 16);
  ['Group', 'Application', 'Request type', 'What you need'].forEach(lbl => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '16px', padding: '9px 0',
      borderTop: '1px solid rgba(22,67,86,.10)',
    }}, portal);
    node('div', { text: lbl, style: { width: '200px', fontSize: '20px', color: 'rgba(14,46,60,.55)' }}, r);
    const bar = node('div', { style: {
      height: '14px', width: '0px', borderRadius: '7px', background: 'rgba(0,134,177,.35)',
    }}, r);
    portalRows.push(bar);
  });
  portalDone = node('div', { style: { position: 'absolute', right: '28px', top: '22px', opacity: 0 }}, portal);
  chip(portalDone, 'Help, faster', 'open', 18);

  /* --- the lines ---------------------------------------------------- */
  line = onScreen(root, { text: 'Same email. Better, faster service.', y: 56, size: 46,
                          t0: T.line, t1: T.employees - 0.2 });
  line2 = onScreen(root, { text: 'For employees: the portal. Internal only.', y: 56, size: 46,
                           t0: T.portal });

  card = titleCard(root, { n: 5, title: 'Nothing changes for the person emailing you' });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* --- the stage splits ---------------------------------------------- */
  const dv = span(t, T.cardOut - 0.3, T.cardOut + 0.6);
  divider.style.height = (easeOut(dv) * 1080) + 'px';
  tint.style.opacity = dv;
  const lr = span(t, T.behind, T.behind + 0.5);
  labelR.style.opacity = lr * 0.9;
  labelR.style.transform = `translateY(${lerp(8, 0, easeOut(lr))}px)`;
  const ll = span(t, T.person, T.person + 0.5);
  labelL.style.opacity = ll * 0.9;
  labelL.style.transform = `translateY(${lerp(8, 0, easeOut(ll))}px)`;

  /* --- the email, unchanged all scene ------------------------------- */
  const mi = span(t, T.mailIn, T.mailIn + 0.7);
  mail.el.style.opacity = mi;
  mail.el.style.transform = `translateY(${lerp(26, 0, easeOut(mi))}px)`;

  /* same address as always — chip, then a check */
  const ad = span(t, T.address, T.address + 0.45);
  addrChip.style.opacity = ad;
  addrChip.style.transform = `translateX(${lerp(-10, 0, easeOut(ad))}px)`;
  const ck = span(t, T.check, T.check + 0.4);
  addrCheck.style.opacity = ck;
  addrCheck.style.transform = `scale(${lerp(0.4, 1, easeBack(ck))})`;

  /* --- it crosses ---------------------------------------------------- */
  const fly = span(t, T.fly, T.become + 0.1);
  const f = easeInOut(fly);
  flyer.style.opacity = Math.min(span(t, T.fly, T.fly + 0.25),
                                 1 - span(t, T.become, T.become + 0.3));
  flyer.style.transform =
    `translate(${lerp(0, 430, f)}px, ${lerp(0, -74, f)}px) scale(${lerp(1, 0.92, f)})`;

  /* --- and becomes a ticket ------------------------------------------ */
  const bc = span(t, T.become, T.become + 0.8);
  ticket.el.style.opacity = bc;
  ticket.el.style.transform =
    `translateY(${lerp(22, 0, easeOut(bc))}px) scale(${lerp(0.92, 1, easeBack(bc))})`;

  /* --- tracked, assigned, documented, measured — each on its word --- */
  const trk = span(t, T.tracked, T.tracked + 0.5);
  ticket.rows.status.style.opacity = trk;
  ticket.rows.status.style.transform = `translateX(${lerp(-14, 0, easeOut(trk))}px)`;

  const asg = span(t, T.assigned, T.assigned + 0.5);
  ticket.rows.owner.style.opacity = asg;
  ticket.rows.owner.style.transform = `translateX(${lerp(-14, 0, easeOut(asg))}px)`;

  const doc = span(t, T.documented, T.documented + 0.5);
  ticket.hist.style.opacity = doc;
  ticket.histRows.forEach((r, i) => {
    r.style.opacity = stagger(t, T.documented + 0.1, 0.18, 0.4, i);
  });

  const msr = span(t, T.measured, T.measured + 0.5);
  ticket.rows.due.style.opacity = msr;
  ticket.rows.due.style.transform = `translateX(${lerp(-14, 0, easeOut(msr))}px)`;

  /* external customers keep emailing */
  const ex = span(t, T.external, T.external + 0.5);
  extChip.style.opacity = ex;
  extChip.style.transform = `translateY(${lerp(8, 0, easeOut(ex))}px)`;

  /* --- the requester gets an ordinary email back --------------------- */
  const rpOut = span(t, T.employees - 0.2, T.employees + 0.5);
  const rp = span(t, T.reply, T.reply + 0.7) * (1 - rpOut);
  reply.el.style.opacity = rp;
  reply.el.style.transform = `translateY(${lerp(26, 0, easeOut(rp))}px)`;
  reply.footer.style.opacity = String(span(t, T.replyChip, T.replyChip + 0.5));

  /* --- the same state, labelled for each reader ---------------------- */
  const tw = span(t, T.team, T.team + 0.5);
  if (tw > 0.5) {
    ticket.rows.statusChip.textContent = 'Waiting for Customer Response';
    ticket.rows.statusChip.style.background = TONE.waiting.bg;
    ticket.rows.statusChip.style.color = TONE.waiting.fg;
  } else {
    ticket.rows.statusChip.textContent = 'Open';
    ticket.rows.statusChip.style.background = TONE.open.bg;
    ticket.rows.statusChip.style.color = TONE.open.fg;
  }
  const bump = pulse(span(t, T.team + 0.2, T.team + 0.8));
  ticket.rows.statusChip.style.transform = `scale(${1 + bump * 0.10})`;
  replyChip.style.transform = `scale(${1 + bump * 0.10})`;

  const cv = span(t, T.curve, T.curve + 0.7) * (1 - rpOut);
  linkPath.setAttribute('stroke-opacity', String(cv * 0.85));
  /* the note gives way to the on-screen line — one phrase at a time */
  linkNote.style.opacity = String(span(t, T.curve + 0.3, T.curve + 0.9) * (1 - span(t, T.line, T.line + 0.4)));

  /* --- for employees: the portal, in the reply's place ------------------ */
  const po = span(t, T.portal, T.portal + 0.7);
  portal.style.opacity = po;
  portal.style.transform = `translateY(${lerp(26, 0, easeOut(po))}px) scale(${lerp(0.96, 1, easeBack(po))})`;
  portalRows.forEach((bar, i) => {
    const u = easeOut(stagger(t, T.info, 0.22, 0.6, i));
    bar.style.width = (u * [220, 300, 260, 380][i]) + 'px';
  });
  const fd = span(t, T.faster, T.faster + 0.45);
  portalDone.style.opacity = fd;
  portalDone.style.transform = `scale(${lerp(0.7, 1, easeBack(fd))})`;

  /* --- the lines -------------------------------------------------------- */
  line.update(t);
  line2.update(t);

  cc.update(t, CUES);
  return `mail ${mi.toFixed(2)} ticket ${bc.toFixed(2)} two ${tw.toFixed(2)}`;
}
