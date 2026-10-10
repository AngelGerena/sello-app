// Scope the finesse-tap-card engine CSS + worship skins under .tpl-ws for OKUNAMI.
import fs from 'fs';
import postcss from 'postcss';
const SRC = '/tmp/ws/okunami-worship-skins';
const files = [
  ['engine', `${SRC}/reference-engine/css/style.css`],
  ['features', `${SRC}/skins/engine-features.css`],
  ['skins', `${SRC}/skins/worship-skins.css`],
  ['brand', `${SRC}/skins/nora-brand-tokens.css`],
];
// Literal gold / purple / cream values -> brand variables, so every kit recolors the skins.
const HEX = {
  '#FCC004': 'var(--gold-1)', '#F7C63A': 'var(--gold-2)', '#F2CD5C': 'var(--gold-2)', '#F5D46A': 'var(--gold-2)', '#FCD34D': 'var(--gold-2)',
  '#E7C24A': 'var(--gold-2)', '#EFC54E': 'var(--gold-2)', '#FCEDBA': 'var(--gold-3)', '#F4D77A': 'var(--gold-3)', '#9C7A1C': 'var(--gold-4)', '#86610C': 'var(--gold-4)',
  '#5B2F86': 'var(--plum-1)', '#5A2D8C': 'var(--plum-1)', '#2A1440': 'var(--plum-2)', '#3A1B5E': 'var(--plum-2)', '#24103A': 'var(--plum-ink)',
  '#7B3AB8': 'var(--plum-3)', '#7B3A9E': 'var(--plum-3)', '#B57BE8': 'var(--plum-4)', '#D9B8FF': 'var(--plum-4)', '#2E2470': 'var(--plum-2)',
  '#3E1F58': 'var(--plum-2)', '#3A1C4E': 'var(--plum-2)', '#4A2372': 'var(--plum-1)', '#7A43A8': 'var(--plum-3)', '#C9901E': 'var(--gold-4)',
  '#120A20': 'var(--plum-ink)', '#07050C': 'var(--plum-ink)', '#FFF4D2': 'var(--cream)', '#FAF6EA': 'var(--cream)', '#FFF6DA': 'var(--cream)',
};
const RGBA = [
  [/rgba\(\s*(252,\s*192,\s*4|252,\s*196,\s*30|247,\s*198,\s*58|255,\s*236,\s*170|252,\s*192,\s*4)\s*,\s*([\d.]+)\s*\)/g, '--gold-1'],
  [/rgba\(\s*(62,\s*28,\s*92|58,\s*28,\s*78|91,\s*47,\s*134)\s*,\s*([\d.]+)\s*\)/g, '--plum-1'],
  [/rgba\(\s*(30,\s*10,\s*45|28,\s*16,\s*44|26,\s*12,\s*44|8,\s*5,\s*14)\s*,\s*([\d.]+)\s*\)/g, '--plum-ink'],
];
function recolor(v) {
  let out = v.replace(/#[0-9A-Fa-f]{6}\b/g, (h) => HEX[h.toUpperCase()] ?? h);
  for (const [re, name] of RGBA) out = out.replace(re, (_m, _c, a) => `color-mix(in srgb, var(${name}) ${Math.round(parseFloat(a) * 100)}%, transparent)`);
  return out;
}
const ROOT = '.tpl-ws';
const keyframes = new Set();

function scopeSelector(sel) {
  let s = sel.trim();
  if (/data-theme="light"\]/.test(s) && !/:not\(\[data-theme="light"\]\)/.test(s)) return null; // light-only rules
  s = s.replace(/:root:not\(\[data-theme="light"\]\)/g, ':root').replace(/:root\[data-theme="dark"\]/g, ':root').replace(/\[data-theme="dark"\]/g, '');
  // ids and classes -> w- prefixed classes
  s = s.replace(/#([A-Za-z][\w-]*)/g, '.w-id-$1').replace(/\.(?!w-id-)([A-Za-z_][\w-]*)/g, '.w-$1');
  // html/body/:root at the start (optionally with classes) -> the template root
  const m = s.match(/^(?::root|html|body)((?:\.[\w-]+)*)(.*)$/);
  if (m) {
    let rest = m[2];
    // "html body" / ":root body" collapse
    rest = rest.replace(/^\s+(?:body|html)((?:\.[\w-]+)*)/, (_, c) => c);
    if (/^\s+\.w-(layout-|skin-(hud|aurora|vitral|wave|cosmos|stage|os)\b|no-dock)/.test(rest)) rest = rest.replace(/^\s+/, '');
    return ROOT + m[1] + rest;
  }
  // body-level classes used without "body": .skin-x, .layout-x, .no-dock
  if (/^\.w-(skin-(hud|aurora|vitral|wave|cosmos|stage|os)\b|layout-|no-dock|booted)/.test(s)) return ROOT + s;
  if (s === '*' || s.startsWith('*')) return `${ROOT} ${s}`;
  return `${ROOT} ${s}`;
}

function processRoot(root) {
  root.walkAtRules('font-face', (a) => a.remove());
  root.walkAtRules('keyframes', (a) => { keyframes.add(a.params.trim()); a.params = 'ws-' + a.params.trim(); });
  // forced dark: unwrap dark media queries, drop light-only ones
  root.walkAtRules('media', (a) => {
    if (/prefers-color-scheme:\s*dark/.test(a.params)) {
      const rest = a.params.replace(/\(?\s*prefers-color-scheme:\s*dark\s*\)?\s*(and)?/,'').trim();
      if (!rest) a.replaceWith(a.nodes); else a.params = rest;
    } else if (/prefers-color-scheme:\s*light/.test(a.params)) a.remove();
  });
  root.walkRules((r) => {
    if (r.parent && r.parent.type === 'atrule' && /keyframes/.test(r.parent.name)) return;
    const out = r.selectors.map(scopeSelector).filter(Boolean);
    if (!out.length) { r.remove(); return; }
    r.selectors = [...new Set(out)];
  });
  root.walkDecls((d) => {
    if (!d.prop.startsWith('--') || /^--(accent|prominent|icon-ink|field-|badge-|royal-|rail-)/.test(d.prop)) d.value = recolor(d.value);
    if (d.prop === 'position' && d.value.trim() === 'fixed') d.value = 'absolute';
    if (d.prop === 'color-scheme') d.remove();
  });
}

let out = '/* AUTO-GENERATED from okunami-worship-skins (engine + features + skins). Scoped under .tpl-ws, forced dark. */\n';
const roots = files.map(([name, f]) => { const r = postcss.parse(fs.readFileSync(f, 'utf8')); processRoot(r); return [name, r]; });
// rename animation references after all keyframes are known
for (const [, r] of roots) r.walkDecls(/^animation(-name)?$/, (d) => {
  d.value = d.value.replace(/[A-Za-z_][\w-]*/g, (w) => (keyframes.has(w) ? 'ws-' + w : w));
});
for (const [name, r] of roots) out += `\n/* ===== ${name} ===== */\n` + r.toString();
fs.writeFileSync('/home/claude/fc/src/styles/worship-engine.css', out);
console.log('bytes', out.length, 'keyframes', keyframes.size);
