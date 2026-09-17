/* ===================================================================
   SCENE 11 — "Room to grow"                             4:20 – 4:37

   Deliberately the shortest scene in the film. The build note asks for
   brief and clearly labelled future-facing, so the pitch does not
   overpromise — and the caveat is doing real work here, not softening
   a claim. Naming the governance review is how this capability gets
   mentioned without inheriting the objection.

   Nora is back on camera because a future possibility should come from
   the guide rather than from a caption. She is also, in the live system,
   a real agent identity — which is why "AI on the ticket" is a shape
   Northpointe already has rather than a leap.

   The long thread is the object Scene 10 ended on, compressed here.
=================================================================== */

import {
  node, svgNode, makeNora, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';
import { chip } from '../lib/ui.js';

export const id = 'scene11';
export const title = 'Room to grow';
export const dur = 17.0;
export const visemes = 'data/visemes-scene11.json';

const CUES = [
  [0.30,  8.60, "Down the road, AI could help summarize long support conversations so a manager or teammate can understand a situation quickly."],
  [9.00, 16.20, "That would need careful security and data-governance review, but it shows how this idea could keep growing."],
];

const BLINKS = [2.10, 6.40, 10.80, 14.60];

const SUMMARY = [
  'Access request, opened Monday.',
  'Waiting on the requester since Tuesday.',
  'One step left before it can be closed.',
];

const T = {
  noraIn:   0.25,
  threadIn: 1.40,
  spark:    4.60,
  squash:   5.40,        // the thread compresses
  summary:  6.10,
  tag:      7.00,
  shield:   9.40,
  cluster: 14.60,        // it joins the rest of the idea
};

let root, nora, halo, thread, threadBars = [], sparkle, summary, sumRows = [],
    tag, shieldRow, cluster = [], cc;

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background:
      'radial-gradient(1000px 760px at 62% 40%, rgba(0,134,177,.10), transparent 64%),' +
      'linear-gradient(168deg, #FBFDFE 0%, #E5EFF4 100%)',
  }}, root);

  halo = node('div', { style: {
    position: 'absolute', left: '0px', top: '0px', width: '660px', height: '660px',
    borderRadius: '50%', opacity: 0,
    background: 'radial-gradient(circle at 42% 38%, rgba(0,134,177,.19), rgba(0,134,177,.04) 58%, transparent 72%)',
  }}, root);

  nora = makeNora({ parent: root, left: 0, top: 0, origin: '0% 0%' });

  /* --- the long thread, carried over from Scene 10 ----------------- */
  thread = node('div', { style: {
    position: 'absolute', left: '724px', top: '218px', width: '320px',
    background: '#fff', borderRadius: '16px', padding: '22px',
    boxShadow: '0 24px 58px rgba(14,46,60,.20)', opacity: 0,
    transformOrigin: '50% 50%',
  }}, root);
  for (let i = 0; i < 12; i++) {
    threadBars.push(node('div', { style: {
      height: '16px', marginBottom: '10px', borderRadius: '5px',
      width: (i % 3 === 0 ? '92%' : i % 3 === 1 ? '74%' : '84%'),
      marginLeft: (i % 2 ? '8%' : '0'),
      background: i % 2 ? 'rgba(22,67,86,.40)' : 'rgba(0,134,177,.30)',
    }}, thread));
  }

  sparkle = node('div', { text: '\u2726', style: {
    position: 'absolute', left: '1004px', top: '176px',
    fontSize: '56px', color: BLUE, opacity: 0,
  }}, root);

  /* --- what it becomes --------------------------------------------- */
  tag = node('div', { style: {
    position: 'absolute', left: '724px', top: '244px', opacity: 0,
  }}, root);
  chip(tag, 'Future possibility', 'waiting', 22);

  summary = node('div', { style: {
    position: 'absolute', left: '724px', top: '316px', width: '820px',
    background: '#fff', borderRadius: '18px', borderLeft: '10px solid ' + BLUE,
    padding: '30px 34px', opacity: 0,
    boxShadow: '0 26px 62px rgba(14,46,60,.20)', transformOrigin: '0% 50%',
  }}, root);
  node('div', { text: 'IN THREE LINES', style: {
    fontSize: '16px', letterSpacing: '.18em', color: BLUE,
    fontWeight: 700, marginBottom: '16px',
  }}, summary);
  SUMMARY.forEach(txt => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      padding: '8px 0', opacity: 0,
    }}, summary);
    node('div', { style: {
      width: '9px', height: '9px', borderRadius: '50%', background: BLUE,
      flex: '0 0 auto', marginTop: '12px',
    }}, r);
    node('div', { text: txt, style: {
      fontSize: '27px', lineHeight: 1.35, color: NAVY, fontWeight: 600,
    }}, r);
    sumRows.push(r);
  });

  /* --- the caveat, which is the point of the scene ------------------ */
  shieldRow = node('div', { style: {
    position: 'absolute', left: '724px', top: '612px', width: '900px',
    display: 'flex', alignItems: 'center', gap: '20px', opacity: 0,
  }}, root);
  const sh = svgNode('svg', { viewBox: '0 0 32 32', width: 52, height: 52 }, shieldRow);
  svgNode('path', { d: 'M16 3l11 4v8c0 7.2-4.6 11.8-11 14-6.4-2.2-11-6.8-11-14V7z',
    fill: 'rgba(0,134,177,.10)', stroke: BLUE, 'stroke-width': 2.2,
    'stroke-linejoin': 'round' }, sh);
  svgNode('path', { d: 'M11 16l4 4 7-8', fill: 'none', stroke: BLUE,
    'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sh);
  node('div', { html: 'Only after a careful <b>security and data-governance review</b>.', style: {
    fontSize: '28px', lineHeight: 1.35, color: 'rgba(14,46,60,.72)',
  }}, shieldRow);

  /* --- and it joins the rest of the idea ---------------------------- */
  /* Storyboard: the summary card joins the earlier portal, dashboard and
     automation visuals in one connected composition. Three small cards
     rather than the full panels — this is a reminder, not a recap. */
  [['Portal', 746], ['Dashboard', 1018], ['Automation', 1290]].forEach(([label, x]) => {
    const el = node('div', { text: label, style: {
      position: 'absolute', left: x + 'px', top: '746px',
      width: '250px', padding: '20px 0', textAlign: 'center',
      background: '#fff', borderRadius: '14px', opacity: 0,
      boxShadow: '0 12px 30px rgba(14,46,60,.12)',
      fontSize: '24px', fontWeight: 700, color: 'rgba(14,46,60,.70)',
    }}, root);
    cluster.push(el);
  });

  cc = makeCaptions(root);
  return { cc };
}

export function render(t, track) {
  root.style.opacity = Math.min(span(t, 0, 0.4), 1 - span(t, 16.5, dur));

  /* --- Nora -------------------------------------------------------- */
  const inn = easeOut(span(t, T.noraIn, T.noraIn + 1.0));
  const left = 46, top = 336, scale = 0.58 * lerp(0.985, 1, inn);
  nora.place({ left, top, scale, y: lerp(22, 0, inn), opacity: inn });
  nora.update(t, track, BLINKS);

  const hw = 660;
  halo.style.left = (left + 819 * scale / 2 - hw / 2) + 'px';
  halo.style.top  = (top + 300 * scale - hw / 2 + 150) + 'px';
  halo.style.opacity = String(inn * 0.85);

  /* --- the thread, then the squeeze -------------------------------- */
  const ti = span(t, T.threadIn, T.threadIn + 0.7);
  const sq = easeInOut(span(t, T.squash, T.squash + 0.8));
  thread.style.opacity = String(ti * (1 - sq));
  thread.style.transform =
    `translateY(${lerp(20, 0, easeOut(ti))}px) scaleY(${lerp(1, 0.12, sq)})`;

  const sp = span(t, T.spark, T.spark + 0.5);
  sparkle.style.opacity = String(sp * (1 - span(t, T.summary + 0.4, T.summary + 1.1)));
  sparkle.style.transform =
    `scale(${lerp(0.5, 1, easeBack(sp)) * (1 + pulse(span(t, T.spark + 0.4, T.spark + 1.2)) * 0.22)})`;

  /* --- three lines --------------------------------------------------- */
  const su = span(t, T.summary, T.summary + 0.7);
  summary.style.opacity = su;
  summary.style.transform =
    `scaleX(${lerp(0.42, 1, easeOut(su))}) scaleY(${lerp(0.7, 1, easeOut(su))})`;
  sumRows.forEach((r, i) => {
    r.style.opacity = String(stagger(t, T.summary + 0.45, 0.34, 0.4, i));
  });

  const tg = span(t, T.tag, T.tag + 0.5);
  tag.style.opacity = tg;
  tag.style.transform = `scale(${lerp(0.76, 1, easeBack(tg))})`;

  /* --- the caveat ---------------------------------------------------- */
  const sd = span(t, T.shield, T.shield + 0.7);
  shieldRow.style.opacity = sd;
  shieldRow.style.transform = `translateY(${lerp(16, 0, easeOut(sd))}px)`;

  /* --- joins the rest ------------------------------------------------ */
  cluster.forEach((el, i) => {
    const u = stagger(t, T.cluster, 0.22, 0.5, i);
    el.style.opacity = String(u * 0.95);
    el.style.transform =
      `translateY(${lerp(18, 0, easeOut(u))}px) scale(${lerp(0.9, 1, easeBack(u))})`;
  });
  /* the caveat steps aside so the cluster has the floor */
  shieldRow.style.opacity = String(sd * (1 - span(t, T.cluster - 0.2, T.cluster + 0.5)));

  cc.update(t, CUES);
  return nora.lastShape;
}

export { CUES };
