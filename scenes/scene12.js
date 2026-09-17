/* ===================================================================
   SCENE 12 — "The bigger idea"                          4:37 – 5:10

   The close, and the only scene where the writing has to carry more
   than the animation. Everything recedes for the last six seconds so
   that Nora, at full size, has the frame to herself.

   Runtime note: the storyboard gave this 31 seconds. The sign-off needs
   six of them at a speakable pace, and the build note asks for a
   two-second hold on the final title, which does not fit in 31. It is
   33 here, putting the film at 5:10 rather than 5:08.

   The logo lockup is NOT committed to this repo — brand assets in a
   public repository is a separate decision from code. Drop
   assets/logo-primary-navy.png in and it is used automatically;
   without it the scene falls back to a set wordmark, which is what the
   sample render shows.

   "I'll see you at the help desk" is literal, not a flourish: Nora is a
   real agent identity in the live system.
=================================================================== */

import {
  node, svgNode, makeNora, makeCaptions,
  span, lerp, clamp, stagger, easeOut, easeInOut, easeBack, pulse,
  NAVY, BLUE,
} from '../lib/engine.js';

export const id = 'scene12';
export const title = 'The bigger idea';
export const dur = 33.0;
export const visemes = 'data/visemes-scene12.json';

const CUES = [
  [0.30,  4.60, "That's why this is bigger than a ticketing system."],
  [5.00, 13.80, "It's a customer experience idea, an employee experience idea, and an opportunity to help Northpointe work better together."],
  [14.20,19.00, "It's all of us against the problem, not against each other."],
  [19.40,24.50, "BoldDesk could move us from managing inboxes to managing experiences."],
  [24.90,30.90, "I'm Nora. Thanks for listening — and I'll see you at the help desk."],
];

const BLINKS = [2.40, 7.10, 12.30, 17.50, 22.00, 26.80, 30.20];

/* The three campaign categories this idea actually sits in. */
const WORDS = [
  { t:  6.20, text: 'Customer experience' },
  { t:  8.80, text: 'Employee experience' },
  { t: 11.40, text: 'Operational innovation' },
];

/* Generic roles. No team is named anywhere in this film. */
const PATH = ['Someone asks', 'The team', 'A colleague', 'Their customer'];

const T = {
  noraIn:   0.25,
  aside:    4.80,        // she steps left so the words have room
  pathIn:  14.30,
  unity:   16.80,
  title:   19.60,
  signoff: 24.70,        // everything recedes; she comes back to full size
  endcard: 30.90,        // held two seconds, per the build note
};

let root, nora, halo, words = [], pathNodes = [], pathLinks = [], pathSvg,
    unity, titleEl, endcard, lockupImg, lockupText, cc;

export function build(container) {
  root = container;

  node('div', { style: {
    position: 'absolute', inset: 0,
    background:
      'radial-gradient(1200px 900px at 34% 34%, rgba(0,134,177,.12), transparent 64%),' +
      'linear-gradient(168deg, #FBFDFE 0%, #E4EEF3 100%)',
  }}, root);

  halo = node('div', { style: {
    position: 'absolute', left: '0px', top: '0px', width: '820px', height: '820px',
    borderRadius: '50%', opacity: 0,
    background: 'radial-gradient(circle at 42% 38%, rgba(0,134,177,.22), rgba(0,134,177,.05) 58%, transparent 72%)',
  }}, root);

  nora = makeNora({ parent: root, left: 0, top: 0, origin: '0% 0%' });

  /* --- the three categories ---------------------------------------- */
  WORDS.forEach((w, i) => {
    const el = node('div', { style: {
      position: 'absolute', left: '1000px', top: (286 + i * 132) + 'px',
      opacity: 0,
    }}, root);
    node('div', { text: w.text, style: {
      fontSize: '54px', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap',
    }}, el);
    node('div', { style: {
      marginTop: '14px', height: '5px', width: '0px', borderRadius: '3px',
      background: BLUE,
    }}, el);
    el.rule = el.lastChild;
    words.push(el);
  });

  /* --- the connected path ------------------------------------------- */
  pathSvg = svgNode('svg', { viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, root);
  Object.assign(pathSvg.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });

  const startX = 724, gapX = 320, y = 470;
  PATH.forEach((label, i) => {
    const x = startX + i * gapX;
    const el = node('div', { style: {
      position: 'absolute', left: (x - 130) + 'px', top: (y - 52) + 'px',
      width: '260px', padding: '22px 0', textAlign: 'center',
      background: '#fff', borderRadius: '16px', opacity: 0,
      boxShadow: '0 16px 40px rgba(14,46,60,.14)',
      fontSize: '25px', fontWeight: 700, color: NAVY,
      transformOrigin: '50% 50%',
    }}, root);
    el.textContent = label;
    pathNodes.push(el);

    if (i > 0) {
      const ln = svgNode('line', {
        x1: x - gapX + 132, y1: y, x2: x - 132, y2: y,
        stroke: BLUE, 'stroke-width': 4, 'stroke-linecap': 'round',
        'stroke-opacity': 0,
      }, pathSvg);
      pathLinks.push(ln);
    }
  });

  unity = node('div', { style: {
    position: 'absolute', left: '360px', width: '1200px', top: '646px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'All of us against the problem \u2014 not each other.', style: {
    fontSize: '40px', fontWeight: 700, color: NAVY,
  }}, unity);

  /* --- the title ---------------------------------------------------- */
  titleEl = node('div', { style: {
    position: 'absolute', left: '260px', width: '1400px', top: '214px',
    textAlign: 'center', opacity: 0,
  }}, root);
  node('div', { text: 'From managing inboxes', style: {
    fontSize: '58px', fontWeight: 700, color: 'rgba(14,46,60,.52)',
  }}, titleEl);
  node('div', { text: 'to managing experiences.', style: {
    fontSize: '62px', fontWeight: 700, color: NAVY, marginTop: '6px',
  }}, titleEl);

  /* --- end card ----------------------------------------------------- */
  endcard = node('div', { style: {
    position: 'absolute', inset: 0, opacity: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '40px',
    background: 'linear-gradient(168deg, #FBFDFE 0%, #E4EEF3 100%)',
  }}, root);
  node('div', { text: 'THE NEXT BIG IDEA', style: {
    fontSize: '26px', letterSpacing: '.34em', color: BLUE, fontWeight: 700,
  }}, endcard);
  node('div', { text: 'From managing inboxes to managing experiences.', style: {
    fontSize: '52px', fontWeight: 700, color: NAVY, textAlign: 'center',
  }}, endcard);

  /* The real lockup if it is present locally; a set wordmark if not.
     Brand assets are deliberately absent from this repo. */
  const holder = node('div', { style: {
    marginTop: '26px', height: '86px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}, endcard);
  lockupText = node('div', { text: 'Northpointe Bank', style: {
    fontSize: '44px', fontWeight: 700, color: NAVY, letterSpacing: '.01em',
  }}, holder);
  lockupImg = node('img', { style: { height: '86px', display: 'none' }}, holder);
  lockupImg.onload = () => {
    lockupImg.style.display = 'block';
    lockupText.style.display = 'none';
  };
  lockupImg.src = 'assets/logo-primary-navy.png';

  cc = makeCaptions(root);
  return { cc };
}

export function render(t, track) {
  root.style.opacity = Math.min(span(t, 0, 0.5), 1 - span(t, 32.6, dur));

  /* --- Nora: centre, aside, then centre again at full size ---------- */
  const inn = easeOut(span(t, T.noraIn, T.noraIn + 1.1));
  const aside = easeInOut(span(t, T.aside, T.aside + 1.2));
  const back  = easeInOut(span(t, T.signoff, T.signoff + 1.2));

  /* three placements, blended in order: opening / aside / sign-off */
  const left  = lerp(lerp(524, 92, aside), 596, back);
  const top   = lerp(lerp(150, 330, aside), 116, back);
  const scale = lerp(lerp(0.82, 0.58, aside), 0.86, back) * lerp(0.985, 1, inn);
  nora.place({ left, top, scale, y: lerp(24, 0, inn), opacity: inn });
  nora.update(t, track, BLINKS);

  const hw = 820 * lerp(lerp(1, 0.74, aside), 1.04, back);
  halo.style.width = hw + 'px';
  halo.style.height = hw + 'px';
  halo.style.left = (left + 819 * scale / 2 - hw / 2) + 'px';
  halo.style.top  = (top + 300 * scale - hw / 2 + 180) + 'px';
  halo.style.opacity = String(inn * lerp(lerp(0.95, 0.55, aside), 1, back));

  /* --- the three categories ----------------------------------------- */
  WORDS.forEach((w, i) => {
    const u = span(t, w.t, w.t + 0.6);
    const out = span(t, T.pathIn - 0.4, T.pathIn + 0.4);
    words[i].style.opacity = String(u * (1 - out));
    words[i].style.transform = `translateX(${lerp(26, 0, easeOut(u))}px)`;
    words[i].rule.style.width = (easeOut(span(t, w.t + 0.2, w.t + 0.9)) * 240) + 'px';
  });

  /* --- the path ------------------------------------------------------ */
  pathNodes.forEach((el, i) => {
    const u = stagger(t, T.pathIn, 0.28, 0.5, i);
    const out = span(t, T.signoff - 0.5, T.signoff + 0.4);
    el.style.opacity = String(u * (1 - out));
    el.style.transform =
      `translateY(${lerp(18, 0, easeOut(u))}px) scale(${lerp(0.9, 1, easeBack(u))})`;
  });
  pathLinks.forEach((ln, i) => {
    const u = stagger(t, T.pathIn + 0.30, 0.28, 0.45, i);
    const out = span(t, T.signoff - 0.5, T.signoff + 0.4);
    ln.setAttribute('stroke-opacity', String(u * 0.85 * (1 - out)));
  });

  const un = span(t, T.unity, T.unity + 0.8);
  unity.style.opacity = un * (1 - span(t, T.title - 0.3, T.title + 0.4));
  unity.style.transform = `translateY(${lerp(16, 0, easeOut(un))}px)`;

  /* --- the title ----------------------------------------------------- */
  const ti = span(t, T.title, T.title + 1.0);
  titleEl.style.opacity = ti * (1 - span(t, T.signoff - 0.5, T.signoff + 0.4));
  titleEl.style.transform = `translateY(${lerp(-20, 0, easeOut(ti))}px)`;

  /* --- the end card, held ------------------------------------------- */
  /* Build note: hold the final title for two seconds. The endcard covers
     the frame from 30.9 to 33.0 and nothing moves inside it. */
  const ec = span(t, T.endcard, T.endcard + 0.7);
  endcard.style.opacity = ec;

  cc.update(t, CUES);
  return nora.lastShape;
}

export { CUES };
