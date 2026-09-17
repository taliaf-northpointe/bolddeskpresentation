/* ===================================================================
   SCENE 4 — "The idea"                                  1:16 – 1:43

   The turn. Three scenes of problem, and this is where the film stops
   describing what is wrong and says what to do about it.

   Nora is back on camera for the first two sentences, then slides left
   and stays as a small presenter while the ticket takes the frame. She
   keeps narrating, so her viseme track runs the whole scene — she does
   not stop being in the film just because she stops being the subject.

   Framing, per the storyboard's guardrails: BoldDesk is being trialed,
   not decided. The narration says so in the second sentence rather than
   implying a finished choice.
=================================================================== */

import {
  node, svgNode, makeNora, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeIn, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';

export const id = 'scene04';
export const title = 'The idea';
export const dur = 27.0;
export const visemes = 'data/visemes-scene04.json';

const CUES = [
  [0.30,  3.00, "That is where BoldDesk comes in."],
  [3.20,  7.80, "We've been trialing it, and what we're seeing is worth sharing."],
  [8.20, 18.20, "The idea is an enterprise support experience where requests are easy to submit, easy to track, easy to hand off, and easy to measure."],
  [18.60,21.20, "This is not about adding another tool."],
  [21.40,25.80, "It's about improving what happens behind the scenes."],
];

const BLINKS = [2.25, 5.60, 9.40, 14.80, 20.30, 24.60];

/* The four verbs, landing on the words. The long sentence runs 8.2 to
   18.2, and "easy to submit / track / hand off / measure" falls roughly
   on these marks. */
const VERBS = [
  { t: 12.30, label: 'Submit',   x:  944, y: 178, glyph: 'submit' },
  { t: 13.75, label: 'Track',    x: 1508, y: 178, glyph: 'track' },
  { t: 15.25, label: 'Hand off', x:  944, y: 700, glyph: 'handoff' },
  { t: 16.85, label: 'Measure',  x: 1508, y: 700, glyph: 'measure' },
];

/* Ticket sits at the centre of the four. */
const TK = { x: 1094, y: 404, w: 400, h: 214 };

const T = {
  noraIn:    0.25,
  noraMove:  8.00,
  ticketIn:  9.10,
  headline: 17.40,
  notATool: 18.60,
  slide:    25.40,      // transition into Scene 5's two-sided view
};

let root, nora, cc, ticket, verbs = [], links = [], headline, emailGhost,
    notTool;

/* ---------- glyphs ------------------------------------------------- */
/* Four small line drawings. Deliberately plain: they label a verb, they
   are not trying to be illustrations. */
function glyph(kind, parent) {
  const svg = svgNode('svg', { viewBox: '0 0 48 48', width: 52, height: 52 }, parent);
  const st = { fill: 'none', stroke: BLUE, 'stroke-width': 3.2,
               'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  if (kind === 'submit') {
    svgNode('path', { ...st, d: 'M24 30V8' }, svg);
    svgNode('path', { ...st, d: 'M15 17l9-9 9 9' }, svg);
    svgNode('path', { ...st, d: 'M9 30v8a2 2 0 0 0 2 2h26a2 2 0 0 0 2-2v-8' }, svg);
  } else if (kind === 'track') {
    svgNode('circle', { ...st, cx: 24, cy: 24, r: 15 }, svg);
    svgNode('path', { ...st, d: 'M24 14v10l7 5' }, svg);
  } else if (kind === 'handoff') {
    svgNode('path', { ...st, d: 'M8 18h24' }, svg);
    svgNode('path', { ...st, d: 'M25 11l7 7-7 7' }, svg);
    svgNode('path', { ...st, d: 'M40 30H16' }, svg);
    svgNode('path', { ...st, d: 'M23 37l-7-7 7-7' }, svg);
  } else {
    svgNode('path', { ...st, d: 'M9 39V27' }, svg);
    svgNode('path', { ...st, d: 'M20 39V15' }, svg);
    svgNode('path', { ...st, d: 'M31 39V21' }, svg);
    svgNode('path', { ...st, d: 'M42 39V9' }, svg);
  }
  return svg;
}

/* ---------- build -------------------------------------------------- */
export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background:
      'radial-gradient(1100px 820px at 72% 42%, rgba(0,134,177,.10), transparent 64%),' +
      'linear-gradient(168deg, #FBFDFE 0%, #E7F0F5 100%)',
  }}, root);

  /* soft disc that travels with her, so she reads against the light bg */
  const halo = node('div', { style: {
    position: 'absolute', left: '0px', top: '0px', width: '740px', height: '740px',
    borderRadius: '50%', opacity: 0,
    background: 'radial-gradient(circle at 42% 38%, rgba(0,134,177,.20), rgba(0,134,177,.04) 58%, transparent 72%)',
  }}, root);

  nora = makeNora({ parent: root, left: 0, top: 0, origin: '0% 0%' });
  nora.halo = halo;

  /* --- connector lines, drawn before the cards so they sit behind --- */
  const svg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, root);
  Object.assign(svg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });
  const cx = TK.x + TK.w / 2, cy = TK.y + TK.h / 2;
  VERBS.forEach(v => {
    const ln = svgNode('line', {
      x1: cx, y1: cy, x2: v.x + 72, y2: v.y + 72,
      stroke: 'rgba(0,134,177,.34)', 'stroke-width': 2.5,
      'stroke-dasharray': '7 9', 'stroke-opacity': 0,
    }, svg);
    links.push(ln);
  });

  /* --- the ticket -------------------------------------------------- */
  ticket = node('div', { style: {
    position: 'absolute', left: TK.x + 'px', top: TK.y + 'px',
    width: TK.w + 'px', minHeight: TK.h + 'px',
    background: '#fff', borderRadius: '20px', borderLeft: '10px solid ' + BLUE,
    boxShadow: '0 28px 66px rgba(14,46,60,.22)', opacity: 0,
    padding: '28px 32px', transformOrigin: '50% 50%',
  }}, root);
  node('div', { text: 'ONE REQUEST', style: {
    fontSize: '17px', letterSpacing: '.18em', color: BLUE,
    fontWeight: 700, marginBottom: '14px',
  }}, ticket);
  node('div', { text: 'Access to a system', style: {
    fontSize: '33px', fontWeight: 700, color: NAVY, marginBottom: '18px',
  }}, ticket);
  /* two property rows, using the platform's own vocabulary */
  const rows = [['Status', 'Open'], ['Owner', 'Assigned']];
  rows.forEach(([k, val]) => {
    const r = node('div', { style: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderTop: '1px solid rgba(22,67,86,.10)',
    }}, ticket);
    node('div', { text: k, style: { fontSize: '21px', color: 'rgba(14,46,60,.55)' }}, r);
    node('div', { text: val, style: { fontSize: '21px', fontWeight: 700, color: NAVY }}, r);
  });

  /* --- the four verbs ---------------------------------------------- */
  VERBS.forEach(v => {
    const g = node('div', { style: {
      position: 'absolute', left: v.x + 'px', top: v.y + 'px',
      width: '144px', opacity: 0, textAlign: 'center',
      transformOrigin: '50% 50%',
    }}, root);
    const tile = node('div', { style: {
      width: '144px', height: '144px', background: '#fff', borderRadius: '24px',
      boxShadow: '0 16px 38px rgba(14,46,60,.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}, g);
    glyph(v.glyph, tile);
    node('div', { text: v.label, style: {
      marginTop: '16px', fontSize: '27px', fontWeight: 700, color: NAVY,
    }}, g);
    verbs.push(g);
  });

  /* --- headline, at the top so it never fights the caption band ---- */
  headline = node('div', { style: {
    position: 'absolute', left: '830px', width: '900px', top: '96px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'Easy to submit. Track. Hand off. Measure.', style: {
    fontSize: '42px', fontWeight: 700, color: NAVY,
  }}, headline);

  /* --- "not another tool" ------------------------------------------ */
  /* The claim in the narration is that this is about what happens behind
     the scenes. A small strikethrough on the word "tool" says it faster
     than any illustration would. */
  notTool = node('div', { style: {
    position: 'absolute', left: '830px', width: '900px', top: '104px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { html: 'Not another tool — a better <b>behind the scenes</b>', style: {
    fontSize: '32px', fontWeight: 500, color: 'rgba(14,46,60,.72)',
  }}, notTool);

  /* --- transition hint: requester side keeps its email -------------- */
  emailGhost = node('div', { style: {
    position: 'absolute', left: '960px', top: '470px', width: '300px',
    padding: '20px 24px', background: '#fff', borderRadius: '14px',
    borderLeft: '6px solid rgba(22,67,86,.45)',
    boxShadow: '0 12px 30px rgba(14,46,60,.16)', opacity: 0,
  }}, root);
  node('div', { text: 'Their email', style: {
    fontSize: '16px', letterSpacing: '.16em', color: 'rgba(14,46,60,.45)',
    fontWeight: 700, marginBottom: '8px',
  }}, emailGhost);
  node('div', { text: 'Exactly as before', style: {
    fontSize: '25px', fontWeight: 700, color: NAVY,
  }}, emailGhost);

  cc = makeCaptions(root);
  return { cc };
}

/* ---------- render -------------------------------------------------- */
export function render(t, track) {
  root.style.transform = `scale(${lerp(1.0, 1.03, easeInOut(span(t, 0, dur)))})`;
  root.style.opacity = Math.min(span(t, 0, 0.45), 1 - span(t, 26.5, dur));

  /* --- Nora: centre for two sentences, then aside but still present -- */
  const inn = easeOut(span(t, T.noraIn, T.noraIn + 1.0));
  const mv  = easeInOut(span(t, T.noraMove, T.noraMove + 1.2));
  /* centre-frame while she is the subject, then a presenter in the corner */
  const left  = lerp(548, 44, mv);
  const top   = lerp(118, 402, mv);
  const scale = lerp(0.80, 0.60, mv) * lerp(0.985, 1, inn);
  nora.place({ left, top, scale, y: lerp(24, 0, inn), opacity: inn });
  nora.update(t, track, BLINKS);

  /* halo follows her, centred on her head rather than parked in the corner */
  const hw = 740 * lerp(1, 0.74, mv);
  nora.halo.style.width = hw + 'px';
  nora.halo.style.height = hw + 'px';
  nora.halo.style.left = (left + 819 * scale / 2 - hw / 2) + 'px';
  nora.halo.style.top  = (top + 300 * scale - hw / 2 + 180) + 'px';
  nora.halo.style.opacity = inn * lerp(0.95, 0.5, mv);

  /* --- the ticket rises ------------------------------------------- */
  const tk = span(t, T.ticketIn, T.ticketIn + 0.8);
  ticket.style.opacity = tk;
  ticket.style.transform =
    `translateY(${lerp(34, 0, easeOut(tk))}px) scale(${lerp(0.9, 1, easeBack(tk))})`;

  /* --- four verbs, on the words ----------------------------------- */
  VERBS.forEach((v, i) => {
    const u = span(t, v.t, v.t + 0.5);
    verbs[i].style.opacity = u;
    verbs[i].style.transform = `scale(${lerp(0.72, 1, easeBack(u))})`;
    /* the connector draws itself a beat after its tile lands */
    links[i].setAttribute('stroke-opacity', String(span(t, v.t + 0.18, v.t + 0.7) * 0.9));
  });

  /* A small pulse on the ticket as each verb connects, so the centre
     acknowledges what is being attached to it. */
  let bump = 0;
  VERBS.forEach(v => { bump = Math.max(bump, pulse(span(t, v.t + 0.2, v.t + 0.55))); });
  if (tk > 0) {
    ticket.style.transform =
      `translateY(${lerp(34, 0, easeOut(tk))}px) scale(${lerp(0.9, 1, easeBack(tk)) + bump * 0.022})`;
  }

  /* --- headline and the behind-the-scenes line -------------------- */
  const hl = span(t, T.headline, T.headline + 0.7);
  /* the headline hands over to the behind-the-scenes line in the same slot */
  headline.style.opacity = hl * (1 - span(t, T.notATool - 0.2, T.notATool + 0.5));
  headline.style.transform = `translateY(${lerp(-18, 0, easeOut(hl))}px)`;

  const nt = span(t, T.notATool, T.notATool + 0.7);
  notTool.style.opacity = nt * (1 - span(t, T.slide, T.slide + 0.6));
  notTool.style.transform = `translateY(${lerp(16, 0, easeOut(nt))}px)`;

  /* --- transition: the ticket moves to the team's side ------------- */
  /* Storyboard: the ticket slides to the support side while the original
     email stays with the requester. That is Scene 5's whole argument, so
     this scene ends by setting the shape of it up. */
  const sl = span(t, T.slide, T.slide + 1.2);
  const slide = easeInOut(sl);
  ticket.style.left = lerp(TK.x, TK.x + 296, slide) + 'px';
  verbs.forEach((g, i) => { g.style.opacity = String(span(t, VERBS[i].t, VERBS[i].t + 0.5) * (1 - sl)); });
  links.forEach(ln => ln.setAttribute('stroke-opacity',
    String(parseFloat(ln.getAttribute('stroke-opacity')) * (1 - sl))));
  emailGhost.style.opacity = slide;
  emailGhost.style.transform = `translateX(${lerp(40, 0, slide)}px)`;

  cc.update(t, CUES);
  return nora.lastShape;
}

export { CUES };
