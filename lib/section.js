/* ===================================================================
   section.js — the shell every revision-3 section shares.

   The script is fourteen sections, most of them opened by a title card.
   This module gives a section:

     paper(root)            the Northpointe background every scene sits on
     titleCard(root, opts)  the card the script calls for, in and out on t
     loadCues(url)          Ava's actual phrase timings from data/cues-*.json,
                            used for captions; index.html awaits the load
     captions(root)         the caption box, fed from those cues
     onScreen(root, opts)   one short line of on-screen copy, in and out on t
     figure(parent, opts)   a flat person, the same register as scenes 2 and 3

   Everything is a pure function of the section's local t. No CSS
   transitions, no timers: the renderer steps time and screenshots, so
   anything that animates on its own clock will not be in the frame.
=================================================================== */

import { node, svgNode, span, lerp, easeOut, easeIn, easeInOut, easeBack, pulse, stagger, clamp,
         NAVY, BLUE, makeCaptions } from './engine.js';

export const PAPER = '#FBFDFE';
export const PAPER2 = '#E7F0F5';
export const INK = 'rgba(14,46,60,.66)';
export const INK_SOFT = 'rgba(14,46,60,.45)';

/* ---------- background ------------------------------------------- */
export function paper(root, { tint = 1 } = {}) {
  return node('div', { style: {
    position: 'absolute', inset: 0,
    background:
      `radial-gradient(1200px 900px at 18% 8%, rgba(0,134,177,${.13 * tint}), transparent 62%),` +
      `radial-gradient(900px 700px at 88% 78%, rgba(22,67,86,${.10 * tint}), transparent 60%),` +
      `linear-gradient(170deg, ${PAPER} 0%, ${PAPER2} 100%)`,
  }}, root);
}

/* ---------- title card --------------------------------------------
   Full-frame card: small numbered kicker, the title, a rule that draws
   itself. Shows from t0 for `hold` seconds, then recedes (scales up a
   touch and fades) so the section's content is revealed underneath.
   Default hold 2.4s: the narration's first line usually echoes the card,
   so the card is still up while Ava says it and gone before the visual
   that line describes needs the frame. */
export function titleCard(root, { n, title, hold = 2.4, t0 = 0, kicker = null }) {
  const el = node('div', { style: {
    position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
    background: `linear-gradient(170deg, ${PAPER} 0%, ${PAPER2} 100%)`,
    opacity: 0, pointerEvents: 'none', zIndex: 5,
  }}, root);
  const inner = node('div', { style: { textAlign: 'center', maxWidth: '1400px', padding: '0 80px' }}, el);
  const kick = node('div', {
    text: kicker ?? (n ? String(n).padStart(2, '0') : ''),
    style: { fontSize: '26px', letterSpacing: '.22em', color: BLUE, fontWeight: 700,
             marginBottom: '26px', opacity: 0 },
  }, inner);
  const ttl = node('div', { text: title, style: {
    fontSize: '84px', lineHeight: 1.1, fontWeight: 700, color: NAVY,
    transform: 'translateY(18px)', opacity: 0,
  }}, inner);
  const rule = node('div', { style: {
    width: '0px', height: '8px', background: BLUE, borderRadius: '4px',
    margin: '38px auto 0',
  }}, inner);

  const IN = 0.55, OUT = 0.6;
  return {
    el,
    /* returns true while the card covers the frame */
    update(t) {
      const a = span(t, t0, t0 + IN);
      const b = span(t, t0 + hold, t0 + hold + OUT);
      const vis = a > 0 && b < 1;
      el.style.display = vis ? 'grid' : 'none';
      if (!vis) return false;
      el.style.opacity = Math.min(a, 1 - b);
      el.style.transform = `scale(${lerp(1, 1.04, easeInOut(b))})`;
      kick.style.opacity = span(t, t0 + 0.1, t0 + 0.5);
      const u = easeOut(span(t, t0 + 0.15, t0 + 0.75));
      ttl.style.opacity = u;
      ttl.style.transform = `translateY(${lerp(18, 0, u)}px)`;
      rule.style.width = `${lerp(0, 220, easeOut(span(t, t0 + 0.45, t0 + 1.1)))}px`;
      return b < 0.5;
    },
  };
}

/* ---------- cues ---------------------------------------------------
   data/cues-secNN.json is [[start, end, "phrase"], ...] — where Ava
   actually says each phrase. Returned array fills in asynchronously;
   the promise is registered so index.html can wait before __ready. */
/* data/x.json -> data/<variant>/x.json when index.html set a variant */
export function variantPath(url) {
  const v = window.__variant;
  return v ? url.replace(/^data\//, `data/${v}/`) : url;
}

export function loadCues(url) {
  const cues = [];
  const p = fetch(variantPath(url), { cache: 'no-store' })
    .then(r => r.json())
    .then(j => { if (Array.isArray(j)) cues.push(...j); })
    .catch(() => {});
  (window.__pending = window.__pending || []).push(p);
  return cues;
}

/* Same, for any JSON a scene wants to time against (e.g. words). */
export function loadJson(url, into) {
  const p = fetch(variantPath(url), { cache: 'no-store' })
    .then(r => r.json())
    .then(j => { if (Array.isArray(j)) into.push(...j); else Object.assign(into, j); })
    .catch(() => {});
  (window.__pending = window.__pending || []).push(p);
  return into;
}

/* Start time of the k-th phrase (0-based) in a cue list, or a fallback
   while the file is still loading. Lets a scene tie a beat to "when she
   says line 3" without hard-coding the second. */
export const cueAt = (cues, k, fallback = 0) => (cues[k] ? cues[k][0] : fallback);
export const cueEnd = (cues, k, fallback = 0) => (cues[k] ? cues[k][1] : fallback);

/* First time a given word is spoken, from data/words-secNN.json
   ([{t, d, w}]). Case-insensitive, punctuation ignored. */
export function wordAt(words, w, fallback = 0, after = 0) {
  const want = w.toLowerCase().replace(/[^a-z0-9']/g, '');
  for (const x of words) {
    if (x.t >= after && x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === want) return x.t;
  }
  return fallback;
}

/* ---------- captions ---------------------------------------------- */
export function captions(root) {
  const cc = makeCaptions(root);
  /* sit above the safe margin, wrap long phrases, stay readable on a laptop */
  cc.box = root.lastChild;
  Object.assign(cc.box.style, { bottom: '56px', padding: '0 200px', zIndex: 9 });
  Object.assign(cc.box.firstChild.style, { fontSize: '36px', lineHeight: 1.3, padding: '12px 26px',
                                           maxWidth: '1520px', textAlign: 'center' });
  return cc;
}

/* ---------- on-screen line ----------------------------------------
   One short phrase of copy, never the narration. Slides up into place
   at t0 and, if t1 is given, away again. */
export function onScreen(root, { text, x = 960, y = 940, size = 46, t0, t1 = null,
                                 align = 'center', width = 1500, color = NAVY }) {
  const el = node('div', { text, style: {
    position: 'absolute', left: (align === 'center' ? x - width / 2 : x) + 'px', top: y + 'px',
    width: width + 'px', textAlign: align,
    fontSize: size + 'px', fontWeight: 700, color, lineHeight: 1.2, opacity: 0,
  }}, root);
  return {
    el,
    update(t) {
      const a = easeOut(span(t, t0, t0 + 0.6));
      const b = t1 === null ? 0 : easeInOut(span(t, t1, t1 + 0.5));
      el.style.opacity = Math.min(a, 1 - b);
      el.style.transform = `translateY(${lerp(22, 0, a) - 14 * b}px)`;
    },
  };
}

/* ---------- flat figure --------------------------------------------
   Head, body, two arms. Gender-neutral, no face. `accent` colours the
   body so a row of them reads as different people. Returns handles so a
   scene can tilt the head or raise an arm. */
export function figure(parent, { x, y, h = 260, accent = BLUE, label = null }) {
  const w = h * 0.62;
  const svg = svgNode('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h }, parent);
  Object.assign(svg.style, { position: 'absolute', left: x + 'px', top: y + 'px', overflow: 'visible' });
  const skin = 'rgba(22,67,86,.30)';
  const head = svgNode('circle', { cx: w / 2, cy: h * 0.14, r: h * 0.12, fill: skin }, svg);
  const body = svgNode('path', {
    d: `M ${w * 0.22} ${h} L ${w * 0.22} ${h * 0.46} Q ${w * 0.22} ${h * 0.30} ${w * 0.40} ${h * 0.30} `
     + `L ${w * 0.60} ${h * 0.30} Q ${w * 0.78} ${h * 0.30} ${w * 0.78} ${h * 0.46} L ${w * 0.78} ${h} Z`,
    fill: accent,
  }, svg);
  const armL = svgNode('rect', { x: w * 0.06, y: h * 0.34, width: w * 0.14, height: h * 0.42, rx: w * 0.07, fill: accent }, svg);
  const armR = svgNode('rect', { x: w * 0.80, y: h * 0.34, width: w * 0.14, height: h * 0.42, rx: w * 0.07, fill: accent }, svg);
  armL.style.transformOrigin = `${w * 0.13}px ${h * 0.36}px`;
  armR.style.transformOrigin = `${w * 0.87}px ${h * 0.36}px`;
  head.style.transformOrigin = `${w / 2}px ${h * 0.26}px`;
  let lab = null;
  if (label) {
    lab = node('div', { text: label, style: {
      position: 'absolute', left: (x - 60) + 'px', top: (y + h + 12) + 'px', width: (w + 120) + 'px',
      textAlign: 'center', fontSize: '22px', fontWeight: 700, color: INK_SOFT, letterSpacing: '.04em',
    }}, parent);
  }
  return {
    svg, head, body, armL, armR, label: lab,
    set({ opacity = 1, x: nx, y: ny, headTilt = 0, armL: aL = 0, armR: aR = 0, scale = 1 } = {}) {
      svg.style.opacity = opacity;
      if (lab) lab.style.opacity = opacity;
      if (nx !== undefined) svg.style.left = nx + 'px';
      if (ny !== undefined) svg.style.top = ny + 'px';
      svg.style.transform = `scale(${scale})`;
      head.style.transform = `rotate(${headTilt}deg)`;
      armL.style.transform = `rotate(${aL}deg)`;
      armR.style.transform = `rotate(${-aR}deg)`;
    },
  };
}

/* ---------- fade at the edges ------------------------------------- */
export function edges(root, t, dur, { inDur = 0.5, outDur = 0.5 } = {}) {
  root.style.opacity = Math.min(span(t, 0, inDur), 1 - span(t, dur - outDur, dur));
}

export { span, lerp, easeOut, easeIn, easeInOut, easeBack, pulse, stagger, clamp, node, svgNode, NAVY, BLUE };
