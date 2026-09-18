/* ===================================================================
   sec01 — "Open"                                              0:00 – 0:37
   Script card: "OPEN — Nora on screen" (no title card).

   Nora waist-up, left of centre, alone for the greeting. When the idea
   comes up a small label appears to her right; when she names it, the
   label gives way to a speech bubble that stays for the rest of the
   section and grows a second line when BoldDesk is named.

   Every time below is read off data/cues-sec01.json and
   data/words-sec01.json (Ava's actual read) and hard-coded here so the
   beats are visible in one place. Change the audio, re-read the files.
=================================================================== */

import { makeNora } from '../lib/engine.js';
import {
  paper, loadCues, captions, edges,
  node, span, lerp, easeOut, easeInOut, easeBack, NAVY, BLUE,
} from '../lib/section.js';

export const id = 'sec01';
export const title = 'Open';
export const dur = 37.0;
export const visemes = 'data/visemes-sec01.json';

const CUES = loadCues('data/cues-sec01.json');

/* ---------- beats, from the cue / word files ----------------------- */
const T = {
  idea:     11.04,   // word "idea" in "Talia and I have been working on an idea"
  bubble:   15.40,   // cue "The idea is an enterprise support platform. ..."
  trial:    29.22,   // cue "Right now, we're trialing an application called BoldDesk, ..."
  bolddesk: 31.84,   // word "BoldDesk"
};

/* Blinks sit in the silences between phrases (cue end -> next cue start),
   plus one at the breath before "communicate" (22.08 -> 22.47). */
const BLINKS = [
  1.98,    // "Hi, I'm Nora." (ends 1.81) -> 2.19
  5.22,    // "...help desk assistant." (5.06) -> 5.44
  8.55,    // "...nice to meet you!" (8.20) -> 9.00
  14.95,   // "...across Northpointe." (14.60) -> 15.40
  22.20,   // "manage requests," -> "communicate"
  28.75,   // "...for our customers." (28.42) -> 29.22
  32.65,   // "BoldDesk," (ends 32.49) -> "and" (32.87)
  36.35,   // after the last word
];

let root, nora, label, bubble, second, secondName, cc;

export function build(container) {
  root = container;
  paper(root);

  /* Soft disc so she reads against a light background, plus a contact
     shadow so she isn't floating — same staging as the first draft. */
  node('div', { style: {
    position: 'absolute', left: '132px', top: '128px', width: '820px', height: '820px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 42% 38%, rgba(0,134,177,.22), rgba(0,134,177,.05) 58%, transparent 72%)',
  }}, root);
  node('div', { style: {
    position: 'absolute', left: '268px', top: '946px', width: '560px', height: '78px',
    borderRadius: '50%', filter: 'blur(6px)',
    background: 'radial-gradient(ellipse at 50% 50%, rgba(14,46,60,.30), transparent 70%)',
  }}, root);

  nora = makeNora({ parent: root, left: 240, top: 150 });

  /* --- small label: "An idea" ---------------------------------------- */
  label = node('div', { text: 'An idea', style: {
    position: 'absolute', left: '1120px', top: '420px',
    padding: '14px 30px', borderRadius: '999px',
    background: 'rgba(0,134,177,.12)', color: BLUE,
    fontSize: '32px', fontWeight: 700, letterSpacing: '.02em', whiteSpace: 'nowrap',
    opacity: 0, transformOrigin: '0% 50%',
  }}, root);

  /* --- speech bubble: "The idea / An enterprise support platform" ----- */
  bubble = node('div', { style: {
    position: 'absolute', left: '1090px', top: '300px', width: '720px',
    padding: '50px 56px 46px', background: '#fff', borderRadius: '26px',
    borderLeft: `10px solid ${BLUE}`,
    boxShadow: '0 26px 60px rgba(14,46,60,.18), 0 3px 10px rgba(14,46,60,.10)',
    transformOrigin: '8% 40%', opacity: 0,
  }}, root);
  node('div', { text: 'THE IDEA', style: {
    fontSize: '21px', letterSpacing: '.16em', color: BLUE,
    fontWeight: 700, marginBottom: '16px',
  }}, bubble);
  node('div', { html: 'An enterprise support&nbsp;platform', style: {
    fontSize: '58px', lineHeight: 1.14, fontWeight: 700, color: NAVY,
  }}, bubble);
  /* tail pointing back toward her */
  node('div', { style: {
    position: 'absolute', left: '-28px', top: '96px',
    border: '19px solid transparent', borderRightColor: BLUE,
  }}, bubble);

  /* second line, under a rule: [BoldDesk] [Now in trial] */
  second = node('div', { style: {
    marginTop: '30px', paddingTop: '26px', borderTop: '1px solid rgba(22,67,86,.12)',
    display: 'flex', alignItems: 'center', opacity: 0,
  }}, bubble);
  secondName = node('div', { text: 'BoldDesk', style: {
    fontSize: '44px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
    overflow: 'hidden', width: '0px', marginRight: '0px', flex: '0 0 auto',
  }}, second);
  node('div', { text: 'Now in trial', style: {
    padding: '9px 22px', borderRadius: '999px',
    background: 'rgba(0,134,177,.12)', color: BLUE,
    fontSize: '24px', fontWeight: 700, whiteSpace: 'nowrap',
  }}, second);

  cc = captions(root);
  return { cc };
}

export function render(t, track) {
  edges(root, t, dur);
  /* Slow push-in across the whole section. 1.0 -> 1.05 is deliberately
     small: enough to feel alive, not enough to read as a zoom. */
  root.style.transform = `scale(${lerp(1.0, 1.05, easeInOut(span(t, 0, dur)))})`;

  /* --- Nora enters over the first second ---------------------------- */
  const entry = easeOut(span(t, 0.15, 1.25));
  nora.place({ y: lerp(26, 0, entry), scale: lerp(0.985, 1, entry), opacity: entry });
  nora.update(t, track, BLINKS);

  /* --- "An idea" label: in on the word, out as the bubble forms ------- */
  const li = span(t, T.idea, T.idea + 0.5);
  const lo = span(t, T.bubble, T.bubble + 0.35);
  label.style.opacity = String(li * (1 - lo));
  label.style.transform =
    `translateX(${lerp(-18, 0, easeOut(li))}px) scale(${lerp(0.9, 1, easeBack(li))})`;

  /* --- the bubble forms beside her and stays -------------------------- */
  const bu = span(t, T.bubble, T.bubble + 0.6);
  bubble.style.opacity = bu;
  bubble.style.transform =
    `translateX(${lerp(-34, 0, easeOut(bu))}px) scale(${lerp(0.9, 1, easeBack(bu))})`;

  /* --- second line: pill on "Right now, we're trialing", name on "BoldDesk" */
  const s2 = easeOut(span(t, T.trial, T.trial + 0.5));
  second.style.opacity = s2;
  second.style.transform = `translateY(${lerp(14, 0, s2)}px)`;
  const nm = easeInOut(span(t, T.bolddesk, T.bolddesk + 0.55));
  secondName.style.width = (nm * 212).toFixed(1) + 'px';
  secondName.style.marginRight = (nm * 20).toFixed(1) + 'px';
  secondName.style.opacity = String(Math.min(1, nm * 1.6));

  cc.update(t, CUES);
  return nora.lastShape;
}

export { CUES };
