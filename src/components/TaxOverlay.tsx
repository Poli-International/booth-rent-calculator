import React from 'react';
import { Calculator, Landmark, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { TaxSettings, DealSideResult } from '../types';
import { formatCurrency, formatWholeCurrency } from '../utils/calculator';
import { t } from '../i18n/translations';

interface TaxOverlayProps {
  taxSettings: TaxSettings;
  onUpdateTaxSettings: (settings: TaxSettings) => void;
  boothSide: DealSideResult;
  commSide: DealSideResult;
  grossRevenue: number;
}

export const TaxOverlay: React.FC<TaxOverlayProps> = ({
  taxSettings,
  onUpdateTaxSettings,
  boothSide,
  commSide,
  grossRevenue,
}) => {
  const boothTax = boothSide.artist.tax;
  const commTax = commSide.artist.tax;

  return (
    <div className="tax-overlay-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Landmark size={18} className="text-[var(--primary)]" />
            {t('tax.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {t('tax.subtitle')}
          </p>
        </div>

        {/* Enable Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={taxSettings.enabled}
            onChange={(e) =>
              onUpdateTaxSettings({ ...taxSettings, enabled: e.target.checked })
            }
            className="w-4 h-4 rounded text-[var(--primary)] accent-[var(--primary)] cursor-pointer"
          />
          <span>{t('tax.enable')}</span>
        </label>
      </div>

      {taxSettings.enabled ? (
        <div>
          {/* Regime Selector */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {t('tax.regimeLabel')}:
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onUpdateTaxSettings({ ...taxSettings, regime: 'uk_sole_trader' })}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  taxSettings.regime === 'uk_sole_trader'
                    ? 'bg-[var(--primary)] text-white font-bold'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)]/50'
                }`}
              >
                {t('tax.regimeUk')}
              </button>

              <button
                type="button"
                onClick={() => onUpdateTaxSettings({ ...taxSettings, regime: 'us_self_employed' })}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  taxSettings.regime === 'us_self_employed'
                    ? 'bg-[var(--primary)] text-white font-bold'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)]/50'
                }`}
              >
                {t('tax.regimeUs')}
              </button>

              <button
                type="button"
                onClick={() => onUpdateTaxSettings({ ...taxSettings, regime: 'flat' })}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  taxSettings.regime === 'flat'
                    ? 'bg-[var(--primary)] text-white font-bold'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)]/50'
                }`}
              >
                {t('tax.regimeFlat')}
              </button>
            </div>

            {taxSettings.regime === 'flat' && (
              <div className="flex items-center gap-1.5 ml-auto text-xs">
                <span className="text-[var(--text-muted)] font-medium">Rate:</span>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={taxSettings.flatRatePct || 25}
                  onChange={(e) =>
                    onUpdateTaxSettings({
                      ...taxSettings,
                      flatRatePct: Math.min(60, Math.max(0, Number(e.target.value))),
                    })
                  }
                  className="w-16 px-2 py-1 text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded font-bold text-[var(--text-main)] text-right"
                />
                <span className="font-bold">%</span>
              </div>
            )}
          </div>

          {/* SIDE-BY-SIDE TAX BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Booth Rent Tax Reality */}
            <div className="p-4 rounded-lg bg-[var(--bg-app)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
                <span className="font-bold text-sm text-[var(--text-main)]">
                  Booth Rent (Sole Trader)
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                  {boothTax ? boothTax.effectiveTaxRatePct.toFixed(1) : 0}% Effective Tax
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>{t('tax.gross')}</span>
                  <span className="font-mono text-[var(--text-main)] font-semibold">
                    {formatCurrency(grossRevenue)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    {t('tax.allowable')}
                    <ShieldCheck size={12} />
                  </span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(boothTax ? boothTax.allowableDeductions : 0)}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--text-muted)] pt-1 border-t border-[var(--border)]/50">
                  <span>{t('tax.taxableProfit')}</span>
                  <span className="font-mono text-[var(--text-main)] font-bold">
                    {formatCurrency(boothTax ? boothTax.taxableProfit : 0)}
                  </span>
                </div>

                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>{t('tax.estTax')}</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(boothTax ? boothTax.estimatedTax : 0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-black pt-2 border-t border-[var(--border)] text-[var(--text-main)]">
                  <span>{t('tax.takeHome')}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                    {formatCurrency(boothTax ? boothTax.takeHomeCash : 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Commission Tax Reality */}
            <div className="p-4 rounded-lg bg-[var(--bg-app)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
                <span className="font-bold text-sm text-[var(--text-main)]">
                  Commission Model
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold">
                  {commTax ? commTax.effectiveTaxRatePct.toFixed(1) : 0}% Effective Tax
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>{t('tax.gross')}</span>
                  <span className="font-mono text-[var(--text-main)] font-semibold">
                    {formatCurrency(grossRevenue)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{t('tax.allowable')}</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(commTax ? commTax.allowableDeductions : 0)}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--text-muted)] pt-1 border-t border-[var(--border)]/50">
                  <span>{t('tax.taxableProfit')}</span>
                  <span className="font-mono text-[var(--text-main)] font-bold">
                    {formatCurrency(commTax ? commTax.taxableProfit : 0)}
                  </span>
                </div>

                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>{t('tax.estTax')}</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(commTax ? commTax.estimatedTax : 0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-black pt-2 border-t border-[var(--border)] text-[var(--text-main)]">
                  <span>{t('tax.takeHome')}</span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 text-base">
                    {formatCurrency(commTax ? commTax.takeHomeCash : 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TAX SHIELD EXPLANATION */}
          <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
              {t('tax.allowableHint')}
            </p>
            <p className="text-indigo-700 dark:text-indigo-300">
              {t('tax.shieldBenefit', {
                amount: boothTax
                  ? formatWholeCurrency(boothTax.taxShieldSavings * 12)
                  : '0',
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-app)] border border-dashed border-[var(--border)] rounded-lg">
          <Calculator size={28} className="mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm text-[var(--text-main)] mb-1">
            Tax & Take-Home Overlay is currently inactive
          </p>
          <p className="max-w-md mx-auto mb-3">
            Enable to preview spendable cash in pocket after deducting UK Sole Trader income tax or US self-employment tax.
          </p>
          <button
            type="button"
            onClick={() => onUpdateTaxSettings({ ...taxSettings, enabled: true })}
            className="px-4 py-2 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
          >
            {t('tax.enable')}
          </button>
        </div>
      )}
    </div>
  );
};
