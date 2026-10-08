/* Run with: npm run check:i18n
   Fails if a phrase passed to t("...") has no Spanish entry, or a translation breaks a <tag> or invents a {variable}. */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const walk = (d) => fs.readdirSync(d).flatMap((f) => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : []; });
const text = fs.readFileSync(path.join(root, 'src/i18n/es.ts'), 'utf8');
const ES = JSON.parse(text.slice(text.indexOf('= {') + 2, text.lastIndexOf('};') + 1));
const re = /\bt[l]?\(\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
const used = new Set(), problems = [];
for (const f of walk(path.join(root, 'src'))) {
  if (/i18n/.test(f)) continue;
  const s = fs.readFileSync(f, 'utf8'); let m;
  while ((m = re.exec(s))) { try { used.add(m[1][0] === '"' ? JSON.parse(m[1]) : eval(m[1])); } catch { /* template */ } }
}
// Data that reaches t() as a variable: step labels and checklist text in the editor, plans, Studio packages, niches.
for (const f of ['src/pages/Editor.tsx', 'src/components/editor/QuickStart.tsx']) {
  const src = fs.readFileSync(path.join(root, f), 'utf8'); let m;
  const lre = /\b(?:label|fixLabel): ('(?:\\.|[^'\\])*')/g;
  while ((m = lre.exec(src))) used.add(eval(m[1]));
}
{
  const { build } = await import('esbuild'); const os = await import('node:os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-')); const entry = path.join(dir, 'e.ts'); const out = path.join(dir, 'o.mjs');
  fs.writeFileSync(entry, `import { NICHES, NICHE_GROUPS } from '${path.join(root, 'src/lib/niches')}'; import { PLANS, STUDIO } from '${path.join(root, 'src/lib/plans')}';
    export const all = () => { const a = []; NICHES.forEach((n) => a.push(n.name, n.blurb)); NICHE_GROUPS.forEach((g) => a.push(g));
      PLANS.forEach((p) => { a.push(p.name, p.pitch, p.per, ...p.features); }); STUDIO.forEach((s) => a.push(s.name, s.blurb, ...s.includes)); return a; };`);
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'silent', loader: { '.svg': 'text', '.jpg': 'dataurl', '.png': 'dataurl', '.css': 'empty' }, define: { 'import.meta.env': '{}' } });
  for (const x of (await import(pathToFileURL(out).href)).all()) used.add(x);
}
const ph = (s) => (s.match(/\{\w+\}/g) || []).sort(), tg = (s) => (s.match(/<\/?\w+>/g) || []).sort();
let missing = 0;
for (const k of used) {
  if (!(k in ES)) { missing++; problems.push(`no Spanish for: ${k.slice(0, 90)}`); continue; }
  const v = ES[k];
  if (JSON.stringify(tg(k)) !== JSON.stringify(tg(v))) problems.push(`tags differ: ${k.slice(0, 70)}`);
  const extra = ph(v).filter((x) => !ph(k).includes(x));
  if (extra.length) problems.push(`Spanish invents ${extra.join(',')}: ${k.slice(0, 60)}`);
}
const unused = Object.keys(ES).filter((k) => !used.has(k)).length;
if (problems.length) { console.error(`check:i18n found ${problems.length} problem(s):\n - ` + problems.join('\n - ')); process.exit(1); }
console.log(`check:i18n passed: ${used.size} phrases in code, all translated (${unused} spare entries in the dictionary).`);
