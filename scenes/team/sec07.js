/* ===================================================================
   sec07 — "Knowledge that works for everyone"                  27.8s

   The knowledge-base beat from scene06, given its own room.

   The honesty decision carries over: the knowledge base is empty today,
   so the panel opens EMPTY and fills. Four generic articles land one
   per noun the narration names — articles, tips, answers, self-service
   — each with a coloured team dot and no team name. Then the same
   question stacks up three times beside the portal and collapses into
   ONE article, and a strip of reader dots lights up under it: answered
   once, read by many.

   Every number below is read from data/words-sec07.json /
   data/cues-sec07.json (where Ava actually says the phrase) and kept
   as a constant so a beat can be re-timed in one place.
=================================================================== */

import {
  paper, titleCard, loadCues, captions, onScreen, edges,
  node, svgNode, span, lerp, clamp, easeOut, easeInOut, easeBack, NAVY, BLUE, INK, INK_SOFT,
} from '../../lib/section.js';
import { stagger, pulse } from '../../lib/engine.js';

export const id = 'sec07';
export const title = 'Knowledge that works for everyone';
export const dur = 37.3;
export const visemes = null;

const CUES = loadCues('data/cues-sec07.json');

/* ---------- beats (seconds, local) --------------------------------- */
const T = {
  cardOut:  3.00,   // title card (hold 2.40 + 0.60 out) has left the frame
  shellIn:  2.55,   // "The portal can also give us..." (0.90–) -> shell rises under the card
  tiles:    3.00,   //                                   -> three tiles, .3 apart
  forward:  4.75,   // "a shared"                        -> Knowledge base tile comes forward
  kbOpen:   5.20,   // "knowledge base"                  -> and opens, empty
  emptyOut: 7.90,   // "contribute"                      -> the empty state gives way
  articles: 8.35,   // "articles"                        -> first article
  tips:     9.58,   // "tips"                            -> second
  answers: 10.73,   // "answers"                         -> third
  self:    11.73,   // "self-service"                    -> fourth
  same:    16.48,   // "the same question"               -> bubble 1
  over1:   17.32,   // "over"                            -> bubble 2
  over2:   17.72,   // "and over"                        -> bubble 3
  collapse: 18.60,  // "a team can answer it"            -> the three fold into one
  once:    19.57,   // "once"                            -> the one article lands
  readers: 20.76,   // "make that knowledge available to everyone" -> reader dots
  line:    23.30,   // "What one team knows..."          -> on-screen line
};

const SH = { x: 160, y: 130, w: 1000, h: 760 };

const TILES = [
  { label: 'New request',    sub: 'Start something',      glyph: 'plus' },
  { label: 'My requests',    sub: 'See what’s open', glyph: 'list' },
  { label: 'Knowledge base', sub: 'Find an answer',       glyph: 'book' },
];

/* One per noun. The accent colours stand in for "different teams wrote
   these" without naming any team. */
const ARTICLES = [
  { t: T.articles, kind: 'Article',       title: 'How to request access',     accent: '#0086B1' },
  { t: T.tips,     kind: 'Tip',           title: 'Five things worth knowing', accent: '#164356' },
  { t: T.answers,  kind: 'Common answer', title: 'Why a request is paused',   accent: '#3B8A5E' },
  { t: T.self,     kind: 'Self-service',  title: 'Reset it yourself',         accent: '#6C5FA7' },
];
const ONE = { kind: 'Answered once', title: 'Same question', accent: '#0086B1' };

const BUBBLES = [T.same, T.over1, T.over2];
/* where the bubbles sit, and where they fold to (the one article) */
const BUB = { x: 1250, y: 560, w: 330, h: 92, dx: 24, dy: -76 };  // each new one sits above the last
const FOLD = { x: 280, y: 640 };

let root, card, cc, line,
    shell, tileRow, tiles = [], kb, kbEmpty, articleEls = [], oneEl,
    readers, readLabel, readerDots = [], bubbles = [];

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

function article(parent, a) {
  const el = node('div', { style: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '12px 18px', marginBottom: '8px',
    background: '#F7FBFC', borderRadius: '10px',
    borderLeft: '5px solid ' + a.accent, opacity: 0, transformOrigin: '0 50%',
  }}, parent);
  node('div', { style: {
    width: '16px', height: '16px', borderRadius: '50%', background: a.accent, flex: '0 0 auto',
  }}, el);
  node('div', { text: a.title, style: { fontSize: '23px', fontWeight: 700, color: NAVY }}, el);
  node('div', { text: a.kind.toUpperCase(), style: {
    marginLeft: 'auto', fontSize: '14px', fontWeight: 700, letterSpacing: '.14em',
    color: a.accent, whiteSpace: 'nowrap',
  }}, el);
  return el;
}

export function build(container) {
  root = container;
  paper(root);

  /* --- portal shell -------------------------------------------------- */
  shell = node('div', { style: {
    position: 'absolute', left: SH.x + 'px', top: SH.y + 'px',
    width: SH.w + 'px', height: SH.h + 'px', background: '#F7FBFC',
    borderRadius: '22px', boxShadow: '0 32px 78px rgba(14,46,60,.20)',
    overflow: 'hidden', opacity: 0,
  }}, root);

  const head = node('div', { style: { height: '150px', background: NAVY, padding: '30px 44px 0' }}, shell);
  node('div', { text: 'How can we help you?', style: {
    fontSize: '34px', fontWeight: 700, color: '#fff', marginBottom: '16px',
  }}, head);
  const search = node('div', { style: {
    height: '54px', background: '#fff', borderRadius: '10px',
    display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px',
  }}, head);
  const mag = svgNode('svg', { viewBox: '0 0 24 24', width: 22, height: 22 }, search);
  svgNode('circle', { cx: 10.5, cy: 10.5, r: 6.5, fill: 'none', stroke: 'rgba(22,67,86,.45)', 'stroke-width': 2.2 }, mag);
  svgNode('path', { d: 'M15.5 15.5L21 21', stroke: 'rgba(22,67,86,.45)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, mag);
  node('div', { text: 'Search articles', style: { fontSize: '20px', color: 'rgba(22,67,86,.42)' }}, search);

  const body = node('div', { style: { padding: '34px 44px', position: 'relative' }}, shell);

  tileRow = node('div', { style: { display: 'flex', gap: '26px' }}, body);
  TILES.forEach(spec => {
    const tl = node('div', { style: {
      flex: '1 1 0', height: '150px', background: '#fff', borderRadius: '16px',
      boxShadow: '0 12px 30px rgba(14,46,60,.12)',
      padding: '22px 24px', opacity: 0, transformOrigin: '50% 50%',
    }}, tileRow);
    glyph(spec.glyph, tl, BLUE);
    node('div', { text: spec.label, style: { marginTop: '10px', fontSize: '26px', fontWeight: 700, color: NAVY }}, tl);
    node('div', { text: spec.sub, style: { fontSize: '19px', color: 'rgba(14,46,60,.52)' }}, tl);
    tiles.push(tl);
  });

  /* --- the knowledge base panel, which starts empty ------------------ */
  kb = node('div', { style: {
    position: 'absolute', left: '44px', right: '44px', top: '200px',
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 16px 40px rgba(14,46,60,.14)',
    padding: '22px 30px', opacity: 0, transformOrigin: '50% 0%',
  }}, body);
  node('div', { text: 'KNOWLEDGE BASE', style: {
    fontSize: '16px', letterSpacing: '.18em', color: BLUE, fontWeight: 700, marginBottom: '16px',
  }}, kb);

  /* the honest starting point */
  kbEmpty = node('div', { style: { textAlign: 'center', padding: '34px 0 30px' }}, kb);
  node('div', { text: 'Nothing here yet.', style: {
    fontSize: '30px', fontWeight: 700, color: 'rgba(14,46,60,.46)',
  }}, kbEmpty);
  node('div', { text: 'Every team can add to it.', style: {
    fontSize: '21px', color: 'rgba(14,46,60,.40)', marginTop: '8px',
  }}, kbEmpty);

  const list = node('div', {}, kb);
  ARTICLES.forEach(a => articleEls.push(article(list, a)));
  oneEl = article(list, ONE);

  /* readers: one answer, many people who never had to ask */
  readers = node('div', { style: {
    display: 'flex', gap: '9px', alignItems: 'center', marginTop: '10px', paddingLeft: '18px',
  }}, kb);
  readLabel = node('div', { text: 'read by', style: {
    fontSize: '19px', color: 'rgba(14,46,60,.45)', marginRight: '6px', opacity: 0,
  }}, readers);
  for (let i = 0; i < 16; i++) {
    readerDots.push(node('div', { style: {
      width: '20px', height: '20px', borderRadius: '50%',
      background: 'rgba(0,134,177,.42)', opacity: 0, flex: '0 0 auto',
    }}, readers));
  }

  /* --- the same question, three times ------------------------------- */
  BUBBLES.forEach((_, i) => {
    const b = node('div', { style: {
      position: 'absolute', left: (BUB.x + i * BUB.dx) + 'px', top: (BUB.y + i * BUB.dy) + 'px',
      width: BUB.w + 'px', height: BUB.h + 'px', background: '#fff', borderRadius: '18px',
      boxShadow: '0 16px 36px rgba(14,46,60,.16)', opacity: 0,
      display: 'flex', alignItems: 'center', gap: '16px', padding: '0 26px',
      transformOrigin: '0 100%',
    }}, root);
    /* a tail, so it reads as someone asking */
    node('div', { style: {
      position: 'absolute', left: '26px', bottom: '-12px', width: '24px', height: '24px',
      background: '#fff', transform: 'rotate(45deg)', borderRadius: '4px',
    }}, b);
    node('div', { text: '?', style: {
      width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,134,177,.14)',
      color: BLUE, fontSize: '26px', fontWeight: 700, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
    }}, b);
    node('div', { text: 'Same question', style: { fontSize: '26px', fontWeight: 700, color: NAVY }}, b);
    bubbles.push(b);
  });

  line = onScreen(root, { text: 'Answer once. Everyone benefits.', y: 40, size: 46, t0: T.line });

  card = titleCard(root, { n: 7, title: 'Knowledge that works for everyone' });
  cc = captions(root);
  return { cc };
}

export function render(t) {
  edges(root, t, dur);
  card.update(t);

  /* --- the shell rises under the card -------------------------------- */
  const si = span(t, T.shellIn, T.shellIn + 0.7);
  shell.style.opacity = si;
  shell.style.transform = `translateY(${lerp(26, 0, easeOut(si))}px)`;

  /* --- tiles; the third comes forward, then becomes the panel -------- */
  const ko = span(t, T.kbOpen, T.kbOpen + 0.8);
  const k = easeInOut(ko);
  const fw = easeOut(span(t, T.forward, T.forward + 0.45));
  tiles.forEach((tl, i) => {
    const u = stagger(t, T.tiles, 0.30, 0.5, i);
    if (i < 2) {
      tl.style.opacity = String(u * (1 - span(t, T.kbOpen, T.kbOpen + 0.45)));
      tl.style.transform = `translateY(${lerp(20, 0, easeOut(u))}px) scale(${lerp(0.92, 1, easeBack(u))})`;
    } else {
      /* forward: a little larger, a ring; open: it grows into the panel */
      tl.style.opacity = String(u * (1 - ko));
      tl.style.transform =
        `translateY(${lerp(20, 0, easeOut(u)) + k * 60}px) scale(${lerp(0.92, 1, easeBack(u)) + fw * 0.06 + k * 0.25})`;
      tl.style.boxShadow = `0 ${12 + fw * 10}px ${30 + fw * 16}px rgba(14,46,60,${.12 + fw * .08}), ` +
                           `0 0 0 ${(fw * 4).toFixed(1)}px rgba(0,134,177,${(fw * .55 * (1 - ko)).toFixed(2)})`;
    }
  });

  /* --- the panel rises into the tiles' place, empty ------------------ */
  kb.style.top = lerp(200, 34, k) + 'px';
  kb.style.opacity = String(span(t, T.kbOpen + 0.2, T.kbOpen + 0.8));

  const eo = span(t, T.emptyOut, T.emptyOut + 0.5);
  kbEmpty.style.opacity = String(1 - eo);
  kbEmpty.style.display = eo >= 1 ? 'none' : 'block';

  /* --- articles, one per noun ---------------------------------------- */
  ARTICLES.forEach((a, i) => {
    const u = span(t, a.t, a.t + 0.45);
    articleEls[i].style.opacity = u;
    articleEls[i].style.transform = `translateX(${lerp(26, 0, easeOut(u))}px)`;
  });

  /* --- the same question, three times, folding into one -------------- */
  const fold = easeInOut(span(t, T.collapse, T.once));
  bubbles.forEach((b, i) => {
    const u = span(t, BUBBLES[i], BUBBLES[i] + 0.4);
    const x0 = BUB.x + i * BUB.dx, y0 = BUB.y + i * BUB.dy;
    const dx = (FOLD.x - x0) * fold, dy = (FOLD.y - y0) * fold;
    b.style.opacity = String(u * (1 - span(t, T.collapse + 0.45, T.once)));
    b.style.transform =
      `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${lerp(lerp(0.7, 1, easeBack(u)), 0.35, fold)})`;
  });

  const on = span(t, T.once - 0.25, T.once + 0.3);
  const bump = pulse(span(t, T.once, T.once + 0.6));
  oneEl.style.opacity = on;
  oneEl.style.transform = `translateX(${lerp(-26, 0, easeOut(on))}px) scale(${1 + bump * 0.03})`;
  oneEl.style.boxShadow = `0 0 0 ${(bump * 4).toFixed(1)}px rgba(0,134,177,${(bump * .5).toFixed(2)})`;

  /* --- read by many ---------------------------------------------------- */
  readLabel.style.opacity = String(span(t, T.readers, T.readers + 0.4));
  readerDots.forEach((d, i) => {
    const u = stagger(t, T.readers + 0.2, 0.07, 0.3, i);
    d.style.opacity = String(u * 0.95);
    d.style.transform = `scale(${lerp(0.4, 1, easeBack(u))})`;
  });

  line.update(t);

  cc.update(t, CUES);
  return `shell ${si.toFixed(2)} kb ${ko.toFixed(2)} fold ${fold.toFixed(2)}`;
}
