/* One-time helper that wraps plain UI text in t('...') so it can be translated.
   node scripts/i18n-codemod.mjs --dry file...   lists what it would wrap
   node scripts/i18n-codemod.mjs file...          rewrites the files
   It only touches text that stands alone (a heading, a button label, an attribute like label= or placeholder=).
   Sentences mixed with <b>, links or {values} are listed as "manual" so they are translated with care. */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dry = args[0] === '--dry';
const files = args.filter((a) => !a.startsWith('--'));
const ATTRS = new Set(['label', 'hint', 'placeholder', 'title', 'aria-label', 'alt', 'description']);
const LETTERS = /[A-Za-zÀ-ÿ]{2,}/;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&apos;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;/g, '\u2019').replace(/&middot;/g, '\u00b7');
const report = { phrases: new Set(), manual: [], perFile: {} };

const hasText = (n) => { let found = false; const v = (x) => { if (ts.isJsxText(x) && LETTERS.test(x.text)) found = true; ts.forEachChild(x, v); }; v(n); return found; };
const isComponent = (fn) => {
  let name = null;
  if (ts.isFunctionDeclaration(fn) && fn.name) name = fn.name.text;
  else if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name)) name = fn.parent.name.text;
  return name && /^[A-Z]/.test(name) ? name : null;
};

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [], hooks = new Map();
  const note = (node, text) => { report.phrases.add(text); (report.perFile[file] ??= []).push(text); };
  const needHook = (node) => {
    for (let p = node.parent; p; p = p.parent) {
      if ((ts.isFunctionDeclaration(p) || ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && isComponent(p)) { hooks.set(p, true); return true; }
    }
    return false;
  };
  const visit = (node) => {
    if (ts.isJsxText(node) && LETTERS.test(node.text)) {
      const parent = node.parent;
      const sibs = (parent.children ?? []).filter((c) => c !== node);
      const mixed = sibs.some((c) => (ts.isJsxElement(c) && hasText(c)) || (ts.isJsxExpression(c) && c.expression && !(ts.isStringLiteral(c.expression) && c.expression.text.trim() === '')) || ts.isJsxFragment(c));
      const text = decode(node.text.replace(/\s+/g, ' ').trim());
      if (mixed) report.manual.push(`${path.basename(file)}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}  ${text.slice(0, 70)}`);
      else if (needHook(node)) {
        const raw = node.text, lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
        edits.push({ start: node.pos, end: node.end, text: `${lead}{t(${JSON.stringify(text)})}${trail}` });
        note(node, text);
      } else report.manual.push(`${path.basename(file)}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}  (no component) ${text.slice(0, 60)}`);
    }
    if (ts.isJsxAttribute(node) && ATTRS.has(node.name.getText()) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const text = decode(node.initializer.text);
      if (LETTERS.test(text) && needHook(node)) {
        edits.push({ start: node.initializer.getStart(), end: node.initializer.end, text: `{t(${JSON.stringify(text)})}` });
        note(node, text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!edits.length) continue;

  // hook injection
  for (const fn of hooks.keys()) {
    const body = fn.body;
    if (ts.isBlock(body)) {
      if (!/useT\(\)/.test(body.getText())) edits.push({ start: body.getStart() + 1, end: body.getStart() + 1, text: '\n  const { t } = useT();' });
    } else if (ts.isParenthesizedExpression(body)) {
      edits.push({ start: body.getStart(), end: body.getStart(), text: '{ const { t } = useT(); return ' });
      edits.push({ start: body.end, end: body.end, text: '; }' });
    } else report.manual.push(`${path.basename(file)}: expression-bodied component needs a manual useT()`);
  }
  // import
  if (!/from '[./]+\/lib\/i18n'|from '\.\/i18n'/.test(src)) {
    const rel = path.relative(path.dirname(file), 'src/lib/i18n').replace(/\\/g, '/');
    const spec = rel.startsWith('.') ? rel : './' + rel;
    const imports = sf.statements.filter(ts.isImportDeclaration);
    const at = imports.length ? imports[imports.length - 1].end : 0;
    edits.push({ start: at, end: at, text: `\nimport { useT } from '${spec}';` });
  }
  if (!dry) {
    let out = src;
    for (const e of edits.sort((a, b) => b.start - a.start || b.end - a.end)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    fs.writeFileSync(file, out);
  }
}
console.log(JSON.stringify({ count: report.phrases.size, perFile: Object.fromEntries(Object.entries(report.perFile).map(([k, v]) => [k, v.length])), manual: report.manual, phrases: [...report.phrases] }, null, 1));
