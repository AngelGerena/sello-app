/* Second pass: merges a sentence made of text + {values} + <b>/<span>/<Link> into ONE translatable template, so
   Spanish keeps natural word order:  t("A link is on its way to <b>{email}</b>.", { email }) rendered through rich().
   node scripts/i18n-rich.mjs [--dry] file... */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const files = args.filter((a) => !a.startsWith('--'));
const LETTERS = /[A-Za-zÀ-ÿ]{2,}/;
const INLINE_PLAIN = new Set(['b', 'i', 'em', 'strong', 'small', 'code', 'u']);
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&apos;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;/g, '\u2019').replace(/&middot;/g, '\u00b7');
const jsxText = (raw) => {                               // JSX whitespace rules
  const lines = raw.split(/\r\n|\n|\r/);
  const out = [];
  lines.forEach((ln, i) => {
    let s = ln.replace(/\t/g, ' ');
    if (i !== 0) s = s.replace(/^ +/, '');
    if (i !== lines.length - 1) s = s.replace(/ +$/, '');
    if (s) out.push(s);
  });
  return out.join(' ');
};
const tLiteral = (n) => ts.isJsxExpression(n) && n.expression && ts.isCallExpression(n.expression) && ts.isIdentifier(n.expression.expression) && /^(t|tl)$/.test(n.expression.expression.text) && n.expression.arguments.length === 1 && ts.isStringLiteral(n.expression.arguments[0]) ? n.expression.arguments[0].text : null;
const containsJsx = (n) => { let f = false; const v = (x) => { if (ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x) || ts.isJsxFragment(x)) f = true; ts.forEachChild(x, v); }; v(n); return f; };
const report = { merged: 0, skipped: [] };

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = []; let usedRich = false; const done = [];
  const tName = (n) => { for (let p = n.parent; p; p = p.parent) if (ts.isFunctionDeclaration(p) || ts.isArrowFunction(p) || ts.isFunctionExpression(p)) { const b = p.body && p.body.getText(); if (b && /const \{ t: tl \} = useT\(\)/.test(b)) return 'tl'; } return 't'; };

  const tryMerge = (el, children) => {
    const parts = []; const vars = []; const tags = []; let hasText = false, hasInline = false;
    const varName = (expr) => {
      let base = ts.isIdentifier(expr) ? expr.text : ts.isPropertyAccessExpression(expr) ? expr.name.text : 'v';
      let n = base, k = 1; while (vars.some((v) => v.name === n)) n = base + (++k); return n;
    };
    const addVar = (expr) => { const name = varName(expr); vars.push({ name, code: expr.getText() }); return `{${name}}`; };
    const collect = (kids, inner) => {
      let s = '';
      for (const c of kids) {
        if (ts.isJsxText(c)) { const raw = decode(jsxText(c.text)); if (LETTERS.test(raw)) hasText = true; s += raw; continue; }
        const lit = tLiteral(c); if (lit !== null) { s += lit; hasText = true; continue; }
        if (ts.isJsxExpression(c)) {
          if (!c.expression) continue;
          if (ts.isStringLiteral(c.expression) && c.expression.text.trim() === '') { s += c.expression.text; continue; }   // {' '}
          if (containsJsx(c.expression) || ts.isConditionalExpression(c.expression) && containsJsx(c.expression)) return null;
          s += addVar(c.expression); hasInline = true; continue;
        }
        if (ts.isJsxElement(c) && !inner) {
          const tag = c.openingElement.tagName.getText();
          const attrs = c.openingElement.attributes.properties.length;
          const innerStr = collect(c.children, true);
          if (innerStr === null) return null;
          let key;
          if (INLINE_PLAIN.has(tag) && !attrs) key = tag;
          else { key = 'x' + (tags.length + 1); }
          if (!tags.some((t) => t.key === key)) tags.push({ key, open: c.openingElement.getText(), close: c.closingElement.getText() });
          s += `<${key}>${innerStr}</${key}>`; hasInline = true; continue;
        }
        return null;                      // self-closing elements, fragments, nested blocks: leave for hand work
      }
      return s;
    };
    const tpl = collect(children, false);
    if (tpl === null || !hasText || !hasInline) return false;
    const tn = tName(el);
    const varsCode = vars.length ? `, { ${vars.map((v) => (v.name === v.code ? v.name : `${v.name}: ${v.code}`)).join(', ')} }` : '';
    const call = `${tn}(${JSON.stringify(tpl.replace(/\s+/g, ' ').trim())}${varsCode})`;
    let expr;
    if (tags.length) {
      usedRich = true;
      expr = `{rich(${call}, { ${tags.map((t) => `${t.key}: (c) => ${t.open}{c}${t.close}`).join(', ')} })}`;
    } else expr = `{${call}}`;
    const first = children[0], last = children[children.length - 1];
    edits.push({ start: first.pos, end: last.end, text: expr });
    report.merged++;
    return true;
  };

  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const kids = node.children;
      if (kids.length && !done.some((d) => node.pos >= d.start && node.end <= d.end)) {
        if (tryMerge(node, kids)) { done.push({ start: node.pos, end: node.end }); return; }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!edits.length) continue;
  if (usedRich) {
    const imp = sf.statements.filter(ts.isImportDeclaration).find((i) => /lib\/i18n'/.test(i.moduleSpecifier.getText()));
    if (imp) edits.push({ start: imp.getStart(), end: imp.end, text: imp.getText().replace('{ useT }', '{ rich, useT }').replace(/\{ ([^}]*?)useT([^}]*?) \}/, (m, a, b) => (m.includes('rich') ? m : `{ rich, ${a}useT${b} }`)) });
  }
  if (!dry) {
    let out = src; for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    fs.writeFileSync(file, out);
  }
  console.log(path.basename(file), 'merged', edits.filter((e) => e.text.startsWith('{')).length);
}
console.log('total merged sentences:', report.merged);
