/* ===================================================================
   ui.js — the pieces that appear in more than one scene.

   Rebuilt from reference rather than screenshotted: the real product's
   vocabulary and field structure, none of its data. Every name, subject
   and number here is invented.

   Each factory returns handles to the parts a scene needs to animate,
   so scenes never reach into the DOM by selector.
=================================================================== */

import { node, svgNode, NAVY, BLUE } from './engine.js';

/* Status tones. The two that matter most are the same state seen from
   two sides: the agent sees "Waiting for Customer Response", the person
   who asked sees "Awaiting your reply". */
export const TONE = {
  open:    { bg: 'rgba(0,134,177,.12)',  fg: '#0A6E90' },
  waiting: { bg: 'rgba(214,150,42,.16)', fg: '#8A5D10' },
  closed:  { bg: 'rgba(22,67,86,.10)',   fg: 'rgba(22,67,86,.72)' },
};

export function chip(parent, text, tone = 'open', size = 22) {
  const t = TONE[tone] || TONE.open;
  return node('div', { text, style: {
    display: 'inline-block', padding: `${size * 0.32}px ${size * 0.72}px`,
    borderRadius: '999px', background: t.bg, color: t.fg,
    fontSize: size + 'px', fontWeight: 700, whiteSpace: 'nowrap',
  }}, parent);
}

export function panelLabel(parent, text, x, y) {
  return node('div', { text, style: {
    position: 'absolute', left: x + 'px', top: y + 'px',
    fontSize: '22px', fontWeight: 700, letterSpacing: '.16em',
    color: 'rgba(22,67,86,.50)', opacity: 0,
  }}, parent);
}

/* ---------- email ---------------------------------------------------
   What the person asking for help sees. Deliberately plain: the whole
   argument of Scene 5 is that this side does not change. */
export function emailCard(parent, { x, y, w = 560, from, subject, body }) {
  const el = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px',
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 18px 44px rgba(14,46,60,.14)',
    padding: '28px 32px', opacity: 0,
  }}, parent);

  const head = node('div', { style: {
    display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px',
  }}, el);
  node('div', { style: {
    width: '46px', height: '46px', borderRadius: '50%',
    background: 'rgba(0,134,177,.14)', flex: '0 0 auto',
  }}, head);
  const meta = node('div', {}, head);
  node('div', { text: from, style: {
    fontSize: '23px', fontWeight: 700, color: NAVY,
  }}, meta);
  node('div', { text: 'to Support', style: {
    fontSize: '19px', color: 'rgba(14,46,60,.50)',
  }}, meta);

  node('div', { text: subject, style: {
    fontSize: '28px', fontWeight: 700, color: NAVY, marginBottom: '12px',
  }}, el);
  const bodyEl = node('div', { text: body, style: {
    fontSize: '22px', lineHeight: 1.45, color: 'rgba(14,46,60,.66)',
  }}, el);

  const footer = node('div', { style: {
    marginTop: '20px', paddingTop: '18px',
    borderTop: '1px solid rgba(22,67,86,.10)', opacity: 0,
  }}, el);

  return { el, body: bodyEl, footer };
}

/* ---------- ticket --------------------------------------------------
   What the team sees. Rows are created hidden; a scene reveals only the
   ones its narration actually names — the storyboard's build note asks
   for exactly that, and a card that fills in all at once reads as a
   feature list rather than an idea. */
export function ticketCard(parent, { x, y, w = 600, title, ref = '#1042' }) {
  const el = node('div', { style: {
    position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px',
    background: '#fff', borderRadius: '20px', borderLeft: '10px solid ' + BLUE,
    boxShadow: '0 24px 60px rgba(14,46,60,.18)',
    padding: '30px 34px', opacity: 0,
  }}, parent);

  const top = node('div', { style: {
    display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '10px',
  }}, el);
  node('div', { text: 'TICKET ' + ref, style: {
    fontSize: '17px', letterSpacing: '.18em', color: BLUE, fontWeight: 700,
  }}, top);

  node('div', { text: title, style: {
    fontSize: '32px', fontWeight: 700, color: NAVY, marginBottom: '20px',
  }}, el);

  /* property rows — each hidden until its moment */
  const rows = {};
  function row(key, label, build) {
    const r = node('div', { style: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0', borderTop: '1px solid rgba(22,67,86,.10)',
      opacity: 0,
    }}, el);
    node('div', { text: label, style: {
      fontSize: '21px', color: 'rgba(14,46,60,.55)',
    }}, r);
    const right = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '12px',
    }}, r);
    build(right);
    rows[key] = r;
  }

  row('owner', 'Assignee', right => {
    node('div', { style: {
      width: '34px', height: '34px', borderRadius: '50%',
      background: 'rgba(0,134,177,.20)',
    }}, right);
    node('div', { text: 'Support / Owner', style: {
      fontSize: '21px', fontWeight: 700, color: NAVY,
    }}, right);
  });

  row('status', 'Status', right => {
    rows.statusChip = chip(right, 'Open', 'open', 20);
  });

  row('due', 'Resolution due', right => {
    node('div', { text: 'Within target', style: {
      fontSize: '21px', fontWeight: 700, color: NAVY,
    }}, right);
  });

  /* activity history — the "documented" part */
  const hist = node('div', { style: {
    marginTop: '18px', paddingTop: '18px',
    borderTop: '1px solid rgba(22,67,86,.10)', opacity: 0,
  }}, el);
  node('div', { text: 'ACTIVITY', style: {
    fontSize: '15px', letterSpacing: '.18em', color: 'rgba(14,46,60,.42)',
    fontWeight: 700, marginBottom: '14px',
  }}, hist);
  const histRows = [];
  ['Request received', 'Assigned to the team', 'Reply sent'].forEach(txt => {
    const r = node('div', { style: {
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '6px 0', opacity: 0,
    }}, hist);
    node('div', { style: {
      width: '10px', height: '10px', borderRadius: '50%', background: BLUE,
      flex: '0 0 auto',
    }}, r);
    node('div', { text: txt, style: {
      fontSize: '20px', color: 'rgba(14,46,60,.66)',
    }}, r);
    histRows.push(r);
  });

  return { el, rows, hist, histRows };
}
