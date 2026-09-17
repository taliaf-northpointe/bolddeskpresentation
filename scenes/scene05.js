/* ===================================================================
   SCENE 5 — "Simple for the person asking"              1:43 – 2:06

   The scene that answers the objection everyone actually has: that
   moving a mailbox means the email goes away and the work gets harder.

   The reference screenshots gave this scene its spine. The same ticket
   state is labelled two different ways depending on who is looking:
   the team sees "Waiting for Customer Response", the person who asked
   sees "Awaiting your reply". Two vocabularies, each aimed at its
   reader, which IS the on-screen line — simple outside, organized
   inside. Showing that is far better than asserting it.

   Build note honoured: only the fields the narration names are animated.
   A card that fills in all at once reads as a feature list.
=================================================================== */

import {
  node, svgNode, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';
import { emailCard, ticketCard, chip, panelLabel, TONE } from '../lib/ui.js';

export const id = 'scene05';
export const title = 'Simple for the person asking';
export const dur = 23.0;
export const visemes = null;               // voice-over only

const CUES = [
  [0.30,  4.20, "The person asking for help can still email."],
  [4.60, 11.40, "Behind the scenes, that email becomes a ticket that can be assigned, documented, and tracked."],
  [11.80,15.40, "For the customer, the experience stays simple."],
  [15.80,20.60, "For the team, the work becomes much more organized."],
];

const T = {
  mailIn:    0.35,
  fly:       2.90,      // the email crosses to the team's side
  become:    4.70,      // and becomes a ticket
  assigned:  7.10,      // each on its word in the long sentence
  documented:8.60,
  tracked:  10.10,
  reply:    12.10,      // requester gets a plain email back
  twoWords: 16.20,      // the same state, labelled twice
  line:     17.60,
  portal:   20.70,      // transition into Scene 6
};

let root, divider, labels = [], mail, ticket, flyer, reply, replyChip,
    agentChip, linkSvg, linkPath, linkNote, onscreen, portal, cc;

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(168deg, #FBFDFE 0%, #E6EFF4 100%)',
  }}, root);

  /* Two sides. The left stays plain for the whole scene on purpose. */
  node('div', { style: {
    position: 'absolute', left: 0, top: 0, width: '960px', height: '1080px',
    background: 'rgba(0,134,177,.045)',
  }}, root);

  divider = node('div', { style: {
    position: 'absolute', left: '959px', top: '50%', width: '2px', height: '0px',
    background: 'rgba(22,67,86,.14)', transform: 'translateY(-50%)',
  }}, root);

  labels.push(panelLabel(root, 'THE PERSON ASKING', 120, 92));
  labels.push(panelLabel(root, 'THE TEAM', 1622, 92));

  /* --- requester side --------------------------------------------- */
  mail = emailCard(root, {
    x: 120, y: 300, w: 700,
    from: 'A colleague',
    subject: 'Access to a system',
    body: 'Sent to the same address as always.',
  });

  /* the plain reply that arrives later — still just an email */
  reply = emailCard(root, {
    x: 120, y: 636, w: 700,
    from: 'Support',
    subject: 'Re: Access to a system',
    body: "We've got this — we'll follow up shortly.",
  });
  replyChip = chip(reply.footer, 'Awaiting your reply', 'waiting', 22);

  /* --- the thing that crosses the divider -------------------------- */
  /* A small stand-in for the email in transit. The full cards are too
     heavy to fly; this reads as the message itself moving. */
  flyer = node('div', { style: {
    position: 'absolute', left: '700px', top: '392px', width: '210px',
    padding: '18px 22px', background: '#fff', borderRadius: '13px',
    borderLeft: '6px solid ' + BLUE,
    boxShadow: '0 16px 36px rgba(14,46,60,.20)', opacity: 0,
    fontSize: '21px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, root);
  flyer.textContent = 'Access to a system';

  /* --- team side --------------------------------------------------- */
  ticket = ticketCard(root, {
    x: 1056, y: 258, w: 700,
    title: 'Access to a system', ref: '#1042',
  });
  /* the agent-side label for the same state */
  agentChip = chip(ticket.rows.status.lastChild, '', 'waiting', 20);
  agentChip.style.display = 'none';

  /* --- the link between the two labels ----------------------------- */
  /* One curve from the requester's chip to the agent's, with a small
     note. This is the whole idea of the scene in one gesture. */
  linkSvg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, root);
  Object.assign(linkSvg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });
  linkPath = svgNode('path', {
    d: 'M 832 872 C 946 872, 962 520, 1046 470',
    fill: 'none', stroke: BLUE, 'stroke-width': 3,
    'stroke-dasharray': '8 10', 'stroke-opacity': 0,
  }, linkSvg);
  linkNote = node('div', { text: 'the same request', style: {
    position: 'absolute', left: '860px', top: '652px',
    fontSize: '20px', fontWeight: 700, color: BLUE,
    letterSpacing: '.04em', opacity: 0, whiteSpace: 'nowrap',
  }}, root);

  /* --- the line ---------------------------------------------------- */
  onscreen = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '96px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'Simple outside. Organized inside.', style: {
    fontSize: '50px', fontWeight: 700, color: NAVY,
  }}, onscreen);

  /* --- transition: into the portal --------------------------------- */
  portal = node('div', { style: {
    position: 'absolute', left: '560px', top: '250px',
    width: '800px', height: '560px', background: '#fff',
    borderRadius: '22px', boxShadow: '0 34px 84px rgba(14,46,60,.24)',
    overflow: 'hidden', opacity: 0, transformOrigin: '50% 50%',
  }}, root);
  const phead = node('div', { style: {
    height: '104px', background: NAVY, display: 'flex',
    alignItems: 'center', padding: '0 34px',
  }}, portal);
  node('div', { text: 'My Requests', style: {
    fontSize: '32px', fontWeight: 700, color: '#fff',
  }}, phead);
  for (let i = 0; i < 3; i++) {
    const r = node('div', { style: {
      margin: '22px 30px 0', height: '84px', background: '#F6FAFC',
      borderRadius: '12px', borderLeft: '5px solid ' + BLUE,
      display: 'flex', alignItems: 'center', padding: '0 24px',
      justifyContent: 'space-between',
    }}, portal);
    node('div', { text: ['Access to a system', 'Report question', 'Document needed'][i], style: {
      fontSize: '24px', fontWeight: 700, color: NAVY,
    }}, r);
    chip(r, ['Awaiting your reply', 'Open', 'Open'][i], i === 0 ? 'waiting' : 'open', 19);
  }

  cc = makeCaptions(root);
  return { cc };
}

export function render(t) {
  root.style.transform = `scale(${lerp(1.0, 1.028, easeInOut(span(t, 0, dur)))})`;
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 22.5, dur));

  const dv = span(t, 0.15, 0.95);
  divider.style.height = (easeOut(dv) * 1080) + 'px';
  labels.forEach((l, i) => { l.style.opacity = stagger(t, 0.55, 0.15, 0.5, i) * 0.9; });

  /* --- the email, unchanged all scene ----------------------------- */
  const mi = span(t, T.mailIn, T.mailIn + 0.7);
  mail.el.style.opacity = mi;
  mail.el.style.transform = `translateY(${lerp(26, 0, easeOut(mi))}px)`;

  /* --- it crosses --------------------------------------------------- */
  const fly = span(t, T.fly, T.fly + 1.5);
  const f = easeInOut(fly);
  flyer.style.opacity = Math.min(span(t, T.fly, T.fly + 0.25),
                                 1 - span(t, T.become, T.become + 0.3));
  flyer.style.transform =
    `translate(${lerp(0, 430, f)}px, ${lerp(0, -74, f)}px) scale(${lerp(1, 0.92, f)})`;

  /* --- and becomes a ticket ---------------------------------------- */
  const bc = span(t, T.become, T.become + 0.8);
  ticket.el.style.opacity = bc;
  ticket.el.style.transform =
    `translateY(${lerp(22, 0, easeOut(bc))}px) scale(${lerp(0.92, 1, easeBack(bc))})`;

  /* --- assigned, documented, tracked — each on its word ------------ */
  const asg = span(t, T.assigned, T.assigned + 0.5);
  ticket.rows.owner.style.opacity = asg;
  ticket.rows.owner.style.transform = `translateX(${lerp(-14, 0, easeOut(asg))}px)`;

  const doc = span(t, T.documented, T.documented + 0.5);
  ticket.hist.style.opacity = doc;
  ticket.histRows.forEach((r, i) => {
    r.style.opacity = stagger(t, T.documented + 0.1, 0.18, 0.4, i);
  });

  const trk = span(t, T.tracked, T.tracked + 0.5);
  ticket.rows.status.style.opacity = trk;
  ticket.rows.due.style.opacity = span(t, T.tracked + 0.25, T.tracked + 0.75);

  /* --- the requester gets an ordinary email back -------------------- */
  const rp = span(t, T.reply, T.reply + 0.7);
  reply.el.style.opacity = rp;
  reply.el.style.transform = `translateY(${lerp(26, 0, easeOut(rp))}px)`;

  /* --- the same state, labelled for each reader --------------------- */
  /* Up to here the agent card says "Open". On this beat both sides show
     the waiting state in their own words, and the link ties them. */
  const tw = span(t, T.twoWords, T.twoWords + 0.6);
  if (tw > 0.5) {
    ticket.rows.statusChip.textContent = 'Waiting for Customer Response';
    ticket.rows.statusChip.style.background = TONE.waiting.bg;
    ticket.rows.statusChip.style.color = TONE.waiting.fg;
  } else {
    ticket.rows.statusChip.textContent = 'Open';
    ticket.rows.statusChip.style.background = TONE.open.bg;
    ticket.rows.statusChip.style.color = TONE.open.fg;
  }
  reply.footer.style.opacity = String(span(t, T.reply + 0.4, T.reply + 1.0));

  const bump = pulse(span(t, T.twoWords + 0.1, T.twoWords + 0.7));
  ticket.rows.statusChip.style.transform = `scale(${1 + bump * 0.10})`;
  replyChip.style.transform = `scale(${1 + bump * 0.10})`;

  linkPath.setAttribute('stroke-opacity', String(tw * 0.85));
  linkNote.style.opacity = String(span(t, T.twoWords + 0.3, T.twoWords + 0.9));

  /* --- the line ------------------------------------------------------ */
  const ou = span(t, T.line, T.line + 0.7);
  onscreen.style.opacity = ou * (1 - span(t, T.portal, T.portal + 0.5));
  onscreen.style.transform = `translateY(${lerp(-16, 0, easeOut(ou))}px)`;

  /* --- transition: everything gives way to the portal --------------- */
  const pt = span(t, T.portal, T.portal + 1.4);
  const p = easeInOut(pt);
  portal.style.opacity = Math.min(1, pt * 1.5);
  portal.style.transform = `scale(${lerp(0.86, 1, easeBack(p))})`;

  [mail.el, reply.el, ticket.el].forEach(el => {
    el.style.filter = `blur(${lerp(0, 5, p)}px)`;
  });
  mail.el.style.opacity  = String(mi * (1 - p));
  reply.el.style.opacity = String(rp * (1 - p));
  ticket.el.style.opacity = String(bc * (1 - p));
  linkPath.setAttribute('stroke-opacity', String(tw * 0.85 * (1 - p)));
  linkNote.style.opacity = String(span(t, T.twoWords + 0.3, T.twoWords + 0.9) * (1 - p));
  labels.forEach((l, i) => {
    l.style.opacity = String(stagger(t, 0.55, 0.15, 0.5, i) * 0.9 * (1 - p));
  });

  cc.update(t, CUES);
  return null;
}

export { CUES };
