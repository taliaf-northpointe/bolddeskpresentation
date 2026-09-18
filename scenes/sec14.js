/* ===================================================================
   sec14 — "Closing"                                           final 29.4s
   Script card: "CLOSING — Nora on screen".

   Based on the close of the first draft's scene 12. Nora centred and
   large, talking. The four punch lines land as four chips beside her,
   one per line; on "a better experience..." they settle into a row
   across the top and a wider fifth line joins them. On "I'm Nora."
   everything but Nora recedes; after her last word the end card comes
   up and holds.

   The lockup is NOT committed to this repo. Drop
   assets/logo-primary-navy.png in and it is used automatically;
   without it the card falls back to a set wordmark.

   Every time below is read off data/cues-sec14.json and
   data/words-sec14.json and hard-coded here so the beats are visible in
   one place. Change the audio, re-read the files.
=================================================================== */

import { makeNora } from '../lib/engine.js';
import {
  paper, loadCues, captions, edges,
  node, span, lerp, easeOut, easeInOut, easeBack, NAVY, BLUE,
} from '../lib/section.js';

export const id = 'sec14';
export const title = 'Closing';
export const dur = 29.4;
export const visemes = 'data/visemes-sec14.json';

const CUES = loadCues('data/cues-sec14.json');

/* ---------- beats, from the cue / word files ----------------------- */
const T = {
  noraIn:   0.20,
  row:     14.83,   // cue "And a better experience for the people asking for help, ..."
  fifth:   15.52,   // word "experience" (first time)
  signoff: 23.40,   // just ahead of cue "I'm Nora." (23.65)
  endcard: 28.43,   // cue end of "And I'll see you at the help desk!" — her last word
};

/* The four punch lines: each chip lands exactly at its cue start. */
const PUNCH = [
  { t:  7.56, text: 'Better tracking' },
  { t:  9.22, text: 'Better communication' },
  { t: 11.21, text: 'More visibility' },
  { t: 13.02, text: 'More automation' },
];

/* Blinks in the silences between phrases. */
const BLINKS = [
  4.05,    // "...across Northpointe," (3.93) -> "but" (4.32)
  7.10,    // "...pretty exciting." (6.71) -> 7.56
  8.90,    // "Better tracking." (8.62) -> 9.22
  12.70,   // "More visibility." (12.42) -> 13.02
  14.50,   // "More automation." (14.23) -> 14.83
  18.05,   // "...asking for help," (17.93) -> "which" (18.27)
  23.00,   // "...here to serve." (22.45) -> 23.65
  24.85,   // "I'm Nora." (24.50) -> 25.20
  26.50,   // "Thanks for listening." (26.25) -> 26.75
];

/* ---------- geometry ------------------------------------------------ */
const CHIP_W = 330, CHIP_H = 74;
/* scattered: two either side of her, at head/shoulder height */
const SCATTER = [
  { x: 190,  y: 330 }, { x: 1400, y: 330 },
  { x: 190,  y: 470 }, { x: 1400, y: 470 },
];
/* the row across the top */
const ROW_GAP = 22;
const ROW_X0 = 960 - (4 * CHIP_W + 3 * ROW_GAP) / 2;
const ROW = PUNCH.map((_, i) => ({ x: ROW_X0 + i * (CHIP_W + ROW_GAP), y: 112 }));

let root, nora, halo, chips = [], fifth, endcard, cc;

export function build(container) {
  root = container;
  paper(root);

  halo = node('div', { style: {
    position: 'absolute', left: '0px', top: '0px', width: '820px', height: '820px',
    borderRadius: '50%', opacity: 0,
    background: 'radial-gradient(circle at 42% 38%, rgba(0,134,177,.22), rgba(0,134,177,.05) 58%, transparent 72%)',
  }}, root);

  nora = makeNora({ parent: root, left: 0, top: 0, origin: '0% 0%' });

  /* --- the four chips ------------------------------------------------ */
  PUNCH.forEach(p => {
    const el = node('div', { text: p.text, style: {
      position: 'absolute', left: '0px', top: '0px',
      width: CHIP_W + 'px', height: CHIP_H + 'px', lineHeight: (CHIP_H - 2) + 'px',
      textAlign: 'center', whiteSpace: 'nowrap',
      background: '#fff', borderRadius: '16px', borderLeft: `8px solid ${BLUE}`,
      boxShadow: '0 16px 40px rgba(14,46,60,.14)',
      fontSize: '28px', fontWeight: 700, color: NAVY,
      opacity: 0, transformOrigin: '50% 50%',
    }}, root);
    chips.push(el);
  });

  /* --- the fifth, wider line ---------------------------------------- */
  fifth = node('div', { text: 'A better experience for the people we serve', style: {
    position: 'absolute', left: (960 - 520) + 'px', top: '214px', width: '1040px',
    padding: '20px 0', textAlign: 'center',
    background: NAVY, color: '#fff', borderRadius: '16px',
    boxShadow: '0 18px 44px rgba(14,46,60,.20)',
    fontSize: '36px', fontWeight: 700, whiteSpace: 'nowrap',
    opacity: 0, transformOrigin: '50% 50%',
  }}, root);

  /* --- end card ------------------------------------------------------ */
  endcard = node('div', { style: {
    position: 'absolute', inset: 0, opacity: 0, zIndex: 4,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '36px',
    background: 'linear-gradient(168deg, #FBFDFE 0%, #E4EEF3 100%)',
  }}, root);
  node('div', { text: 'Nora Presents BoldDesk', style: {
    fontSize: '84px', fontWeight: 700, color: NAVY, textAlign: 'center', lineHeight: 1.1,
  }}, endcard);
  node('div', { style: {
    width: '220px', height: '8px', background: BLUE, borderRadius: '4px',
  }}, endcard);

  /* The real lockup if it is present locally; a set wordmark if not.
     Brand assets are deliberately absent from this repo. */
  const holder = node('div', { style: {
    marginTop: '10px', height: '86px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}, endcard);
  const lockupText = node('div', { text: 'Northpointe Bank', style: {
    fontSize: '44px', fontWeight: 700, color: NAVY, letterSpacing: '.01em',
  }}, holder);
  const lockupImg = node('img', { style: { height: '86px', display: 'none' }}, holder);
  /* Requesting a file that is not there logs a 404 in the console, which
     the QA harness treats as an error. The project's own servers
     (scripts/render.py, qa_frames.py, python -m http.server) list a
     directory on GET, so ask assets/ first and only fetch the lockup if
     it is listed. Under a server with no listing this degrades to the
     plain "try it and see" the first draft used. Registered in
     window.__pending so the decision is made before the first frame. */
  const LOGO = 'assets/logo-primary-navy.png';
  const probe = fetch('assets/', { cache: 'no-store' })
    .then(r => (r.ok ? r.text() : ''))
    .catch(() => '')
    .then(html => new Promise(done => {
      const isListing = /<a\s/i.test(html);
      if (isListing && !html.includes('logo-primary-navy.png')) return done();
      lockupImg.onload = () => {
        lockupImg.style.display = 'block';
        lockupText.style.display = 'none';
        done();
      };
      lockupImg.onerror = () => done();
      lockupImg.src = LOGO;
    }));
  (window.__pending = window.__pending || []).push(probe);

  cc = captions(root);
  return { cc };
}

export function render(t, track) {
  edges(root, t, dur, { outDur: 0.4 });

  /* --- Nora: centre-large, down a touch for the row, back for sign-off */
  const inn  = easeOut(span(t, T.noraIn, T.noraIn + 1.1));
  const down = easeInOut(span(t, T.row, T.row + 1.0));
  const back = easeInOut(span(t, T.signoff, T.signoff + 1.2));

  const scale = lerp(lerp(0.84, 0.76, down), 0.88, back) * lerp(0.985, 1, inn);
  const left  = 960 - 819 * scale / 2;                    // keep her centred
  const top   = lerp(lerp(150, 322, down), 110, back);
  nora.place({ left, top, scale, y: lerp(24, 0, inn), opacity: inn });
  nora.update(t, track, BLINKS);

  const hw = 820 * lerp(lerp(1, 0.9, down), 1.06, back);
  halo.style.width = hw + 'px';
  halo.style.height = hw + 'px';
  halo.style.left = (960 - hw / 2) + 'px';
  halo.style.top  = (top + 300 * scale - hw / 2 + 180) + 'px';
  halo.style.opacity = String(inn);

  /* --- the four chips: land one per line, then settle into a row ------ */
  const gone = span(t, T.signoff, T.signoff + 0.6);
  chips.forEach((el, i) => {
    const u = span(t, PUNCH[i].t, PUNCH[i].t + 0.5);
    const m = easeInOut(span(t, T.row + i * 0.06, T.row + i * 0.06 + 0.9));
    const x = lerp(SCATTER[i].x, ROW[i].x, m);
    const y = lerp(SCATTER[i].y, ROW[i].y, m);
    el.style.left = x.toFixed(1) + 'px';
    el.style.top  = y.toFixed(1) + 'px';
    el.style.opacity = String(u * (1 - gone));
    el.style.transform =
      `translateY(${lerp(-26, 0, easeOut(u))}px) scale(${lerp(0.86, 1, easeBack(u))})`;
  });

  const f = span(t, T.fifth, T.fifth + 0.6);
  fifth.style.opacity = String(f * (1 - gone));
  fifth.style.transform =
    `translateY(${lerp(-18, 0, easeOut(f))}px) scale(${lerp(0.94, 1, easeBack(f))})`;

  /* --- the end card, after her last word, held to the end ------------ */
  endcard.style.opacity = String(span(t, T.endcard, T.endcard + 0.5));

  cc.update(t, CUES);
  return nora.lastShape;
}

export { CUES };
