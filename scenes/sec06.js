/* ===================================================================
   sec06 — "One place for everything"                          52.3s

   Adapted from scene06 (the portal shell, My Requests, the phone in
   hand with its submit + tick) and scene07 (two lanes racing: a short
   form against a string of emails and a clock).

   Three movements, all in one frame:
     1. The portal: two big tiles, then My requests opens with three
        generic requests and their statuses. One status pulses; an
        envelope appears and is struck through — no chaser email.
     2. The phone: the portal shrinks aside, a phone lands with two
        chips ("Mobile friendly", "No VPN needed"). On it: a bookmark
        star, a generic work-account sign-in, a short form, a tick. A
        flat figure walks beside it — someone not at a desk.
     3. The lanes: a form with three fields and a "+30 s" badge goes
        straight through to a green check while, below, five emails
        pile up under a clock with no numbers. The only metric shown is
        the thirty seconds the narration itself gives.

   Every number below is read from data/words-sec06.json /
   data/cues-sec06.json (where Ava actually says the phrase) and kept
   as a constant so a beat can be re-timed in one place.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, figure, edges,
  node, svgNode, span, lerp, clamp, easeOut, easeInOut, easeBack, NAVY, BLUE, INK, INK_SOFT,
} from '../lib/section.js';
import { stagger, pulse } from '../lib/engine.js';
import { chip, panelLabel } from '../lib/ui.js';

export const id = 'sec06';
export const title = 'One place for everything';
export const dur = 52.3;
export const visemes = null;

const CUES = loadCues('data/cues-sec06.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  cardOut:   3.00,   // title card (hold 2.4 + 0.6 out) has left the frame
  shellIn:   2.55,   // "There is also a portal." (0.9–2.2) -> shell rises under the card
  tileNew:   2.98,   // "The portal" (2.98)           -> New request tile
  tileMine:  3.45,   //                                -> My requests tile
  tileKb:    3.90,   //                                -> faint Knowledge base tile
  openNew:   5.53,   // "open new requests"           -> New request tile pulses
  seeMine:   7.04,   // "see the requests they already have open" -> My requests opens
  rows:      7.40,   //                                -> three rows stagger in
  teams:     9.22,   // "with teams using BoldDesk"   -> a team dot on each row
  stands:   12.05,   // "where something stands"      -> "In progress" chip pulses
  email:    13.60,   // "send another email"          -> an envelope appears
  strike:   14.30,   // "email"                       -> and is struck through
  emailOut: 15.45,   // "update"                      -> and fades: no email needed
  phone:    16.97,   // "the portal is mobile friendly" -> the phone lands
  mobile:   17.56,   // "mobile friendly"             -> chip
  vpn:      19.16,   // "doesn't require a VPN"       -> chip
  walker:   22.38,   // "people who aren't sitting at a desk" -> the figure walks
  bookmark: 27.86,   // "bookmark"                    -> the star fills
  signin:   30.02,   // "log in"                      -> sign-in screen
  typing:   30.67,   // "same account"                -> the password dots
  signinGo: 33.25,   // "Teams"                       -> Continue pressed
  form:     33.90,   // "and submit"                  -> the short form
  fields:   34.15,   //                                -> fields fill, .32 apart
  submit:   35.15,   // "request"                     -> Submit pressed
  sent:     35.65,   //                                -> the tick
  lanesIn:  39.30,   // "That may add"                -> portal + phone give way to the lanes
  formA:    39.60,   //                                -> the form in the upper lane
  fieldsA:  40.00,   //                                -> its three fields, .38 apart
  badge:    40.20,   // "30 seconds" (40.14)          -> "+30 s"
  fastGo:   42.26,   // "give us the information we need" -> the detailed request moves
  fastDone: 46.30,   // "save" (46.28)                -> and reaches the green check
  slowGo:   44.60,   // "But that small amount of effort" -> the vague one crawls
  notes:    44.60,   //                                -> five emails, .8 apart
  slowDone: 51.00,   // "the request worked"          -> the vague one finally lands
  line:     47.45,   // "much more time later"        -> on-screen line
};

const SH = { x: 420, y: 140, w: 1080, h: 740 };

const TILES = [
  { t: T.tileNew,  label: 'New request',    sub: 'Start something',        glyph: 'plus', faint: false },
  { t: T.tileMine, label: 'My requests',    sub: 'See what’s open',   glyph: 'list', faint: false },
  { t: T.tileKb,   label: 'Knowledge base', sub: 'Find an answer',         glyph: 'book', faint: true  },
];

/* Generic requests, generic statuses. */
const ROWS = [
  ['Access to a system', 'In progress',         'open'],
  ['Report question',    'Open',                'open'],
  ['Document needed',    'Awaiting your reply', 'waiting'],
];
const TEAM_DOTS = ['#0086B1', '#164356', '#5B7FA6'];

const FIELDS = ['Group', 'Application', 'Request type'];
const NOTE_N = 5;
const GREEN = '#2F9E63';

const TRACK = { x0: 780, x1: 1470 };
const LANE_A = 348;
const LANE_B = 738;

let root, card, cc, line,
    stageA, shell, tiles = [], myRows = [], teamDots = [], statusChip,
    envelope, envStrike, envNote,
    phone, scrHome, scrSign, scrForm, star, pwDots = [], signBtn,
    formVals = [], submitBtn, phoneCheck, chipMobile, chipVpn, walker,
    lanes, laneLabels = [], formA, fieldEls = [], badgeA, notes = [], clock,
    trA, trB, tickA, tickB;

/* ---------- glyphs ------------------------------------------------- */
function glyph(kind, parent, color, size = 46) {
  const svg = svgNode('svg', { viewBox: '0 0 48 48', width: size, height: size }, parent);
  const st = { fill: 'none', stroke: color, 'stroke-width': 3.2,
               'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  if (kind === 'plus') {
    svgNode('circle', { ...st, cx: 24, cy: 24, r: 16 }, svg);
    svgNode('path', { ...st, d: 'M24 16v16M16 24h16' }, svg);
  } else if (kind === 'list') {
    svgNode('path', { ...st, d: 'M10 15h28M10 24h28M10 33h18' }, svg);
  } else {
    svgNode('path', { ...st, d: 'M10 12h11a4 4 0 0 1 4 4v20a3 3 0 0 0-3-3H10z' }, svg);
    svgNode('path', { ...st, d: 'M38 12H27a4 4 0 0 0-4 4v20a3 3 0 0 1 3-3h12z' }, svg);
  }
  return svg;
}

function track(parent, y) {
  const el = node('div', { style: {
    position: 'absolute', left: TRACK.x0 + 'px', top: y + 'px',
    width: (TRACK.x1 - TRACK.x0) + 'px', height: '6px', borderRadius: '3px',
    background: 'rgba(22,67,86,.12)', opacity: 0,
  }}, parent);
  const fill = node('div', { style: {
    position: 'absolute', left: 0, top: 0, height: '6px', width: '0%',
    borderRadius: '3px', background: BLUE,
  }}, el);
  return { el, fill };
}

function tickMark(parent, x, y, color = BLUE) {
  const g = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    width: '96px', height: '96px', opacity: 0, transformOrigin: '50% 50%',
  }}, parent);
  const svg = svgNode('svg', { viewBox: '0 0 64 64', width: 96, height: 96 }, g);
  svgNode('circle', { cx: 32, cy: 32, r: 27, fill: color === BLUE ? 'rgba(0,134,177,.10)' : 'rgba(47,158,99,.12)',
    stroke: color, 'stroke-width': 4 }, svg);
  const p = svgNode('path', { d: 'M20 33l9 9 16-18', fill: 'none', stroke: color,
    'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'stroke-dasharray': 44, 'stroke-dashoffset': 44 }, svg);
  g.tick = p;
  return g;
}

/* a phone "screen": fills the glass, stacked so one fades into the next */
function screen(parent) {
  return node('div', { style: {
    position: 'absolute', inset: 0, background: '#F7FBFC', opacity: 0,
  }}, parent);
}

export function build(container) {
  root = container;
  paper(root);

  /* ============ movement 1 + 2: the portal and the phone ============ */
  stageA = node('div', { style: { position: 'absolute', inset: 0, opacity: 0 }}, root);

  /* --- portal shell -------------------------------------------------- */
  shell = node('div', { style: {
    position: 'absolute', left: SH.x + 'px', top: SH.y + 'px',
    width: SH.w + 'px', height: SH.h + 'px', background: '#F7FBFC',
    borderRadius: '22px', boxShadow: '0 32px 78px rgba(14,46,60,.20)',
    overflow: 'hidden', transformOrigin: '30% 40%',
  }}, stageA);

  const head = node('div', { style: {
    height: '150px', background: NAVY, padding: '30px 44px 0',
  }}, shell);
  node('div', { text: 'How can we help you?', style: {
    fontSize: '34px', fontWeight: 700, color: '#fff', marginBottom: '16px',
  }}, head);
  const search = node('div', { style: {
    height: '54px', background: '#fff', borderRadius: '10px',
    display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px',
  }}, head);
  const mag = svgNode('svg', { viewBox: '0 0 24 24', width: 22, height: 22 }, search);
  svgNode('circle', { cx: 10.5, cy: 10.5, r: 6.5, fill: 'none',
    stroke: 'rgba(22,67,86,.45)', 'stroke-width': 2.2 }, mag);
  svgNode('path', { d: 'M15.5 15.5L21 21', stroke: 'rgba(22,67,86,.45)',
    'stroke-width': 2.2, 'stroke-linecap': 'round' }, mag);
  node('div', { text: 'Search', style: { fontSize: '20px', color: 'rgba(22,67,86,.42)' }}, search);

  const body = node('div', { style: { padding: '34px 44px', position: 'relative' }}, shell);

  const row = node('div', { style: { display: 'flex', gap: '26px' }}, body);
  TILES.forEach(spec => {
    const tl = node('div', { style: {
      flex: '1 1 0', height: '150px', background: '#fff', borderRadius: '16px',
      boxShadow: '0 12px 30px rgba(14,46,60,.12)',
      padding: '22px 24px', opacity: 0, transformOrigin: '50% 50%',
    }}, row);
    glyph(spec.glyph, tl, BLUE);
    node('div', { text: spec.label, style: {
      marginTop: '10px', fontSize: '26px', fontWeight: 700, color: NAVY,
    }}, tl);
    node('div', { text: spec.sub, style: { fontSize: '19px', color: 'rgba(14,46,60,.52)' }}, tl);
    tiles.push(tl);
  });

  /* My requests: three generic rows with statuses */
  const mine = node('div', { style: { marginTop: '28px' }}, body);
  ROWS.forEach(([ttl, st, tone], i) => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#fff', borderRadius: '12px', borderLeft: '5px solid ' + BLUE,
      padding: '18px 24px', marginBottom: '14px', opacity: 0,
      boxShadow: '0 6px 18px rgba(14,46,60,.08)',
    }}, mine);
    const left = node('div', { style: { display: 'flex', alignItems: 'center', gap: '14px' }}, r);
    const dot = node('div', { style: {
      width: '16px', height: '16px', borderRadius: '50%', background: TEAM_DOTS[i], opacity: 0,
    }}, left);
    teamDots.push(dot);
    node('div', { text: ttl, style: { fontSize: '24px', fontWeight: 700, color: NAVY }}, left);
    const c = chip(r, st, tone, 19);
    c.style.transformOrigin = '50% 50%';
    if (i === 0) statusChip = c;
    myRows.push(r);
  });

  /* the chaser email nobody has to send: beside the first row */
  envelope = node('div', { style: {
    position: 'absolute', left: '1530px', top: '482px', width: '72px', height: '72px', opacity: 0,
    transformOrigin: '50% 50%',
  }}, stageA);
  const ev = svgNode('svg', { viewBox: '0 0 64 64', width: 72, height: 72 }, envelope);
  svgNode('rect', { x: 6, y: 14, width: 52, height: 36, rx: 6, fill: '#fff',
    stroke: NAVY, 'stroke-width': 3.2 }, ev);
  svgNode('path', { d: 'M8 18 L32 38 L56 18', fill: 'none', stroke: NAVY,
    'stroke-width': 3.2, 'stroke-linejoin': 'round' }, ev);
  envStrike = svgNode('line', { x1: 8, y1: 56, x2: 56, y2: 8, stroke: NAVY,
    'stroke-width': 5, 'stroke-linecap': 'round',
    'stroke-dasharray': 68, 'stroke-dashoffset': 68 }, ev);
  envNote = node('div', { text: 'No email needed', style: {
    position: 'absolute', left: '1470px', top: '560px', width: '200px', textAlign: 'center',
    fontSize: '20px', fontWeight: 700, color: INK_SOFT, opacity: 0, whiteSpace: 'nowrap',
  }}, stageA);

  /* --- the two chips beside the phone -------------------------------- */
  chipMobile = chip(stageA, 'Mobile friendly', 'open', 21);
  chipVpn    = chip(stageA, 'No VPN needed',   'open', 21);
  [chipMobile, chipVpn].forEach((c, i) => Object.assign(c.style, {
    position: 'absolute', left: '1100px', top: (330 + i * 72) + 'px', opacity: 0,
    background: '#fff', boxShadow: '0 10px 26px rgba(14,46,60,.12)',
    border: '2px solid rgba(0,134,177,.30)',
  }));

  /* --- the phone ----------------------------------------------------- */
  phone = node('div', { style: {
    position: 'absolute', left: '1340px', top: '200px',
    width: '330px', height: '640px', background: '#16232B',
    borderRadius: '38px', padding: '14px', opacity: 0,
    boxShadow: '0 34px 74px rgba(14,46,60,.34)', transformOrigin: '50% 90%',
  }}, stageA);
  const glass = node('div', { style: {
    position: 'relative', width: '100%', height: '100%', background: '#F7FBFC',
    borderRadius: '26px', overflow: 'hidden',
  }}, phone);

  /* screen 1: the portal on a phone, with a bookmark star */
  scrHome = screen(glass);
  const hh = node('div', { style: {
    height: '84px', background: NAVY, padding: '24px 22px 0',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  }}, scrHome);
  node('div', { text: 'Portal', style: { fontSize: '25px', fontWeight: 700, color: '#fff' }}, hh);
  star = svgNode('svg', { viewBox: '0 0 24 24', width: 34, height: 34 }, hh);
  star.style.transformOrigin = '50% 50%';
  star.path = svgNode('path', {
    d: 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z',
    fill: 'rgba(255,255,255,0)', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linejoin': 'round',
  }, star);
  const hb = node('div', { style: { padding: '20px 20px' }}, scrHome);
  [['New request', 'plus', 1], ['My requests', 'list', 1], ['Knowledge base', 'book', .38]].forEach(([lab, g, op]) => {
    const tl = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '14px',
      height: '78px', background: '#fff', borderRadius: '14px', padding: '0 18px',
      marginBottom: '14px', boxShadow: '0 8px 20px rgba(14,46,60,.10)', opacity: op,
    }}, hb);
    glyph(g, tl, BLUE, 34);
    node('div', { text: lab, style: { fontSize: '20px', fontWeight: 700, color: NAVY }}, tl);
  });

  /* screen 2: a generic work-account sign-in */
  scrSign = screen(glass);
  const sb = node('div', { style: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '86px 26px 0', gap: '18px',
  }}, scrSign);
  node('div', { style: {
    width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0,134,177,.16)',
    border: '3px solid rgba(0,134,177,.35)',
  }}, sb);
  node('div', { text: 'Sign in with your work account', style: {
    fontSize: '22px', fontWeight: 700, color: NAVY, textAlign: 'center', lineHeight: 1.25,
  }}, sb);
  const pw = node('div', { style: {
    width: '100%', height: '50px', background: '#fff', borderRadius: '10px',
    border: '1.5px solid rgba(22,67,86,.18)', display: 'flex', alignItems: 'center',
    padding: '0 16px', gap: '9px', marginTop: '10px',
  }}, sb);
  for (let i = 0; i < 8; i++) {
    pwDots.push(node('div', { style: {
      width: '12px', height: '12px', borderRadius: '50%', background: NAVY, opacity: 0,
    }}, pw));
  }
  signBtn = node('div', { text: 'Continue', style: {
    width: '100%', height: '54px', background: BLUE, borderRadius: '10px', color: '#fff',
    fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center',
    justifyContent: 'center', marginTop: '6px',
  }}, sb);

  /* screen 3: the short form (scene06's beat) */
  scrForm = screen(glass);
  const fh = node('div', { style: { height: '84px', background: NAVY, padding: '24px 22px 0' }}, scrForm);
  node('div', { text: 'New request', style: { fontSize: '25px', fontWeight: 700, color: '#fff' }}, fh);
  const ff = node('div', { style: { padding: '22px' }}, scrForm);
  FIELDS.forEach(lab => {
    node('div', { text: lab, style: {
      fontSize: '16px', fontWeight: 700, color: 'rgba(14,46,60,.52)', marginBottom: '6px',
    }}, ff);
    const box = node('div', { style: {
      height: '46px', background: '#fff', borderRadius: '9px',
      border: '1.5px solid rgba(22,67,86,.16)', marginBottom: '16px',
      display: 'flex', alignItems: 'center', padding: '0 12px',
    }}, ff);
    formVals.push(node('div', { style: {
      height: '14px', width: '0%', borderRadius: '7px', background: 'rgba(0,134,177,.45)',
    }}, box));
  });
  submitBtn = node('div', { text: 'Submit', style: {
    height: '54px', background: BLUE, borderRadius: '10px', color: '#fff',
    fontSize: '22px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}, ff);

  phoneCheck = node('div', { style: {
    position: 'absolute', inset: 0, background: 'rgba(247,251,252,.96)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '22px', opacity: 0,
  }}, glass);
  const ck = svgNode('svg', { viewBox: '0 0 64 64', width: 96, height: 96 }, phoneCheck);
  svgNode('circle', { cx: 32, cy: 32, r: 27, fill: 'none', stroke: BLUE, 'stroke-width': 4 }, ck);
  phoneCheck.tick = svgNode('path', { d: 'M20 33l9 9 16-18', fill: 'none', stroke: BLUE,
    'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'stroke-dasharray': 44, 'stroke-dashoffset': 44 }, ck);
  node('div', { text: 'Sent', style: { fontSize: '28px', fontWeight: 700, color: NAVY }}, phoneCheck);

  /* --- someone who is not at a desk --------------------------------- */
  walker = figure(stageA, { x: 1712, y: 560, h: 260, accent: BLUE });
  walker.set({ opacity: 0 });

  /* ============ movement 3: the two lanes ============================ */
  lanes = node('div', { style: { position: 'absolute', inset: 0, opacity: 0 }}, root);

  node('div', { style: {
    position: 'absolute', left: '90px', top: '206px',
    width: '1740px', height: '250px', borderRadius: '24px',
    background: 'rgba(0,134,177,.055)',
  }}, lanes);
  node('div', { style: {
    position: 'absolute', left: '90px', top: '596px',
    width: '1740px', height: '250px', borderRadius: '24px',
    background: 'rgba(22,67,86,.038)',
  }}, lanes);
  laneLabels.push(panelLabel(lanes, 'WITH THE DETAILS', 130, 172));
  laneLabels.push(panelLabel(lanes, 'WITHOUT THEM', 130, 562));

  formA = node('div', { style: {
    position: 'absolute', left: '140px', top: '240px', width: '560px',
    background: '#fff', borderRadius: '16px', padding: '18px 24px',
    boxShadow: '0 14px 34px rgba(14,46,60,.13)', opacity: 0,
  }}, lanes);
  FIELDS.forEach(lab => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0', opacity: 0,
    }}, formA);
    const box = node('div', { style: {
      width: '30px', height: '30px', borderRadius: '8px',
      background: 'rgba(0,134,177,.12)', flex: '0 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}, r);
    const sv = svgNode('svg', { viewBox: '0 0 24 24', width: 18, height: 18 }, box);
    svgNode('path', { d: 'M5 13l4 4 10-11', fill: 'none', stroke: BLUE,
      'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
    node('div', { text: lab, style: { fontSize: '24px', fontWeight: 700, color: NAVY }}, r);
    node('div', { text: 'required', style: {
      marginLeft: 'auto', fontSize: '17px', color: 'rgba(14,46,60,.42)',
    }}, r);
    fieldEls.push(r);
  });
  badgeA = node('div', { style: {
    marginTop: '10px', paddingTop: '12px', borderTop: '1px solid rgba(22,67,86,.10)', opacity: 0,
  }}, formA);
  chip(badgeA, '+30 s', 'open', 22).style.transformOrigin = '0 50%';

  for (let i = 0; i < NOTE_N; i++) {
    const b = node('div', { style: {
      position: 'absolute', left: (140 + i * 106) + 'px',
      top: (i % 2 ? 690 : 636) + 'px',
      width: '96px', height: '58px', background: '#fff',
      borderRadius: '11px', opacity: 0,
      borderLeft: '5px solid ' + (i % 2 ? NAVY : 'rgba(22,67,86,.45)'),
      boxShadow: '0 8px 20px rgba(14,46,60,.13)',
    }}, lanes);
    for (let k = 0; k < 2; k++) {
      node('div', { style: {
        position: 'absolute', left: '16px', right: '14px',
        top: (18 + k * 14) + 'px', height: '6px', borderRadius: '3px',
        background: 'rgba(22,67,86,.22)',
      }}, b);
    }
    notes.push(b);
  }

  /* a clock with no numbers on it: contrast, not a metric */
  const cw = node('div', { style: {
    position: 'absolute', left: '672px', top: '652px', width: '96px', height: '96px', opacity: 0,
  }}, lanes);
  const csvg = svgNode('svg', { viewBox: '0 0 96 96', width: 96, height: 96 }, cw);
  svgNode('circle', { cx: 48, cy: 48, r: 42, fill: '#fff', stroke: 'rgba(22,67,86,.22)', 'stroke-width': 5 }, csvg);
  const ch = svgNode('line', { x1: 48, y1: 48, x2: 48, y2: 26, stroke: NAVY, 'stroke-width': 6, 'stroke-linecap': 'round' }, csvg);
  const cm = svgNode('line', { x1: 48, y1: 48, x2: 48, y2: 16, stroke: BLUE, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, csvg);
  svgNode('circle', { cx: 48, cy: 48, r: 5, fill: NAVY }, csvg);
  clock = { wrap: cw, hour: ch, min: cm };

  trA = track(lanes, LANE_A + 10);
  trB = track(lanes, LANE_B + 10);
  tickA = tickMark(lanes, TRACK.x1 + 40, LANE_A - 34, GREEN);
  tickB = tickMark(lanes, TRACK.x1 + 40, LANE_B - 34, BLUE);

  line = onScreen(root, { text: '30 seconds now. Much more later.', y: 60, size: 46, t0: T.line });

  card = titleCard(root, { n: 6, title: 'One place for everything' });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* ============ movement 1: the portal ============================== */
  const si = span(t, T.shellIn, T.shellIn + 0.7);
  const aOut = span(t, T.lanesIn, T.lanesIn + 0.6);
  stageA.style.opacity = String(si * (1 - aOut));

  /* the shell rises in, then slides aside to make room for the phone */
  const ph = span(t, T.phone, T.phone + 1.0);
  const p = easeInOut(ph);
  shell.style.transform =
    `translate(${lerp(0, -290, p)}px, ${lerp(26, 0, easeOut(si)) + lerp(0, -10, p)}px) scale(${lerp(1, 0.82, p)})`;

  TILES.forEach((spec, i) => {
    const u = span(t, spec.t, spec.t + 0.5);
    /* the tile the narration names gets a ring while she names it */
    const ring = i === 0 ? pulse(span(t, T.openNew, T.openNew + 0.8))
               : i === 1 ? pulse(span(t, T.seeMine, T.seeMine + 0.8)) : 0;
    tiles[i].style.opacity = String(u * (spec.faint ? 0.38 : 1));
    tiles[i].style.transform =
      `translateY(${lerp(20, 0, easeOut(u))}px) scale(${lerp(0.92, 1, easeBack(u)) + ring * 0.03})`;
    tiles[i].style.boxShadow = `0 12px 30px rgba(14,46,60,.12), 0 0 0 ${(ring * 4).toFixed(1)}px rgba(0,134,177,${(ring * .55).toFixed(2)})`;
  });

  myRows.forEach((r, i) => {
    const u = stagger(t, T.rows, 0.30, 0.45, i);
    r.style.opacity = u;
    r.style.transform = `translateX(${lerp(-16, 0, easeOut(u))}px)`;
    const d = stagger(t, T.teams, 0.15, 0.35, i);
    teamDots[i].style.opacity = d;
    teamDots[i].style.transform = `scale(${lerp(0.3, 1, easeBack(d))})`;
  });

  /* where something stands: the chip says so */
  const st = pulse(span(t, T.stands, T.stands + 0.8));
  statusChip.style.transform = `scale(${1 + st * 0.14})`;
  statusChip.style.boxShadow = `0 0 0 ${(st * 5).toFixed(1)}px rgba(0,134,177,${(st * .35).toFixed(2)})`;

  /* the chaser email, struck through, gone */
  const ei = span(t, T.email, T.email + 0.4);
  const eo = span(t, T.emailOut, T.emailOut + 0.5);
  envelope.style.opacity = String(ei * (1 - eo));
  envelope.style.transform = `scale(${lerp(0.6, 1, easeBack(ei))})`;
  envStrike.setAttribute('stroke-dashoffset', String(lerp(68, 0, easeOut(span(t, T.strike, T.strike + 0.4)))));
  const en = span(t, T.strike + 0.3, T.strike + 0.7);
  envNote.style.opacity = String(en * (1 - eo));
  envNote.style.transform = `translateY(${lerp(8, 0, easeOut(en))}px)`;

  /* ============ movement 2: the phone ================================ */
  /* a small sway once she is walking, because she is between meetings */
  const swayAmp = span(t, T.phone + 1.0, T.phone + 1.8);
  const sway = Math.sin((t - T.phone) * 1.7) * 1.1 * swayAmp;
  phone.style.opacity = ph;
  phone.style.transform =
    `translateY(${lerp(44, 0, easeOut(ph))}px) scale(${lerp(0.94, 1, easeBack(ph))}) rotate(${sway.toFixed(2)}deg)`;

  const cm = span(t, T.mobile, T.mobile + 0.45);
  chipMobile.style.opacity = cm;
  chipMobile.style.transform = `translateX(${lerp(-14, 0, easeOut(cm))}px) scale(${lerp(0.8, 1, easeBack(cm))})`;
  const cv = span(t, T.vpn, T.vpn + 0.45);
  chipVpn.style.opacity = cv;
  chipVpn.style.transform = `translateX(${lerp(-14, 0, easeOut(cv))}px) scale(${lerp(0.8, 1, easeBack(cv))})`;

  /* screens: home -> sign-in -> form -> sent */
  const toSign = span(t, T.signin, T.signin + 0.35);
  const toForm = span(t, T.form, T.form + 0.3);
  scrHome.style.opacity = String(1 - toSign);
  scrSign.style.opacity = String(toSign * (1 - toForm));
  scrForm.style.opacity = String(toForm);

  const bk = span(t, T.bookmark, T.bookmark + 0.5);
  star.path.setAttribute('fill', `rgba(255,255,255,${bk.toFixed(2)})`);
  star.style.transform = `scale(${1 + pulse(bk) * 0.35})`;

  pwDots.forEach((d, i) => { d.style.opacity = stagger(t, T.typing, 0.16, 0.12, i); });
  const sg = pulse(span(t, T.signinGo, T.signinGo + 0.45));
  signBtn.style.transform = `scale(${1 - sg * 0.06})`;

  formVals.forEach((v, i) => { v.style.width = (easeOut(stagger(t, T.fields, 0.32, 0.4, i)) * lerp(48, 72, i / 2)) + '%'; });
  const sb = pulse(span(t, T.submit, T.submit + 0.45));
  submitBtn.style.transform = `scale(${1 - sb * 0.06})`;
  const ck = span(t, T.sent, T.sent + 0.5);
  phoneCheck.style.opacity = ck;
  phoneCheck.tick.setAttribute('stroke-dashoffset', String(lerp(44, 0, easeOut(span(t, T.sent + 0.15, T.sent + 0.8)))));

  /* the walker: appears on "people who aren't sitting at a desk", walks on */
  const wk = span(t, T.walker, T.walker + 0.6);
  const w = (t - T.walker) * 5.2;
  const s = Math.sin(w);
  walker.set({
    opacity: wk,
    y: 560 - Math.abs(s) * 6 + lerp(24, 0, easeOut(wk)),
    armL: s * 17 * wk, armR: s * 17 * wk, headTilt: s * 2 * wk,
  });

  /* ============ movement 3: the lanes ================================ */
  const li = span(t, T.lanesIn + 0.2, T.lanesIn + 0.8);
  lanes.style.opacity = String(li);
  laneLabels.forEach((l, i) => { l.style.opacity = String(stagger(t, T.formA - 0.2, 0.18, 0.5, i) * 0.9); });
  trA.el.style.opacity = String(span(t, T.formA, T.formA + 0.6));
  trB.el.style.opacity = String(span(t, T.formA + 0.15, T.formA + 0.75));

  const fi = span(t, T.formA, T.formA + 0.6);
  formA.style.opacity = fi;
  formA.style.transform = `translateY(${lerp(18, 0, easeOut(fi))}px)`;
  fieldEls.forEach((r, i) => {
    const u = stagger(t, T.fieldsA, 0.38, 0.4, i);
    r.style.opacity = u;
    r.style.transform = `translateX(${lerp(-12, 0, easeOut(u))}px)`;
  });
  const bg = span(t, T.badge, T.badge + 0.6);
  badgeA.style.opacity = bg;
  badgeA.firstChild.style.transform = `scale(${lerp(0.7, 1, easeBack(bg))})`;

  /* the detailed request goes straight through to a green check */
  const fast = easeInOut(span(t, T.fastGo, T.fastDone));
  trA.fill.style.width = (fast * 100) + '%';
  const tA = span(t, T.fastDone - 0.1, T.fastDone + 0.4);
  tickA.style.opacity = tA;
  tickA.style.transform = `scale(${lerp(0.7, 1, easeBack(tA))})`;
  tickA.tick.setAttribute('stroke-dashoffset', String(lerp(44, 0, easeOut(span(t, T.fastDone + 0.1, T.fastDone + 0.7)))));

  /* the vague one collects emails and crawls */
  notes.forEach((b, i) => {
    const u = span(t, T.notes + i * 0.8, T.notes + i * 0.8 + 0.35);
    b.style.opacity = u;
    b.style.transform = `translateY(${lerp(14, 0, easeOut(u))}px)`;
  });
  clock.wrap.style.opacity = String(span(t, T.slowGo, T.slowGo + 0.5));
  const spin = span(t, T.slowGo, T.slowDone);
  clock.min.setAttribute('transform', `rotate(${spin * 1080} 48 48)`);
  clock.hour.setAttribute('transform', `rotate(${spin * 90} 48 48)`);
  const slow = easeInOut(span(t, T.slowGo + 0.4, T.slowDone));
  trB.fill.style.width = (slow * 100) + '%';
  const tB = span(t, T.slowDone - 0.1, T.slowDone + 0.4);
  tickB.style.opacity = tB;
  tickB.style.transform = `scale(${lerp(0.7, 1, easeBack(tB))})`;
  tickB.tick.setAttribute('stroke-dashoffset', String(lerp(44, 0, easeOut(span(t, T.slowDone + 0.1, T.slowDone + 0.7)))));

  line.update(t);

  cc.update(t, CUES);
  return `shell ${si.toFixed(2)} phone ${ph.toFixed(2)} lanes ${li.toFixed(2)}`;
}
