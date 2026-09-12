/**
 * Calculation-engine regression suite.
 *
 * Compiles the pure TypeScript engine to a throwaway CommonJS build, then
 * asserts the arithmetic the application depends on. This exists because the
 * bugs that actually shipped in this calculator were arithmetic and data-layer
 * bugs, not type errors: a per-procedure consumable that silently ignored its
 * unit price, and a break-even that disagreed with the curves drawn beside it.
 * `tsc --noEmit` cannot catch either.
 *
 * Run with `npm test`. Exits non-zero on the first failing assertion.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'node_modules', '.cache', 'engine-test');
const LIMIT = 524288; // ban 13 ceiling for an exported text file

/* ── build the engine ────────────────────────────────────────────────────── */

fs.rmSync(outDir, { recursive: true, force: true });
const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
if (!fs.existsSync(tsc)) {
  console.error('typescript is not installed — run npm install first');
  process.exit(1);
}
execFileSync(
  process.execPath,
  [
    tsc,
    'src/utils/calculator.ts',
    '--outDir', outDir,
    '--module', 'commonjs',
    '--target', 'es2022',
    '--moduleResolution', 'node',
    '--esModuleInterop',
    '--skipLibCheck',
    '--lib', 'es2022,dom',
  ],
  { cwd: root, stdio: 'inherit' },
);

const require = createRequire(import.meta.url);
const c = require(path.join(outDir, 'utils', 'calculator.js'));
const { t, setLanguage, supportedLanguages, locales } = require(
  path.join(outDir, 'i18n', 'translations.js'),
);

/* ── harness ─────────────────────────────────────────────────────────────── */

let pass = 0;
let fail = 0;
const failures = [];
const group = (name) => console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 48 - name.length))}`);
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok    ' + name); }
  else {
    fail++;
    failures.push(name + (detail ? '  -> ' + detail : ''));
    console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : ''));
  }
}
const near = (a, b, eps = 0.01) => Math.abs(a - b) < eps;

const deal = { weeklyRent: 250, commissionPct: 40, weeksPerYear: 52 };
const inclusions = c.DEFAULT_INCLUSIONS;
const procedures = 54;
const realisticParams = {
  useRealisticEngine: true, directMonthlyRevenue: 12000, workingDaysPerMonth: 20,
  apptsPerDay: 3, avgTicket: 200, noShowRatePct: 10,
};

/* ── 1. per-procedure consumables ────────────────────────────────────────── */

group('per-procedure consumable pricing');
const kit = c.STANDARD_PIERCING_KIT[0]; // needles: per_procedure, 1.50/unit
check('unit price x procedure count is the monthly cost',
  near(c.computeItemCosts(kit, 12000, procedures).total, 1.5 * 54),
  'got ' + c.computeItemCosts(kit, 12000, procedures).total);
check('legacy isPerProcedure flag still honoured',
  near(c.computeItemCosts({ ...kit, costType: undefined, isPerProcedure: true }, 12000, 54).total, 81));
check('a fixed item ignores the procedure count',
  near(c.computeItemCosts({ id: 'x', nameKey: 'k', hintKey: 'h', monthlyCost: 320, boothPayer: 'artist', commPayer: 'owner' }, 12000, 54).total, 320));
check('a percentage item tracks revenue',
  near(c.computeItemCosts({ id: 'y', nameKey: 'k', hintKey: 'h', monthlyCost: 0, isPercentage: true, ratePct: 1.75, boothPayer: 'artist', commPayer: 'owner' }, 12000, 54).total, 210));
check('a split payer puts half the cost on each side', (() => {
  const r = c.computeItemCosts({ id: 'z', nameKey: 'k', hintKey: 'h', monthlyCost: 100, boothPayer: 'split', commPayer: 'split' }, 12000, 54);
  return near(r.boothArtist, 50) && near(r.boothOwner, 50) && near(r.commArtist, 50);
})());

group('completed-procedure count');
check('20 days x 3 appts x 10% no-show = 54',
  c.computeMonthlyProcedures({ workingDaysPerMonth: 20, apptsPerDay: 3, noShowRatePct: 10 }) === 54);
check('no no-shows passes the full volume',
  c.computeMonthlyProcedures({ workingDaysPerMonth: 20, apptsPerDay: 3, noShowRatePct: 0 }) === 60);
check('an empty schedule yields zero, never negative',
  c.computeMonthlyProcedures({ workingDaysPerMonth: 0, apptsPerDay: 0, noShowRatePct: 0 }) === 0);

/* ── 2. break-even ───────────────────────────────────────────────────────── */

group('break-even crossover');
const beRes = c.computeBreakEven(deal, inclusions, procedures);
const be = beRes.breakEvenMonthly;
check('a break-even point is found', be !== null && be > 0, 'got ' + be);
check('reported as reachable', beRes.reachable === true);
check('weekly figure equals monthly over 52/12',
  near(beRes.breakEvenWeekly, be / (52 / 12), 0.02));
if (be) {
  const boothAt = c.computeDealSide(be, deal, inclusions, 'booth', procedures).artist.netIncomeMonthly;
  const commAt = c.computeDealSide(be, deal, inclusions, 'comm', procedures).artist.netIncomeMonthly;
  check('at break-even both models net the same', near(boothAt, commAt, 0.05),
    'booth ' + boothAt.toFixed(4) + ' vs comm ' + commAt.toFixed(4));
  const below = c.computeDealSide(be * 0.8, deal, inclusions, 'booth', procedures).artist.netIncomeMonthly
              - c.computeDealSide(be * 0.8, deal, inclusions, 'comm', procedures).artist.netIncomeMonthly;
  const above = c.computeDealSide(be * 1.2, deal, inclusions, 'booth', procedures).artist.netIncomeMonthly
              - c.computeDealSide(be * 1.2, deal, inclusions, 'comm', procedures).artist.netIncomeMonthly;
  check('below break-even, commission pays the artist more', below < 0, 'diff ' + below.toFixed(2));
  check('above break-even, booth rent pays the artist more', above > 0, 'diff ' + above.toFixed(2));
}

/* ── 3. deal arithmetic ──────────────────────────────────────────────────── */

group('deal arithmetic');
const side = c.computeDealSide(12000, deal, inclusions, 'comm', procedures);
check('commission is 40% of 12000', near(side.artist.commission, 4800));
check('artist net = gross - commission - artist-paid inclusions',
  near(side.artist.netIncomeMonthly, 12000 - 4800 - side.artist.totalInclusions));
check('owner gross revenue equals the commission', near(side.owner.grossRevenue, 4800));
check('booth side charges rent, not commission', (() => {
  const b = c.computeDealSide(12000, deal, inclusions, 'booth', procedures);
  return b.artist.commission === 0 && near(b.artist.rent, 250 * 52 / 12, 0.02);
})());
check('tiered commission stays monotonic in revenue', (() => {
  const tiered = { ...deal, useTieredCommission: true, tieredTiers: [{ threshold: 3000, pct: 40 }, { threshold: 6000, pct: 45 }] };
  let prev = -1;
  for (let rev = 0; rev <= 20000; rev += 1000) {
    const amt = c.computeCommissionAmount(rev, tiered);
    if (amt < prev - 0.01) return false;
    prev = amt;
  }
  return true;
})());
check('a floor guarantee never lowers the studio take', (() => {
  const floored = { ...deal, dealStructure: 'floor', floorMinWeekly: 400 };
  return c.computeCommissionAmount(1000, floored) >= c.computeCommissionAmount(1000, deal);
})());

/* ── 4. tax overlay ──────────────────────────────────────────────────────── */

group('tax overlay');
const flat = { enabled: true, regime: 'flat', flatRatePct: 25 };
const uk = { enabled: true, regime: 'uk_sole_trader' };
const us = { enabled: true, regime: 'us_self_employed' };

check('UK: profit below the personal allowance is untaxed',
  c.computeTaxBreakdown(1000, 0, uk).estimatedTax === 0);
check('UK: the basic band charges 20% income tax plus 6% Class 4 NIC', (() => {
  const r = c.computeTaxBreakdown(2000, 0, uk); // wholly inside the basic band
  return near(r.estimatedTax, (2000 - 12570 / 12) * 0.26, 0.01);
})());
check('UK: profit above the basic rate limit reaches 42%', (() => {
  const r = c.computeTaxBreakdown(9000, 0, uk);
  const basicBand = (50270 - 12570) / 12;
  const higherBand = 9000 - 12570 / 12 - basicBand;
  return near(r.estimatedTax, basicBand * 0.26 + higherBand * 0.42, 0.01);
})());
check('higher UK profits are taxed at a higher effective rate than lower ones', (() => {
  const low = c.computeTaxBreakdown(4000, 0, uk);
  const high = c.computeTaxBreakdown(9000, 0, uk);
  return high.effectiveTaxRatePct > low.effectiveTaxRatePct;
})());
check('flat regime: tax is the flat rate on taxable profit', (() => {
  const r = c.computeTaxBreakdown(12000, 2000, flat);
  return near(r.taxableProfit, 10000) && near(r.estimatedTax, 2500);
})());
check('flat regime: tax shield equals deductions x rate', (() => {
  const r = c.computeTaxBreakdown(12000, 2000, flat);
  return near(r.taxShieldSavings, 2000 * 0.25);
})());
check('taxable profit never goes negative',
  c.computeTaxBreakdown(1000, 5000, flat).taxableProfit === 0);
check('take-home = gross - deductions - tax', (() => {
  const r = c.computeTaxBreakdown(12000, 2000, flat);
  return near(r.takeHomeCash, 12000 - 2000 - r.estimatedTax);
})());

// US regime. The old implementation used the 2024 standard deduction, a flat
// 12% with no 10% band and no higher brackets, and no Social Security cap.
check('US: below the standard deduction only self-employment tax applies', (() => {
  const r = c.computeTaxBreakdown(1000, 0, us); // 12,000/yr, under the 16,100 deduction
  return near(r.estimatedTax, (12000 * 0.9235 * 0.153) / 12, 0.05);
})());
check('US: matches an independent 2026 single-filer reference at four incomes', (() => {
  const brackets = [[12100, 0.1], [49150, 0.12], [105225, 0.22], [200700, 0.24],
                    [375000, 0.32], [530000, 0.35], [Infinity, 0.37]];
  const reference = (annualProfit) => {
    const seIncome = annualProfit * 0.9235;
    const seTax = Math.min(seIncome, 184500) * 0.124 + seIncome * 0.029;
    const taxable = Math.max(0, annualProfit - 16100 - seTax * 0.5);
    let tax = 0;
    let lower = 0;
    for (const [upTo, rate] of brackets) {
      if (taxable <= lower) break;
      tax += (Math.min(taxable, upTo) - lower) * rate;
      lower = upTo;
    }
    return (seTax + tax) / 12;
  };
  return [12000, 60000, 200000, 400000].every((annual) =>
    near(c.computeTaxBreakdown(annual / 12, 0, us).estimatedTax, reference(annual), 0.02));
})());
check('US: the Social Security portion is capped at the wage base', (() => {
  // Isolate the self-employment component by differencing two profits that sit
  // in the same federal bracket, so the income-tax marginal rate is constant.
  const at = (annual) => c.computeTaxBreakdown(annual / 12, 0, us).estimatedTax * 12;
  const marginal = (at(260000) - at(220000)) / 40000;
  // Uncapped, the self-employment component alone would contribute 14.13%.
  const uncappedMarginal = 0.1413 + (0.24 + 0.24 * 0.1413 * 0.5);
  return marginal < uncappedMarginal;
})());
check('US: the effective rate rises with profit', (() => {
  const low = c.computeTaxBreakdown(3000, 0, us).effectiveTaxRatePct;
  const high = c.computeTaxBreakdown(12000, 0, us).effectiveTaxRatePct;
  return high > low;
})());
check('US: tax is monotonic in profit', (() => {
  let prev = -1;
  for (let p = 0; p <= 30000; p += 500) {
    const t = c.computeTaxBreakdown(p, 0, us).estimatedTax;
    if (t < prev - 0.01) return false;
    prev = t;
  }
  return true;
})());
check('US: tax never exceeds the profit',
  c.computeTaxBreakdown(5000, 0, us).estimatedTax < 5000);
check('US: tax shield uses US rates, not UK rates', (() => {
  const r = c.computeTaxBreakdown(12000, 2000, us);
  const ukRateFigure = (12000 - 12570 / 12) * 0.26;
  return r.taxShieldSavings > 0 && Math.abs(r.taxShieldSavings - ukRateFigure) > 1;
})());

/* ── 5. inclusion labels ─────────────────────────────────────────────────── */

group('inclusion labels resolve, never leak raw keys');
check('a kit row shows a translated name, not "kit.needlesName"',
  c.inclusionLabel(c.STANDARD_PIERCING_KIT[0]) !== 'kit.needlesName',
  c.inclusionLabel(c.STANDARD_PIERCING_KIT[0]));
check('a baseline row resolves through the dictionary',
  c.inclusionLabel(c.DEFAULT_INCLUSIONS[0]) === t('inclusions.supplies'));
check('a user-typed row renders verbatim',
  c.inclusionLabel({ id: 'custom-1', nameKey: 'My Own Needles', hintKey: 'h', monthlyCost: 10, boothPayer: 'artist', commPayer: 'owner' }) === 'My Own Needles');
check('every seeded inclusion label resolves to real text', (() =>
  c.DEFAULT_INCLUSIONS.concat(c.STANDARD_PIERCING_KIT)
    .every((i) => { const l = c.inclusionLabel(i); return l && !/^[a-z]+\.[A-Za-z]+$/.test(l); }))());

/* ── 6. currency ─────────────────────────────────────────────────────────── */

group('currency is locale-aware');
const gbp = c.formatCurrency(1234.56, 'en');
const eur = c.formatCurrency(1234.56, 'fr');
check('English formats as GBP with a leading symbol',
  gbp.includes('1,234.56') && gbp.includes('\u00a3'), gbp);
check('French formats as EUR with a trailing symbol',
  eur.includes('\u20ac') && eur.indexOf('\u20ac') > eur.indexOf('1'), eur);
check('the two locales do not render identically', gbp !== eur, gbp + ' vs ' + eur);
check('zero formats without throwing', c.formatCurrency(0).length > 0);
check('NaN is coerced to zero, not printed as NaN',
  !c.formatCurrency(NaN).includes('NaN'), c.formatCurrency(NaN));

/* ── 7. translations ─────────────────────────────────────────────────────── */

group('all seven languages');
const en = locales.en;
const keys = Object.keys(en);
for (const lang of supportedLanguages) {
  const missing = keys.filter((k) => !(k in locales[lang]));
  check(lang + ' has all ' + keys.length + ' keys', missing.length === 0,
    missing.slice(0, 5).join(', '));
}
for (const lang of supportedLanguages) {
  if (lang === 'en') continue;
  const same = keys.filter((k) => locales[lang][k] === en[k]);
  const pct = (same.length / keys.length * 100).toFixed(1);
  check(lang + ' is genuinely translated (' + same.length + '/' + keys.length + ' identical to English, ' + pct + '%)',
    same.length / keys.length < 0.05);
}
check('switching language changes rendered text', (() => {
  setLanguage('de'); const de = t('comparison.secTitle');
  setLanguage('pt'); const pt = t('comparison.secTitle');
  setLanguage('en'); const eng = t('comparison.secTitle');
  return de !== eng && pt !== eng && de !== pt;
})());
check('a missing key falls back to English rather than crashing',
  t('this.key.does.not.exist') === 'this.key.does.not.exist');

/* ── 8. exports ──────────────────────────────────────────────────────────── */

group('exported files');

let captured = null;
global.Blob = class Blob { constructor(parts) { captured = parts.join(''); } };
global.URL.createObjectURL = () => 'blob:stub';
global.URL.revokeObjectURL = () => {};
global.document = {
  createElement: () => ({ download: '', click() {}, setAttribute() {}, style: {} }),
  body: { appendChild() {}, removeChild() {} },
};

const model = c.computeFullModel(deal, realisticParams, inclusions, { enabled: false, regime: 'uk_sole_trader' });
const seasonality = c.computeSeasonalitySummary(12000, deal, inclusions, c.DEFAULT_SEASONALITY_INPUTS);
const floor = c.computeStudioFloorModel(c.DEFAULT_STUDIO_CHAIRS, 4200);

captured = null;
c.exportToCsv(model, deal, inclusions.concat(c.STANDARD_PIERCING_KIT), seasonality, floor);
const csv = captured;
captured = null;
c.exportToJson(model, deal, inclusions.concat(c.STANDARD_PIERCING_KIT), seasonality, floor);
const json = captured;

const csvBytes = Buffer.byteLength(csv, 'utf8');
const jsonBytes = Buffer.byteLength(json, 'utf8');
check('CSV is under the 512 KiB ceiling (' + csvBytes + ' bytes)', csvBytes < LIMIT);
check('JSON is under the 512 KiB ceiling (' + jsonBytes + ' bytes)', jsonBytes < LIMIT);

// Quote-aware parse: quoted fields may contain commas and doubled quotes.
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false; }
      else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
const lines = csv.split('\n');
const rows = lines.map(parseCsvLine);

check('no value carries a thousands separator', !rows.some((r) =>
  r.some((f) => /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(f.trim()))));
check('no currency symbol leaks into the CSV', !/[\u00a3\u20ac$]/.test(csv));
check('every field containing a comma is quoted', !rows.some((r, i) =>
  r.some((f) => f.includes(',') && !lines[i].includes('"' + f + '"'))));
check('JSON parses and carries its sections', (() => {
  try {
    const p = JSON.parse(json);
    return Boolean(p.metadata) && Boolean(p.summary);
  } catch { return false; }
})());

/* ── result ──────────────────────────────────────────────────────────────── */

console.log('\n' + '─'.repeat(54));
if (fail) {
  console.error(`${pass} passed, ${fail} FAILED:`);
  for (const f of failures) console.error('  x ' + f);
  process.exit(1);
}
console.log(`${pass} passed, 0 failed`);
