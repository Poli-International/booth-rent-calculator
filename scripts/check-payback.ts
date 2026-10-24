// Equipment payback check. Run: npx tsx scripts/check-payback.ts
import assert from 'node:assert/strict';
import { equipmentPayback } from '../src/utils/calculator';

const near = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const kit = { cost: 1200, sessionsPerDay: 2, daysPerWeek: 5, pricePerSession: 120,
  consumablesPerSession: 8, upkeepPerYear: 150, lifespanYears: 5 };

// 2 x 5 x 52 / 12 = 43.33 sessions a month
const booth = equipmentPayback(kit, 100, 52);
near(booth.monthlyNet, (520 / 12) * 112 - 12.5);
near(booth.paybackMonths!, 1200 / booth.monthlyNet);
assert.equal(booth.sessionsToPayback, 11);
near(booth.lifetimeNet, booth.monthlyNet * 60 - 1200);
near(equipmentPayback(kit, 60, 52).monthlyNet, (520 / 12) * 64 - 12.5); // artist on 40% commission keeps 72
assert.ok(equipmentPayback(kit, 100, 48).monthlyNet < booth.monthlyNet);
const loss = equipmentPayback(kit, 5, 52); // keeps 6 a session, consumables 8
assert.equal(loss.paybackMonths, null);
assert.equal(loss.sessionsToPayback, null);
console.log('payback: all checks pass');
