/* ===================================================================
   engine.js — the parts every scene needs.

   Nothing in here knows about any particular scene. A scene is an object
   { id, title, dur, build(root), render(t) } where t is LOCAL to that
   scene, counting from zero. index.html owns the master clock and hands
   each scene its own local time, so a scene can be previewed in
   isolation or as part of the whole film without changing a line.
=================================================================== */

export const NAVY = '#164356';
export const BLUE = '#0086B1';

/* ---------- math -------------------------------------------------- */
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp  = (a, b, u) => a + (b - a) * u;
/* progress through [t0,t1], clamped to 0..1 — the workhorse */
export const span  = (t, t0, t1) => clamp((t - t0) / (t1 - t0));

export const easeOut    = u => 1 - Math.pow(1 - u, 3);
export const easeIn     = u => u * u * u;
export const easeInOut  = u => u < .5 ? 4*u*u*u : 1 - Math.pow(-2*u + 2, 3) / 2;
export const easeBack   = u => { const c = 1.42; return 1 + (c+1)*Math.pow(u-1,3) + c*Math.pow(u-1,2); };
/* one up-and-back-down pulse across [0,1] */
export const pulse      = u => Math.sin(clamp(u) * Math.PI);

/* Staggered reveals: item i of n, each taking `each` seconds, starting
   `gap` apart from t0. Returns 0..1 for that item. */
export const stagger = (t, t0, gap, each, i) => span(t, t0 + i * gap, t0 + i * gap + each);

/* ---------- tiny DOM builder -------------------------------------- */
export function node(tag, opts = {}, parent = null) {
  const n = document.createElement(tag);
  if (opts.cls) n.className = opts.cls;
  if (opts.text) n.textContent = opts.text;
  if (opts.html) n.innerHTML = opts.html;
  if (opts.style) Object.assign(n.style, opts.style);
  if (parent) parent.appendChild(n);
  return n;
}

export function svgNode(tag, attrs = {}, parent = null) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

/* ===================================================================
   NORA

   The cutout is 819x1063 native, and everything about her mouth is
   authored in those pixel coordinates. The overlay SVG uses the same
   viewBox, so the drawn mouth and the baked-in face can never drift.

   Her mouth is a single glowing stroke on a sealed faceplate — no jaw,
   no lips, no eyelids. That is exactly what a landmark-based avatar
   model needs and cannot find, and exactly why doing it ourselves is
   cheap: the whole mouth is four numbers.
=================================================================== */

export const NORA_W = 819;
export const NORA_H = 1063;
const CX = 404;                 // mouth centre x
const FACEPLATE = '#082B4E';    // measured, the flat area around the mouth

/* The faceplate runs from about y=300 to y=558 on the centre line, so an
   open mouth has room down to roughly y=540. These use that room: at
   1080p her face is only ~380px wide in frame, and a mouth that travels
   15px reads as not moving at all. */
const SHAPES = {
  rest:   { hw: 62, endY: 470, upY: 503, dnY: 503 },  // the shipped smile
  closed: { hw: 56, endY: 477, upY: 493, dnY: 493 },  // p b m
  small:  { hw: 50, endY: 474, upY: 482, dnY: 512 },  // d t n s z l r k g f v
  mid:    { hw: 47, endY: 476, upY: 464, dnY: 532 },  // ae uh eh
  wide:   { hw: 44, endY: 478, upY: 452, dnY: 538 },  // ah ow
  round:  { hw: 27, endY: 484, upY: 458, dnY: 530 },  // oo oh w
  ee:     { hw: 68, endY: 470, upY: 478, dnY: 500 },  // ee ih y
  shh:    { hw: 35, endY: 480, upY: 464, dnY: 518 },  // sh ch j zh
};

/* Azure ships 22 viseme IDs; Nora needs eight shapes. If a sound looks
   wrong in a render, this table is the only thing to change. */
const VISEME_TO_SHAPE = {
  0:'rest',  1:'mid',   2:'wide',  3:'round', 4:'mid',   5:'mid',
  6:'ee',    7:'round', 8:'round', 9:'wide', 10:'round',11:'mid',
 12:'small',13:'small',14:'small',15:'small',16:'shh',  17:'small',
 18:'small',19:'small',20:'small',21:'closed',
};

export const MOUTH_GAIN = 1.0;       // overall travel
const BLEND = 0.055;                 // cross-fade into each new shape
export const VISEME_OFFSET_MS = 0;   // global nudge; calibrate once

function gain(s) {
  const mid = (s.upY + s.dnY) / 2;
  const half = (s.dnY - s.upY) / 2 * MOUTH_GAIN;
  return { hw: s.hw, endY: s.endY, upY: mid - half, dnY: mid + half };
}

function blend(a, b, u) {
  return {
    hw:   lerp(a.hw,   b.hw,   u),
    endY: lerp(a.endY, b.endY, u),
    upY:  lerp(a.upY,  b.upY,  u),
    dnY:  lerp(a.dnY,  b.dnY,  u),
  };
}

function path(s) {
  const { hw, endY, upY, dnY } = s;
  const x0 = CX - hw, x1 = CX + hw, k = hw * 0.46;
  return `M ${x0} ${endY} C ${CX-k} ${upY} ${CX+k} ${upY} ${x1} ${endY} `
       + `C ${CX+k} ${dnY} ${CX-k} ${dnY} ${x0} ${endY} Z`;
}

/* Visemes arrive as instants, but a mouth takes time to get there.
   Cross-fade, capped so fast speech doesn't turn to mush. */
function mouthAt(track, t) {
  const tt = t + VISEME_OFFSET_MS / 1000;
  let i = -1;
  for (let k = 0; k < track.length; k++) {
    if (track[k].t <= tt) i = k; else break;
  }
  if (i < 0) return { shape: gain(SHAPES.rest), name: 'rest' };
  const cur = track[i], prev = i > 0 ? track[i - 1] : track[i];
  const a = SHAPES[VISEME_TO_SHAPE[prev.id] ?? 'rest'];
  const b = SHAPES[VISEME_TO_SHAPE[cur.id]  ?? 'rest'];
  const cap = Math.min(BLEND, Math.max(0.001, cur.t - prev.t));
  return { shape: gain(blend(a, b, easeOut(clamp((tt - cur.t) / cap)))),
           name: VISEME_TO_SHAPE[cur.id] ?? 'rest' };
}

/* Blinks are two faceplate-coloured shutters closing over the eye glow,
   which reads as the light switching off rather than an eyelid — right
   for a screen face. Placed by hand per scene: a robot blinking on a
   timer looks like a timer. */
export function makeNora({ parent, left, top, scale = 1, origin = '50% 90%' }) {
  const wrap = node('div', { style: {
    position: 'absolute', left: left + 'px', top: top + 'px',
    width: NORA_W + 'px', height: NORA_H + 'px',
    transformOrigin: origin,
  }}, parent);

  const img = node('img', { style: { display: 'block', width: NORA_W + 'px', height: NORA_H + 'px' }}, wrap);
  img.src = 'assets/nora.png';
  img.alt = 'Nora';

  const svg = svgNode('svg', {
    viewBox: `0 0 ${NORA_W} ${NORA_H}`, width: NORA_W, height: NORA_H,
  }, wrap);
  Object.assign(svg.style, { position: 'absolute', inset: 0 });

  const defs = svgNode('defs', {}, svg);
  /* Soft-edged patch in the faceplate's own colour, hiding the mouth
     baked into the PNG. Measured #082C4F with a slight vertical falloff,
     so a radial gradient covers it without leaving a seam. */
  const rg = svgNode('radialGradient', { id: 'np-patch', cx: '50%', cy: '50%', r: '50%' }, defs);
  svgNode('stop', { offset: '0%',   'stop-color': '#092D52' }, rg);
  svgNode('stop', { offset: '62%',  'stop-color': FACEPLATE }, rg);
  svgNode('stop', { offset: '100%', 'stop-color': FACEPLATE, 'stop-opacity': '0' }, rg);

  const f = svgNode('filter', { id: 'np-glow', x: '-70%', y: '-70%', width: '240%', height: '240%' }, defs);
  svgNode('feGaussianBlur', { stdDeviation: '7', result: 'b1' }, f);
  svgNode('feGaussianBlur', { stdDeviation: '16', in: 'SourceGraphic', result: 'b2' }, f);
  const mg = svgNode('feMerge', {}, f);
  svgNode('feMergeNode', { in: 'b2' }, mg);
  svgNode('feMergeNode', { in: 'b1' }, mg);
  svgNode('feMergeNode', { in: 'SourceGraphic' }, mg);

  svgNode('ellipse', { cx: 404, cy: 490, rx: 104, ry: 52, fill: 'url(#np-patch)' }, svg);
  const g = svgNode('g', { filter: 'url(#np-glow)' }, svg);
  const mouth = svgNode('path', {
    d: '', fill: '#04182F', 'fill-opacity': 0, stroke: '#3FE6FF',
    'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  }, g);
  const lidL = svgNode('rect', { x: 248, y: 303, width: 88, height: 0, fill: FACEPLATE }, svg);
  const lidR = svgNode('rect', { x: 477, y: 303, width: 88, height: 0, fill: FACEPLATE }, svg);

  return {
    wrap,
    lastShape: 'rest',
    /* t is scene-local; track is that scene's viseme array */
    update(t, track, blinks = []) {
      const m = mouthAt(track || [], t);
      this.lastShape = m.name;
      mouth.setAttribute('d', path(m.shape));
      const open = clamp((m.shape.dnY - m.shape.upY) / 88);
      mouth.setAttribute('fill-opacity', (open * 0.92).toFixed(3));
      mouth.setAttribute('stroke-width', lerp(9, 6.5, open).toFixed(2));

      let bl = 0;
      for (const b of blinks) {
        const u = (t - b) / 0.15;
        if (u >= 0 && u <= 1) { bl = pulse(u); break; }
      }
      lidL.setAttribute('height', (bl * 118).toFixed(1));
      lidR.setAttribute('height', (bl * 118).toFixed(1));
    },
    place({ left, top, scale, y = 0, opacity = 1 }) {
      if (left !== undefined) wrap.style.left = left + 'px';
      if (top !== undefined) wrap.style.top = top + 'px';
      wrap.style.transform = `translateY(${y}px) scale(${scale ?? 1})`;
      wrap.style.opacity = opacity;
    },
  };
}

/* ===================================================================
   CAPTIONS
   A scene's cue list doubles as its narration record. Off by default;
   ?cc=1 burns them in, which the storyboard's review checklist asks for.
=================================================================== */
export function makeCaptions(parent) {
  const box = node('div', { style: {
    position: 'absolute', left: 0, right: 0, bottom: '64px',
    textAlign: 'center', padding: '0 220px', opacity: 0,
  }}, parent);
  const sp = node('span', { style: {
    display: 'inline-block', background: 'rgba(14,46,60,.88)', color: '#fff',
    fontSize: '34px', lineHeight: 1.35, padding: '14px 26px', borderRadius: '10px',
  }}, box);
  return {
    update(t, cues) {
      const c = cues.find(c => t >= c[0] && t < c[1]);
      sp.textContent = c ? c[2] : '';
      box.style.opacity = c ? 1 : 0;
    },
    setVisible(v) { box.style.display = v ? 'block' : 'none'; },
  };
}
