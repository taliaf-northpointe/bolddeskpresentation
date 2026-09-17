/* ===================================================================
   SCENE 1 — "A human question"                          0:00 – 0:20

   Nora on camera for the whole scene. The only shot in the film that is
   purely a talking head, which is why it was built first: it proves the
   lip-sync pipeline before anything is built on top of it.
=================================================================== */

import {
  node, makeNora, makeCaptions,
  span, lerp, easeOut, easeInOut, easeBack, clamp,
  NAVY, BLUE,
} from '../lib/engine.js';

export const id = 'scene01';
export const title = 'A human question';
export const dur = 20.0;
export const visemes = 'data/visemes-scene01.json';

const CUES = [
  [0.60,  2.00, "Hi, I'm Nora."],
  [2.00,  6.20, "You might know me as your friendly help desk assistant."],
  [6.40,  8.90, "Talia and I have been working on an idea"],
  [8.90, 12.50, "that starts with one simple question:"],
  [12.60,19.40, "How can we make it easier for people to get the help they need?"],
];

/* Placed in the gaps between phrases, not on a timer. */
const BLINKS = [1.85, 6.15, 10.4, 12.45, 16.9];

let nora, cc, bubble, inner;

export function build(root) {
  /* Clean, bright, Northpointe. Nothing gold or teal — that palette
     belongs to BoldDesk, not the bank. */
  node('div', { style: {
    position: 'absolute', inset: 0,
    background:
      'radial-gradient(1200px 900px at 18% 8%, rgba(0,134,177,.13), transparent 62%),' +
      'radial-gradient(900px 700px at 88% 78%, rgba(22,67,86,.10), transparent 60%),' +
      'linear-gradient(170deg, #FBFDFE 0%, #E7F0F5 100%)',
  }}, root);

  /* Soft disc so she reads against a light background */
  node('div', { style: {
    position: 'absolute', left: '132px', top: '128px', width: '820px', height: '820px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 42% 38%, rgba(0,134,177,.22), rgba(0,134,177,.05) 58%, transparent 72%)',
  }}, root);

  /* Contact shadow, so she isn't floating */
  node('div', { style: {
    position: 'absolute', left: '268px', top: '946px', width: '560px', height: '78px',
    borderRadius: '50%', filter: 'blur(6px)',
    background: 'radial-gradient(ellipse at 50% 50%, rgba(14,46,60,.30), transparent 70%)',
  }}, root);

  nora = makeNora({ parent: root, left: 240, top: 150 });

  bubble = node('div', { style: {
    position: 'absolute', left: '1090px', top: '336px', width: '700px',
    padding: '54px 58px', background: '#fff', borderRadius: '26px',
    borderLeft: `10px solid ${BLUE}`,
    boxShadow: '0 26px 60px rgba(14,46,60,.18), 0 3px 10px rgba(14,46,60,.10)',
    transformOrigin: '8% 50%', opacity: 0,
  }}, root);
  node('div', { text: 'THE QUESTION', style: {
    fontSize: '21px', letterSpacing: '.16em', color: BLUE,
    fontWeight: 700, marginBottom: '18px',
  }}, bubble);
  node('div', { html: 'How can we make it easier to&nbsp;get&nbsp;help?', style: {
    fontSize: '60px', lineHeight: 1.16, fontWeight: 700, color: NAVY,
  }}, bubble);
  /* tail pointing back toward her */
  const tail = node('div', { style: {
    position: 'absolute', left: '-28px', top: '96px',
    border: '19px solid transparent', borderRightColor: BLUE,
  }}, bubble);

  cc = makeCaptions(root);
  inner = root;
  return { cc };
}

export function render(t, track) {
  /* Slow push-in across the whole scene. 1.0 -> 1.055 is deliberately
     small: enough to feel alive, not enough to read as a zoom. */
  inner.style.transform = `scale(${lerp(1.0, 1.055, easeInOut(span(t, 0, dur)))})`;
  inner.style.opacity = Math.min(span(t, 0, 0.6), 1 - span(t, 19.4, dur));

  const entry = easeOut(span(t, 0.15, 1.25));
  nora.place({ y: lerp(26, 0, entry), scale: lerp(0.985, 1, entry), opacity: entry });
  nora.update(t, track, BLINKS);

  const bu = span(t, 12.55, 13.15);
  bubble.style.opacity = bu;
  bubble.style.transform =
    `translateX(${lerp(-34, 0, easeOut(bu))}px) scale(${lerp(0.9, 1, easeBack(bu))})`;

  cc.update(t, CUES);
  return nora.lastShape;
}

export { CUES };
