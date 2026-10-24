/**
 * Equipment Payback Component
 * How long a piece of equipment takes to pay for itself under each side of the deal.
 * Absorbed from the retired Equipment ROI Calculator (2026-10-24).
 */

import React, { useState } from 'react';
import { Wrench as IcWrench } from 'lucide-react';
import { DealParameters } from '../types';
import { t } from '../i18n/translations';
import { EquipmentInputs, equipmentPayback, formatCurrency, formatWholeCurrency } from '../utils/calculator';

interface EquipmentPaybackProps {
  deal: DealParameters;
}

// Example figures only; the user replaces them with their own.
const DEFAULTS: EquipmentInputs = {
  cost: 1200,
  sessionsPerDay: 2,
  daysPerWeek: 5,
  pricePerSession: 120,
  consumablesPerSession: 8,
  upkeepPerYear: 150,
  lifespanYears: 5,
};

const FIELDS: { key: keyof EquipmentInputs; step: string; max?: string }[] = [
  { key: 'cost', step: '50' },
  { key: 'sessionsPerDay', step: '0.5', max: '15' },
  { key: 'daysPerWeek', step: '1', max: '7' },
  { key: 'pricePerSession', step: '10' },
  { key: 'consumablesPerSession', step: '1' },
  { key: 'upkeepPerYear', step: '10' },
  { key: 'lifespanYears', step: '1', max: '30' },
];

export const EquipmentPayback: React.FC<EquipmentPaybackProps> = ({ deal }) => {
  const [inputs, setInputs] = useState<EquipmentInputs>(DEFAULTS);
  const comm = deal.commissionPct;

  const rows = [
    { labelKey: 'payback.rowBooth', share: 100 },
    { labelKey: 'payback.rowCommArtist', share: 100 - comm },
    { labelKey: 'payback.rowCommStudio', share: comm },
  ].map((r) => ({ ...r, result: equipmentPayback(inputs, r.share, deal.weeksPerYear) }));

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-5 my-4">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
          <IcWrench size={16} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0 }} />
          <span>{t('payback.secTitle')}</span>
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{t('payback.secDesc')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-3 bg-[var(--bg-input)] rounded-lg border border-[var(--border)]">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`payback-${f.key}`} className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t(`payback.${f.key}`)}
            </label>
            <input
              id={`payback-${f.key}`}
              type="number"
              min="0"
              max={f.max}
              step={f.step}
              value={inputs[f.key]}
              onChange={(e) => setInputs({ ...inputs, [f.key]: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="input-field text-sm font-mono"
            />
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="py-2 px-2">{t('payback.colWho')}</th>
              <th className="py-2 px-2">{t('payback.colShare')}</th>
              <th className="py-2 px-2">{t('payback.colMonthlyNet')}</th>
              <th className="py-2 px-2">{t('payback.colPayback')}</th>
              <th className="py-2 px-2">{t('payback.colSessions')}</th>
              <th className="py-2 px-2">{t('payback.colLifetime', { years: inputs.lifespanYears })}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ labelKey, share, result }) => (
              <tr key={labelKey} className="border-b border-[var(--border)]">
                <td className="py-2 px-2 font-semibold text-[var(--text-main)]">{t(labelKey, { pct: comm })}</td>
                <td className="py-2 px-2 font-mono">{share}%</td>
                <td className="py-2 px-2 font-mono">{formatCurrency(result.monthlyNet)}</td>
                <td className="py-2 px-2 font-mono font-bold">
                  {result.paybackMonths === null
                    ? t('payback.never')
                    : t('payback.months', { months: result.paybackMonths.toFixed(1) })}
                </td>
                <td className="py-2 px-2 font-mono">{result.sessionsToPayback ?? '—'}</td>
                <td className={`py-2 px-2 font-mono ${result.lifetimeNet < 0 ? 'text-[var(--warn-text)]' : ''}`}>
                  {formatWholeCurrency(result.lifetimeNet)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-3">{t('payback.note', { pct: comm, weeks: deal.weeksPerYear })}</p>
    </div>
  );
};
