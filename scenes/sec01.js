/* ===================================================================
   sec01 — "Open"                                              0:00 – 0:53
   Script card: "OPEN — Nora on screen" (no title card).

   Nora waist-up, left of centre, alone for the greeting. When the
   platform comes up a small label appears to her right; when she names
   it, the label gives way to a speech bubble that stays for the rest of
   the section and grows a second line when BoldDesk is named. Then the
   bubble lifts to make room for a grid of teams: a handful light up as
   the ones already testing, and on "every team" the whole grid lights,
   with a "one-stop shop" chip landing on the words.

   Every time below is read off data/cues-sec01.json and
   data/words-sec01.json (Ava's actual read) and hard-coded here so the
   beats are visible in one place. Change the audio, re-read the files.
=================================================================== */

import { makeNora } from '../lib/engine.js';
import {
  paper, loadCues, captions, edges,
  node, span, lerp, easeOut, easeInOut, easeBack, pulse, stagger, NAVY, BLUE,
} from '../lib/section.js';

export const id = 'sec01';
export const title = 'Open';
export const dur = 52.9;
export const visemes = 'data/visemes-sec01.json';

const CUES = loadCues('data/cues-sec01.json');

/* ---------- beats, from the cue / word files ----------------------- */
const T = {
  platform: 11.86,   // word "platform" in "...working on building a great platform..."
  bubble:   16.04,   // cue "The platform is an Enterprise Support Portal. ..."
  trial:    29.62,   // cue "Right now, we're trialing an application called BoldDesk, ..."
  bolddesk: 32.24,   // word "BoldDesk"
  lift:     36.90,   // breath before "A handful of teams..." — bubble lifts, grid arrives
  handful:  37.24,   // cue "A handful of teams have already started testing it."
  testing:  39.41,   // word "testing" — the handful light up
  every:    43.54,   // word "every" in "...if every team was on it?" — all light up
  onestop:  48.80,   // word "one-stop" — the chip lands
};

/* Blinks sit in the silences between phrases (cue end -> next cue start). */
const BLINKS = [
  1.98,    // "Hi, I'm Nora." (ends 1.81) -> 2.19
  5.22,    // "...help desk assistant." (5.06) -> 5.44
  8.55,    // "...nice to meet you!" (8.20) -> 9.00
  15.60,   // "...across Northpointe." (15.24) -> 16.04
  22.80,   // breath inside the long line
  29.20,   // "...for our customers." (28.82) -> 29.62
  36.80,   // "...for Northpointe." (36.44) -> 37.24
  40.35,   // "...testing it." (40.05) -> 40.65
  44.95,   // "...was on it?" (44.65) -> 45.25
  52.10,   // after the last word
];

/* The grid: 4 x 3 generic team tiles. These four are "already testing". */
const COLS = 4, ROWS = 3, TILE_W = 150, TILE_H = 46, GAP = 14;
const TESTING = new Set([0, 5, 7, 10]);
const GRID_X = 1130, GRID_Y = 640;

let root, nora, label, bubble, second, secondName, grid, tiles = [], chip, cc;

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

  /* --- small label: "A platform" -------------------------------------- */
  label = node('div', { text: 'A platform', style: {
    position: 'absolute', left: '1120px', top: '420px',
    padding: '14px 30px', borderRadius: '999px',
    background: 'rgba(0,134,177,.12)', color: BLUE,
    fontSize: '32px', fontWeight: 700, letterSpacing: '.02em', whiteSpace: 'nowrap',
    opacity: 0, transformOrigin: '0% 50%',
  }}, root);

  /* --- speech bubble: "The platform / An Enterprise Support Portal" --- */
  bubble = node('div', { style: {
    position: 'absolute', left: '1090px', top: '300px', width: '720px',
    padding: '50px 56px 46px', background: '#fff', borderRadius: '26px',
    borderLeft: `10px solid ${BLUE}`,
    boxShadow: '0 26px 60px rgba(14,46,60,.18), 0 3px 10px rgba(14,46,60,.10)',
    transformOrigin: '8% 40%', opacity: 0,
  }}, root);
  node('div', { text: 'THE PLATFORM', style: {
    fontSize: '21px', letterSpacing: '.16em', color: BLUE,
    fontWeight: 700, marginBottom: '16px',
  }}, bubble);
  node('div', { html: 'An Enterprise Support&nbsp;Portal', style: {
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

  /* --- the teams grid ------------------------------------------------ */
  grid = node('div', { style: {
    position: 'absolute', left: GRID_X + 'px', top: GRID_Y + 'px',
    width: (COLS * TILE_W + (COLS - 1) * GAP) + 'px', opacity: 0,
  }}, root);
  node('div', { text: 'TEAMS ACROSS NORTHPOINTE', style: {
    fontSize: '18px', letterSpacing: '.18em', color: 'rgba(22,67,86,.50)',
    fontWeight: 700, marginBottom: '14px',
  }}, grid);
  const cells = node('div', { style: {
    display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${TILE_W}px)`, gap: GAP + 'px',
  }}, grid);
  for (let i = 0; i < COLS * ROWS; i++) {
    const tile = node('div', { style: {
      height: TILE_H + 'px', borderRadius: '10px', position: 'relative',
      background: 'rgba(22,67,86,.08)', border: '2px solid rgba(22,67,86,.10)',
      opacity: 0, transform: 'scale(.9)',
    }}, cells);
    /* a little "person" mark so it reads as a team, not a button */
    node('div', { style: {
      position: 'absolute', left: '16px', top: '13px', width: '20px', height: '20px',
      borderRadius: '50%', background: 'rgba(22,67,86,.22)',
    }}, tile);
    node('div', { style: {
      position: 'absolute', left: '46px', top: '19px', width: '70px', height: '8px',
      borderRadius: '4px', background: 'rgba(22,67,86,.16)',
    }}, tile);
    tiles.push(tile);
  }

  /* --- the chip: "One-stop shop for support" --------------------------- */
  chip = node('div', { text: 'One-stop shop for support', style: {
    /* above the grid (below the lifted bubble), clear of the caption band */
    position: 'absolute', left: GRID_X + 'px', top: (GRID_Y - 86) + 'px',
    padding: '12px 28px', borderRadius: '999px', background: BLUE, color: '#fff',
    fontSize: '28px', fontWeight: 700, whiteSpace: 'nowrap', opacity: 0,
    boxShadow: '0 12px 30px rgba(0,134,177,.30)', transformOrigin: '0% 50%',
  }}, root);

  cc = captions(root);
  return { cc };
}

function paintTile(tile, lit, glow) {
  tile.style.background = lit
    ? `rgba(0,134,177,${lerp(.14, .28, glow)})`
    : 'rgba(22,67,86,.08)';
  tile.style.borderColor = lit ? `rgba(0,134,177,${lerp(.45, .9, glow)})` : 'rgba(22,67,86,.10)';
  tile.children[0].style.background = lit ? BLUE : 'rgba(22,67,86,.22)';
  tile.children[1].style.background = lit ? 'rgba(0,134,177,.55)' : 'rgba(22,67,86,.16)';
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

  /* --- "A platform" label: in on the word, out as the bubble forms ---- */
  const li = span(t, T.platform, T.platform + 0.5);
  const lo = span(t, T.bubble, T.bubble + 0.35);
  label.style.opacity = String(li * (1 - lo));
  label.style.transform =
    `translateX(${lerp(-18, 0, easeOut(li))}px) scale(${lerp(0.9, 1, easeBack(li))})`;

  /* --- the bubble forms beside her and stays; lifts for the grid ------ */
  const bu = span(t, T.bubble, T.bubble + 0.6);
  const lift = easeInOut(span(t, T.lift, T.lift + 0.7));
  bubble.style.opacity = bu;
  bubble.style.transform =
    `translate(${lerp(-34, 0, easeOut(bu))}px, ${lerp(0, -130, lift)}px) scale(${lerp(0.9, 1, easeBack(bu))})`;

  /* --- second line: pill on "Right now, we're trialing", name on "BoldDesk" */
  const s2 = easeOut(span(t, T.trial, T.trial + 0.5));
  second.style.opacity = s2;
  second.style.transform = `translateY(${lerp(14, 0, s2)}px)`;
  const nm = easeInOut(span(t, T.bolddesk, T.bolddesk + 0.55));
  secondName.style.width = (nm * 212).toFixed(1) + 'px';
  secondName.style.marginRight = (nm * 20).toFixed(1) + 'px';
  secondName.style.opacity = String(Math.min(1, nm * 1.6));

  /* --- teams grid: tiles arrive on "A handful of teams" ---------------- */
  grid.style.opacity = String(span(t, T.handful, T.handful + 0.4));
  const allGlow = pulse(span(t, T.every, T.every + 1.2));
  tiles.forEach((tile, i) => {
    const a = easeBack(stagger(t, T.handful, 0.06, 0.45, i));
    tile.style.opacity = String(Math.min(1, a));
    tile.style.transform = `scale(${lerp(0.9, 1, Math.min(1, a))})`;
    const testLit = TESTING.has(i) ? easeOut(stagger(t, T.testing, 0.10, 0.4, [...TESTING].indexOf(i))) : 0;
    const everyLit = easeOut(stagger(t, T.every, 0.05, 0.4, i));
    const lit = Math.max(testLit, everyLit);
    paintTile(tile, lit > 0.01, Math.max(allGlow, testLit > 0 && everyLit === 0 ? 0.3 : 0));
    tile.style.opacity = String(Math.min(1, a) * (lit > 0.01 ? 1 : 0.75));
  });

  /* --- "One-stop shop for support" lands on the words ----------------- */
  const ch = span(t, T.onestop, T.onestop + 0.55);
  chip.style.opacity = String(ch);
  chip.style.transform = `translateY(${lerp(16, 0, easeOut(ch))}px) scale(${lerp(0.92, 1, easeBack(ch))})`;

  cc.update(t, CUES);
  return nora.lastShape;
}

export { CUES };
