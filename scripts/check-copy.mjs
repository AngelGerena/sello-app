/* Guards the "designs / niches / layouts" numbers shown to customers.
   Run with:  npm run check:copy
   Fails if (1) a niche blurb contains a hand-typed number, (2) source text hardcodes a design/niche/layout total,
   or (3) a computed label disagrees with the data it describes. */
import { build } from 'esbuild';
import { readdirSync, readFileSync, statSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(new URL('..', import.meta.url).pathname);
const problems = [];

// (2) hardcoded totals in source (skip the one file that defines them and this guard)
const SKIP = new Set(['src/lib/counts.ts']);
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
});
const HARD = /\b(\d{2,3})\s+(designs|niches|layouts)\b/i;
for (const file of walk(join(root, 'src'))) {
  const rel = relative(root, file);
  if (SKIP.has(rel)) continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;      // comments
    const m = line.match(HARD);
    if (m) problems.push(`${rel}:${i + 1} hardcodes "${m[0]}". Use src/lib/counts.ts instead.`);
  });
}

// (1) and (3) need the real data
const dir = mkdtempSync(join(tmpdir(), 'chk-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'out.mjs');
readFileSync; // eslint-friendly no-op
await import('node:fs').then((fs) => fs.writeFileSync(entry, `
  import { NICHES } from '${join(root, 'src/lib/niches')}';
  import { nicheCounts, nicheCountLabel, designsLabel, DESIGN_COUNT, UNIQUE_DESIGNS } from '${join(root, 'src/lib/counts')}';
  export { NICHES, nicheCounts, nicheCountLabel, designsLabel, DESIGN_COUNT, UNIQUE_DESIGNS };
`));
await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'silent',
  loader: { '.svg': 'text', '.jpg': 'dataurl', '.png': 'dataurl', '.css': 'empty', '.woff2': 'empty' }, define: { 'import.meta.env': '{}' } });
const { NICHES, nicheCounts, nicheCountLabel, designsLabel, DESIGN_COUNT, UNIQUE_DESIGNS } = await import(pathToFileURL(out).href);

const NUM = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|\d+)\b/i;
for (const n of NICHES) {
  if (NUM.test(n.blurb)) problems.push(`niche "${n.name}": blurb has a hand-typed number ("${n.blurb}")`);
  for (const lang of ['en', 'es']) {
    if (!nicheCountLabel(n, 'pro', lang).startsWith(String(n.designs.length) + ' ')) problems.push(`niche "${n.name}": ${lang} label disagrees with ${n.designs.length} designs`);
    const lite = nicheCounts(n, 'free');
    if (lite.total !== lite.free + lite.locked) problems.push(`niche "${n.name}": Lite counts do not add up`);
    if (!nicheCountLabel(n, 'free', lang).includes(String(lite.free)) ) problems.push(`niche "${n.name}": Lite ${lang} label misses its free count`);
  }
}
if (UNIQUE_DESIGNS.length !== DESIGN_COUNT) problems.push('DESIGN_COUNT is not the length of UNIQUE_DESIGNS');
if (designsLabel(1, 'en') !== '1 design' || designsLabel(2, 'es') !== '2 diseños') problems.push('pluralization is wrong');

if (problems.length) { console.error('check:copy found problems:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`check:copy passed: ${NICHES.length} niches, ${DESIGN_COUNT} designs, English and Spanish labels agree with the data.`);
