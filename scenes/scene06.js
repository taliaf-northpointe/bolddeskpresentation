/* ===================================================================
   SCENE 6 — "One place to get help"                     2:06 – 2:36

   The only part of the film that is a growth story rather than an
   efficiency one, and the section to protect if the runtime has to come
   down.

   One honesty decision shapes the whole scene. The knowledge base is
   empty today — the real portal says "No category found". So the visual
   starts empty and fills, which reads as an invitation rather than a
   populated library nobody has built yet. It is also more persuasive
   that way: you can see your own team's article going in.

   The portal's own hero copy is used rather than invented marketing:
   guides, troubleshooting steps, answers to common questions.
=================================================================== */

import {
  node, svgNode, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';
import { chip } from '../lib/ui.js';

export const id = 'scene06';
export const title = 'One place to get help';
export const dur = 30.0;
export const visemes = null;

const CUES = [
  [0.30,  7.00, "The portal gives employees one place to open a request and check what's already in progress."],
  [7.40, 12.60, "It also holds a shared knowledge base any team can contribute to."],
  [13.00,20.00, "Answer a question once, and what one team knows becomes something the whole bank can use."],
  [20.40,29.60, "It's mobile friendly too — someone can ask for help from a phone between meetings, instead of waiting until they're back at a desk."],
];

/* Generic article titles. Categories of thing people ask, not real
   articles, and the accent colours stand in for "different teams wrote
   these" without naming any team. */
const ARTICLES = [
  { t: 13.40, title: 'How to request access',    accent: '#0086B1' },
  { t: 14.65, title: 'Where to find a report',   accent: '#2E7D8F' },
  { t: 15.90, title: 'Submitting a document',    accent: '#4A7A96' },
  { t: 17.15, title: 'Who to contact, and when', accent: '#1B6E85' },
];

const TILES = [
  { t: 2.10, label: 'New Request',    sub: 'Start something',      glyph: 'plus' },
  { t: 3.00, label: 'My Requests',    sub: 'Check what\u2019s open', glyph: 'list' },
  { t: 7.60, label: 'Knowledge Base', sub: 'Find an answer',       glyph: 'book' },
];

const P = { x: 160, y: 176, w: 1080, h: 760 };

const T = {
  shellIn:  0.30,
  kbOpen:   8.40,
  readers: 18.20,
  line:    17.40,
  phone:   20.60,
  submit:  24.40,
  check:   26.20,
  zoom:    28.60,
};

let root, shell, shellBody, tiles = [], kb, kbEmpty, kbSearch, articleEls = [],
    readerDots = [], onscreen, phone, phoneForm, phoneBtn, phoneCheck,
    myRows = [], cc;

/* ---------- glyphs ------------------------------------------------- */
function glyph(kind, parent, color) {
  const svg = svgNode('svg', { viewBox: '0 0 48 48', width: 46, height: 46 }, parent);
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

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(168deg, #FAFCFE 0%, #E3EDF3 100%)',
  }}, root);

  /* --- the on-screen line, above the portal ------------------------ */
  onscreen = node('div', { style: {
    position: 'absolute', left: '260px', width: '1400px', top: '82px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'What one team knows, the whole bank can use.', style: {
    fontSize: '44px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
  }}, onscreen);

  /* --- portal shell ------------------------------------------------- */
  shell = node('div', { style: {
    position: 'absolute', left: P.x + 'px', top: P.y + 'px',
    width: P.w + 'px', height: P.h + 'px', background: '#F7FBFC',
    borderRadius: '22px', boxShadow: '0 32px 78px rgba(14,46,60,.20)',
    overflow: 'hidden', opacity: 0, transformOrigin: '30% 40%',
  }}, root);

  const head = node('div', { style: {
    height: '176px', background: NAVY, padding: '30px 44px 0',
  }}, shell);
  node('div', { text: 'How can we help you?', style: {
    fontSize: '34px', fontWeight: 700, color: '#fff', marginBottom: '8px',
  }}, head);
  node('div', { text: 'Guides, troubleshooting steps, and answers to common questions.', style: {
    fontSize: '20px', color: 'rgba(255,255,255,.66)', marginBottom: '18px',
  }}, head);
  kbSearch = node('div', { style: {
    height: '54px', background: '#fff', borderRadius: '10px',
    display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px',
  }}, head);
  const mag = svgNode('svg', { viewBox: '0 0 24 24', width: 22, height: 22 }, kbSearch);
  svgNode('circle', { cx: 10.5, cy: 10.5, r: 6.5, fill: 'none',
    stroke: 'rgba(22,67,86,.45)', 'stroke-width': 2.2 }, mag);
  svgNode('path', { d: 'M15.5 15.5L21 21', stroke: 'rgba(22,67,86,.45)',
    'stroke-width': 2.2, 'stroke-linecap': 'round' }, mag);
  node('div', { text: 'Search articles', style: {
    fontSize: '20px', color: 'rgba(22,67,86,.42)',
  }}, kbSearch);

  shellBody = node('div', { style: { padding: '34px 44px', position: 'relative' }}, shell);

  /* three tiles */
  const row = node('div', { style: {
    display: 'flex', gap: '26px', transformOrigin: '50% 0%',
  }}, shellBody);
  shellBody.tileRow = row;
  TILES.forEach(spec => {
    const tl = node('div', { style: {
      flex: '1 1 0', height: '158px', background: '#fff', borderRadius: '16px',
      boxShadow: '0 12px 30px rgba(14,46,60,.12)',
      padding: '22px 24px', opacity: 0, transformOrigin: '50% 50%',
    }}, row);
    glyph(spec.glyph, tl, BLUE);
    node('div', { text: spec.label, style: {
      marginTop: '12px', fontSize: '26px', fontWeight: 700, color: NAVY,
    }}, tl);
    tl.sub = node('div', { text: spec.sub, style: {
      fontSize: '19px', color: 'rgba(14,46,60,.52)',
    }}, tl);
    tl.icon = tl.firstChild;
    tiles.push(tl);
  });

  /* "My Requests" contents, so "check what's already in progress" has
     something to point at */
  const mine = node('div', { style: { marginTop: '28px' }}, shellBody);
  [['Access to a system', 'Awaiting your reply', 'waiting'],
   ['Report question', 'Open', 'open'],
   ['Document needed', 'Open', 'open']].forEach(([title, st, tone]) => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#fff', borderRadius: '12px', borderLeft: '5px solid ' + BLUE,
      padding: '18px 24px', marginBottom: '14px', opacity: 0,
      boxShadow: '0 6px 18px rgba(14,46,60,.08)',
    }}, mine);
    node('div', { text: title, style: {
      fontSize: '24px', fontWeight: 700, color: NAVY,
    }}, r);
    chip(r, st, tone, 19);
    myRows.push(r);
  });

  /* --- the knowledge base panel, which starts empty ---------------- */
  kb = node('div', { style: {
    position: 'absolute', left: '44px', right: '44px', top: '250px',
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 16px 40px rgba(14,46,60,.14)',
    padding: '22px 30px', opacity: 0, transformOrigin: '50% 0%',
  }}, shellBody);
  node('div', { text: 'KNOWLEDGE BASE', style: {
    fontSize: '16px', letterSpacing: '.18em', color: BLUE,
    fontWeight: 700, marginBottom: '16px',
  }}, kb);

  /* the honest starting point */
  kbEmpty = node('div', { style: {
    textAlign: 'center', padding: '34px 0 30px', opacity: 1,
  }}, kb);
  node('div', { text: 'Nothing here yet.', style: {
    fontSize: '30px', fontWeight: 700, color: 'rgba(14,46,60,.46)',
  }}, kbEmpty);
  node('div', { text: 'Every team that works in it can add to it.', style: {
    fontSize: '21px', color: 'rgba(14,46,60,.40)', marginTop: '8px',
  }}, kbEmpty);

  const list = node('div', { style: { position: 'relative' }}, kb);
  ARTICLES.forEach(a => {
    const el = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '13px 18px', marginBottom: '8px',
      background: '#F7FBFC', borderRadius: '10px',
      borderLeft: '5px solid ' + a.accent, opacity: 0,
    }}, list);
    node('div', { text: a.title, style: {
      fontSize: '23px', fontWeight: 600, color: NAVY,
    }}, el);
    articleEls.push(el);
  });

  /* readers: one article, many people who never had to ask */
  const readers = node('div', { style: {
    display: 'flex', gap: '9px', alignItems: 'center',
    marginTop: '14px', paddingLeft: '18px',
  }}, kb);
  node('div', { text: 'read by', style: {
    fontSize: '19px', color: 'rgba(14,46,60,.45)', marginRight: '6px', opacity: 0,
  }}, readers).id = 'readlabel';
  for (let i = 0; i < 14; i++) {
    readerDots.push(node('div', { style: {
      width: '20px', height: '20px', borderRadius: '50%',
      background: 'rgba(0,134,177,.42)', opacity: 0, flex: '0 0 auto',
    }}, readers));
  }
  kb.readLabel = readers.firstChild;

  /* --- the phone ---------------------------------------------------- */
  phone = node('div', { style: {
    position: 'absolute', left: '1392px', top: '262px',
    width: '330px', height: '640px', background: '#16232B',
    borderRadius: '38px', padding: '14px', opacity: 0,
    boxShadow: '0 34px 74px rgba(14,46,60,.34)', transformOrigin: '50% 90%',
  }}, root);
  const pscreen = node('div', { style: {
    width: '100%', height: '100%', background: '#F7FBFC',
    borderRadius: '26px', overflow: 'hidden',
  }}, phone);
  const phead = node('div', { style: {
    height: '92px', background: NAVY, padding: '26px 22px 0',
  }}, pscreen);
  node('div', { text: 'New Request', style: {
    fontSize: '25px', fontWeight: 700, color: '#fff',
  }}, phead);

  phoneForm = node('div', { style: { padding: '22px' }}, pscreen);
  ['Group', 'Application', 'Request type'].forEach(lab => {
    node('div', { text: lab, style: {
      fontSize: '16px', fontWeight: 700, color: 'rgba(14,46,60,.52)',
      marginBottom: '6px',
    }}, phoneForm);
    node('div', { style: {
      height: '46px', background: '#fff', borderRadius: '9px',
      border: '1.5px solid rgba(22,67,86,.16)', marginBottom: '16px',
    }}, phoneForm);
  });
  phoneBtn = node('div', { text: 'Submit', style: {
    height: '54px', background: BLUE, borderRadius: '10px', color: '#fff',
    fontSize: '22px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}, phoneForm);

  phoneCheck = node('div', { style: {
    position: 'absolute', inset: '14px', borderRadius: '26px',
    background: 'rgba(247,251,252,.96)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '22px', opacity: 0,
  }}, phone);
  const ck = svgNode('svg', { viewBox: '0 0 64 64', width: 96, height: 96 }, phoneCheck);
  svgNode('circle', { cx: 32, cy: 32, r: 27, fill: 'none', stroke: BLUE, 'stroke-width': 4 }, ck);
  const tick = svgNode('path', { d: 'M20 33l9 9 16-18', fill: 'none', stroke: BLUE,
    'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'stroke-dasharray': 44, 'stroke-dashoffset': 44 }, ck);
  phoneCheck.tick = tick;
  node('div', { text: 'Sent', style: {
    fontSize: '28px', fontWeight: 700, color: NAVY,
  }}, phoneCheck);

  cc = makeCaptions(root);
  return { cc };
}

export function render(t) {
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 29.5, dur));

  /* --- shell ------------------------------------------------------- */
  const si = span(t, T.shellIn, T.shellIn + 0.8);
  shell.style.opacity = si;

  /* --- tiles ------------------------------------------------------- */
  TILES.forEach((spec, i) => {
    const u = span(t, spec.t, spec.t + 0.5);
    tiles[i].style.opacity = u;
    tiles[i].style.transform =
      `translateY(${lerp(20, 0, easeOut(u))}px) scale(${lerp(0.92, 1, easeBack(u))})`;
  });

  /* --- my requests ------------------------------------------------- */
  myRows.forEach((r, i) => {
    const u = stagger(t, 4.00, 0.30, 0.45, i);
    r.style.opacity = u * (1 - span(t, T.kbOpen - 0.2, T.kbOpen + 0.5));
    r.style.transform = `translateX(${lerp(-16, 0, easeOut(u))}px)`;
  });

  /* --- knowledge base: empty, then filling ------------------------- */
  const ko = span(t, T.kbOpen, T.kbOpen + 0.8);
  const k = easeInOut(ko);
  /* The panel rises into the space the My Requests rows vacate. */
  kb.style.top = lerp(250, 190, k) + 'px';
  kb.style.opacity = ko;
  kb.style.transform = `scaleY(${lerp(0.92, 1, easeOut(ko))})`;

  /* the empty state holds while the narration says the KB exists, then
     gives way as the first article lands */
  kbEmpty.style.opacity = String(1 - span(t, ARTICLES[0].t - 0.5, ARTICLES[0].t + 0.2));
  kbEmpty.style.height = span(t, ARTICLES[0].t - 0.5, ARTICLES[0].t + 0.2) > 0.98
    ? '0px' : '';

  ARTICLES.forEach((a, i) => {
    const u = span(t, a.t, a.t + 0.45);
    articleEls[i].style.opacity = u;
    articleEls[i].style.transform =
      `translateX(${lerp(26, 0, easeOut(u))}px)`;
  });

  /* one answer, many readers */
  kb.readLabel.style.opacity = String(span(t, T.readers, T.readers + 0.4));
  readerDots.forEach((d, i) => {
    const u = stagger(t, T.readers + 0.2, 0.055, 0.3, i);
    d.style.opacity = String(u * 0.95);
    d.style.transform = `scale(${lerp(0.4, 1, easeBack(u))})`;
  });

  /* --- the line ---------------------------------------------------- */
  const ou = span(t, T.line, T.line + 0.7);
  onscreen.style.opacity = ou * (1 - span(t, T.phone + 0.6, T.phone + 1.4));
  onscreen.style.transform = `translateY(${lerp(-16, 0, easeOut(ou))}px)`;

  /* --- the phone --------------------------------------------------- */
  /* The portal slides left and shrinks slightly to make room, rather
     than the phone landing on top of it. */
  const ph = span(t, T.phone, T.phone + 1.0);
  const p = easeInOut(ph);
  shell.style.transform =
    `translateX(${lerp(0, -132, p)}px) scale(${lerp(1, 0.92, p)})`;
  phone.style.opacity = ph;
  phone.style.transform =
    `translateY(${lerp(44, 0, easeOut(ph))}px) scale(${lerp(0.94, 1, easeBack(ph))})`;

  /* a small idle sway, because she is walking between meetings */
  if (ph > 0.9) {
    const sway = Math.sin((t - T.phone) * 1.7) * 1.1;
    phone.style.transform = `rotate(${sway}deg)`;
  }

  /* submit, then the confirmation */
  const sb = pulse(span(t, T.submit, T.submit + 0.45));
  phoneBtn.style.transform = `scale(${1 - sb * 0.06})`;
  const ck = span(t, T.check, T.check + 0.5);
  phoneCheck.style.opacity = ck;
  phoneCheck.tick.setAttribute('stroke-dashoffset',
    String(lerp(44, 0, easeOut(span(t, T.check + 0.15, T.check + 0.8)))));

  /* --- transition: toward the form -------------------------------- */
  /* Scene 7 opens on the form itself, so this ends by pushing into it. */
  const z = easeInOut(span(t, T.zoom, dur));
  if (z > 0) {
    phone.style.transform = `scale(${lerp(1, 1.18, z)})`;
    phone.style.opacity = String(1 - z * 0.15);
    shell.style.opacity = String(si * (1 - z));
  }

  cc.update(t, CUES);
  return null;
}

export { CUES };
