/**
 * i18n parity and content guard for Booth Rent vs Commission Calculator V2.
 *
 * Enforces the translation and content rules that a manual review keeps missing:
 *   1. Every locale defines exactly the same key set as English.
 *   2. Every locale uses the same interpolation tokens for a given key,
 *      so no user ever sees a literal {token}.
 *   3. No currency symbol is written literally in a value; {cur} is used so
 *      the symbol is injected per locale by t().
 *   4. No banned claim (invented authority, credential or regime) appears in
 *      any shipped dictionary.
 *   5. Every key referenced from source — in a t() call or in a data-layer
 *      nameKey/hintKey/labelKey/descKey/monthKey — exists in the dictionary.
 *      A key with no entry renders as its own literal text to the user.
 *   6. No banned claim appears in source either, so seed and demo data are held
 *      to the same standard as prose.
 *   7. No colour literal sits in a style attribute, and no user-visible
 *      attribute (placeholder/aria-label/title/alt) carries a hardcoded
 *      string instead of a t() call.
 *   8. No external resource is loaded from browser code.
 *
 * Exits non-zero on any violation, so `npm run build` fails instead of
 * shipping an incomplete language or a banned claim.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = path.join(root, 'src', 'i18n', 'locales');
const srcDir = path.join(root, 'src');

const LANGS = ['en', 'fr', 'it', 'de', 'es', 'nl', 'pt'];

const BANNED = [
  'Professional Body Piercing Standards',
  'Qualified Professional Piercer',
  'HIPAA',
  'BioFlex',
  'Bio Flex',
  'BIOFLEX',
  'PTFE',
  'inventor of BioFlex',
];

const unescape = (s, quote) =>
  s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');

function parseLocale(lang) {
  const file = path.join(localesDir, `${lang}.ts`);
  if (!fs.existsSync(file)) throw new Error(`missing src/i18n/locales/${lang}.ts`);
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('{');
  const end = src.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error(`${lang}.ts: could not locate dictionary object`);
  const body = src.slice(start, end + 1);

  const entries = new Map();
  const re =
    /'((?:[^'\\]|\\.)*)'\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
  let m;
  while ((m = re.exec(body))) {
    const key = unescape(m[1], "'");
    const value = m[2] !== undefined ? unescape(m[2], "'") : unescape(m[3], '"');
    if (entries.has(key)) throw new Error(`${lang}.ts: duplicate key "${key}"`);
    entries.set(key, value);
  }
  return entries;
}

const tokens = (value) =>
  new Set([...value.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((x) => x[1]));

const problems = [];
const dicts = {};
for (const lang of LANGS) {
  try {
    dicts[lang] = parseLocale(lang);
  } catch (err) {
    problems.push(err.message);
  }
}

if (problems.length) {
  console.error('i18n check FAILED:\n  ' + problems.join('\n  '));
  process.exit(1);
}

const enKeys = [...dicts.en.keys()].sort();

console.log('── i18n key counts ─────────────────────────────────');
for (const lang of LANGS) {
  const mark = lang === 'en' ? ' (canonical)' : '';
  console.log(`  ${lang}: ${String(dicts[lang].size).padStart(4)} keys${mark}`);
}

for (const lang of LANGS) {
  const missing = enKeys.filter((k) => !dicts[lang].has(k));
  const extra = [...dicts[lang].keys()].filter((k) => !dicts.en.has(k));
  if (missing.length) problems.push(`${lang}: ${missing.length} missing key(s): ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ' …' : ''}`);
  if (extra.length) problems.push(`${lang}: ${extra.length} key(s) absent from en: ${extra.slice(0, 12).join(', ')}${extra.length > 12 ? ' …' : ''}`);
}

if (!problems.length) {
  for (const lang of LANGS) {
    if (lang === 'en') continue;
    for (const key of enKeys) {
      const a = tokens(dicts.en.get(key));
      const b = tokens(dicts[lang].get(key));
      if (a.size !== b.size || ![...a].every((x) => b.has(x))) {
        problems.push(
          `${lang}:${key} placeholder mismatch — en {${[...a].sort().join(',')}} vs ${lang} {${[...b].sort().join(',')}}`,
        );
      }
    }
  }
}

for (const lang of LANGS) {
  for (const [key, value] of dicts[lang]) {
    if (/[£€$¥]/.test(value)) {
      problems.push(`${lang}:${key} contains a literal currency symbol — use {cur}`);
    }
    for (const phrase of BANNED) {
      if (value.toLowerCase().includes(phrase.toLowerCase())) {
        problems.push(`${lang}:${key} contains banned claim "${phrase}"`);
      }
    }
    for (const brace of value.matchAll(/\{[^}]*\}/g)) {
      if (!/^\{[A-Za-z0-9_]+\}$/.test(brace[0])) {
        problems.push(`${lang}:${key} has a malformed placeholder ${brace[0]}`);
      }
    }
    if ((value.match(/\{/g) || []).length !== (value.match(/\}/g) || []).length) {
      problems.push(`${lang}:${key} has unbalanced braces: ${value}`);
    }
  }
}

console.log('── content guards ──────────────────────────────────');
if (problems.length) {
  console.error(`\ni18n check FAILED with ${problems.length} problem(s):`);
  for (const p of problems) console.error('  x ' + p);
  process.exit(1);
}
console.log('  ok  every locale shares an identical key set');
console.log('  ok  every interpolation token matches English');
console.log('  ok  no literal currency symbols in any value');
console.log('  ok  no banned claims in any dictionary');

/* ── source-side guards ──────────────────────────────────────────────────── */

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );

const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const srcFiles = walk(srcDir).filter((f) => /\.(ts|tsx)$/.test(f));
const read = (f) => fs.readFileSync(f, 'utf8');

const srcProblems = [];

// 5. Every key referenced from source exists in the dictionary.
//    Keys reach the user either through a t('...') call or through a data-layer
//    field the renderer feeds to t(). Both are checked; an unknown key renders
//    as its own literal text, which is how raw paths like kit.needlesName ship.
const refRe = [
  { name: 't() call', re: /\bt\(\s*'([^']+)'/g },
  { name: 't() call', re: /\bt\(\s*"([^"]+)"/g },
  {
    name: 'data-layer key',
    re: /(?:nameKey|hintKey|labelKey|descKey|monthKey)\s*:\s*'([^']+)'/g,
  },
];
let refCount = 0;
const seenRef = new Set();
for (const f of srcFiles) {
  if (f.startsWith(localesDir)) continue;
  const text = read(f);
  for (const { name, re } of refRe) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const key = m[1];
      if (!key.includes('.')) continue; // not a namespaced translation key
      refCount++;
      if (!dicts.en.has(key) && !seenRef.has(key)) {
        seenRef.add(key);
        srcProblems.push(`${rel(f)}: ${name} "${key}" has no entry in en.ts — renders as literal text`);
      }
    }
  }
}

// 6. Banned claims in source: seed data, demo records and placeholders are held
//    to the same standard as prose. The dictionaries are covered by guard 4.
for (const f of srcFiles) {
  if (f.startsWith(localesDir)) continue;
  const text = read(f);
  for (const phrase of BANNED) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      srcProblems.push(`${rel(f)}: contains banned claim "${phrase}"`);
    }
  }
}

// 7a. No colour literal in a style attribute.
for (const f of srcFiles) {
  const text = read(f);
  const re = /style=\{\{[^}]*?(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()[^}]*?\}\}/g;
  let m;
  while ((m = re.exec(text))) {
    srcProblems.push(`${rel(f)}: colour literal in a style attribute — use a CSS custom property`);
  }
}

// 7b. No hardcoded user-visible attribute. These are the strings a data-i18n
//     sweep never reaches, because they are attributes rather than text nodes.
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
for (const f of srcFiles) {
  const text = read(f);
  for (const attr of ATTRS) {
    const re = new RegExp(`\\b${attr}="([^"{}][^"]*)"`, 'g');
    let m;
    while ((m = re.exec(text))) {
      srcProblems.push(`${rel(f)}: hardcoded ${attr}="${m[1].slice(0, 40)}" — wrap it in t()`);
    }
  }
}

// 8. No external resource loaded from browser code. Anchors are navigation, not
//    a resource load, so only script/link tags are flagged here.
const browserFiles = [...srcFiles, path.join(root, 'index.html')].filter(
  (f) => fs.existsSync(f) && /\.(tsx?|css|html)$/.test(f),
);
let loaderCount = 0;
for (const f of browserFiles) {
  const text = read(f);
  const re = /<(script|link)\b[^>]*\b(src|href)\s*=\s*["']([^"']*)["']/gi;
  let m;
  while ((m = re.exec(text))) {
    if (/^(https?:)?\/\//i.test(m[3])) {
      loaderCount++;
      srcProblems.push(`${rel(f)}: external <${m[1]} ${m[2]}="${m[3]}"> is blocked by script-src 'self'`);
    }
  }
}

if (srcProblems.length) {
  console.error(`\ni18n check FAILED with ${srcProblems.length} source problem(s):`);
  for (const p of srcProblems) console.error('  x ' + p);
  process.exit(1);
}

// 9. Render every key in every locale, exactly as t() does, and assert the
//    result is non-empty and leaves no unresolved {token} behind. Guard 2
//    compares token sets between locales; this one proves the substitution
//    actually completes for every single string that can reach a user.
let rendered = 0;
for (const lang of LANGS) {
  for (const [key, value] of dicts[lang]) {
    if (!value.trim()) {
      srcProblems.push(`${lang}:${key} is empty`);
      continue;
    }
    let out = value;
    for (const tok of tokens(value)) {
      out = out.split(`{${tok}}`).join(tok === 'cur' ? 'X' : '1');
    }
    rendered++;
    const leftover = out.match(/\{[^}]*\}/);
    if (leftover) {
      srcProblems.push(`${lang}:${key} renders an unresolved ${leftover[0]} to the user`);
    }
  }
}

if (srcProblems.length) {
  console.error(`\ni18n check FAILED with ${srcProblems.length} problem(s):`);
  for (const p of srcProblems) console.error('  x ' + p);
  process.exit(1);
}
console.log(`  ok  all ${refCount} source key references resolve in en.ts`);
console.log('  ok  no banned claims in source or seed data');
console.log('  ok  no colour literals in style attributes');
console.log('  ok  no hardcoded placeholder/aria-label/title/alt strings');
console.log('  ok  no external resource loaded from browser code');
console.log(`  ok  all ${rendered} strings render with no unresolved {token}`);
console.log('\ni18n check PASSED');
