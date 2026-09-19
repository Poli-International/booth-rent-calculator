import React, { useState, useMemo } from 'react';
import { Calendar, AlertCircle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { DealParameters, InclusionItem } from '../types';
import {
  DEFAULT_SEASONALITY_INPUTS,
  SeasonalityInputMonth,
  computeSeasonalitySummary,
  formatCurrency,
  formatWholeCurrency,
} from '../utils/calculator';
import { t } from '../i18n/translations';

interface SeasonalityCashFlowProps {
  deal: DealParameters;
  inclusions: InclusionItem[];
  baselineGrossMonthly: number;
}

export const SeasonalityCashFlow: React.FC<SeasonalityCashFlowProps> = ({
  deal,
  inclusions,
  baselineGrossMonthly,
}) => {
  const [monthsData, setMonthsData] = useState<SeasonalityInputMonth[]>(DEFAULT_SEASONALITY_INPUTS);

  const summary = useMemo(() => {
    return computeSeasonalitySummary(baselineGrossMonthly, deal, inclusions, monthsData);
  }, [baselineGrossMonthly, deal, inclusions, monthsData]);

  const updateMonth = (idx: number, updates: Partial<SeasonalityInputMonth>) => {
    setMonthsData((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...updates } : m))
    );
  };

  const resetToDefault = () => {
    setMonthsData(DEFAULT_SEASONALITY_INPUTS);
  };

  // Find highest monthly revenue for chart normalization
  const maxGross = Math.max(...summary.months.map((m) => Math.max(m.grossRevenue, m.boothArtistNet, m.commArtistNet, 1000)));

  return (
    <div className="seasonality-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-6 mb-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Calendar size={18} className="text-[var(--primary)]" />
            {t('seasonality.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {t('seasonality.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={resetToDefault}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/50 flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] sm:min-h-0 self-start sm:self-auto"
        >
          <RefreshCw size={13} />
          <span>{t('common.reset')}</span>
        </button>
      </div>

      {/* KEY ANNUAL METRICS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
            {t('seasonality.annualGross')}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-[var(--text-main)] mt-1 block">
            {formatWholeCurrency(summary.annualGross)}
          </span>
        </div>

        <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
            {t('seasonality.annualBoothNet')}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatWholeCurrency(summary.annualBoothArtistNet)}
          </span>
        </div>

        <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
            {t('seasonality.annualCommNet')}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-sky-600 dark:text-sky-400 mt-1 block">
            {formatWholeCurrency(summary.annualCommArtistNet)}
          </span>
        </div>

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block">
            {t('seasonality.recommendedBuffer')}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-800 dark:text-amber-200 mt-1 block">
            {formatWholeCurrency(summary.recommendedReserveBuffer)}
          </span>
        </div>
      </div>

      {/* VACATION / DOWNTIME ALERT */}
      {summary.totalRentDuringTimeOff > 0 && (
        <div className="p-4 mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <ShieldAlert size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold">
              {t('seasonality.rentWhileAwayAlert', {
                amount: Math.round(summary.totalRentDuringTimeOff).toString(),
              })}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {t('seasonality.recommendedBufferDesc')}
            </p>
          </div>
        </div>
      )}

      {/* VISUAL CASH FLOW SVG BAR CHART */}
      <div className="mb-6 p-4 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--text-main)]">
            12-Month Net Cash Flow Comparison
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-[var(--text-muted)]">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              Booth Net
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[var(--text-muted)]">
              <span className="w-3 h-3 rounded bg-sky-500 inline-block" />
              Commission Net
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[var(--text-muted)]">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
              Rent While Away
            </span>
          </div>
        </div>

        <div className="h-44 flex items-end gap-1 sm:gap-2 pt-6">
          {summary.months.map((m) => {
            const boothHeightPct = Math.max(4, (m.boothArtistNet / maxGross) * 100);
            const commHeightPct = Math.max(4, (m.commArtistNet / maxGross) * 100);
            const shortMonth = t(m.monthKey).slice(0, 3);

            return (
              <div key={m.monthIndex} className="flex-1 flex flex-col items-center h-full justify-end">
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full pb-1">
                  {/* Booth bar */}
                  <div
                    style={{ height: `${boothHeightPct}%` }}
                    className="w-1/2 max-w-[14px] bg-emerald-500 rounded-t transition-all hover:opacity-80"
                    title={`Booth Net: ${formatCurrency(m.boothArtistNet)}`}
                  />
                  {/* Commission bar */}
                  <div
                    style={{ height: `${commHeightPct}%` }}
                    className="w-1/2 max-w-[14px] bg-sky-500 rounded-t transition-all hover:opacity-80"
                    title={`Commission Net: ${formatCurrency(m.commArtistNet)}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1 truncate">
                  {shortMonth}
                </span>
                {m.weeksOff > 0 && (
                  <span className="text-[9px] font-black text-amber-600 dark:text-amber-400">
                    {m.weeksOff}w off
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* EDITABLE 12-MONTH TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-bold">
              <th className="py-2 px-2.5">{t('seasonality.colMonth')}</th>
              <th className="py-2 px-2.5 text-center">{t('seasonality.colMultiplier')}</th>
              <th className="py-2 px-2.5 text-center">{t('seasonality.colWeeksOff')}</th>
              <th className="py-2 px-2.5 text-right">{t('seasonality.colGross')}</th>
              <th className="py-2 px-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                {t('seasonality.colBoothNet')}
              </th>
              <th className="py-2 px-2.5 text-right font-semibold text-sky-600 dark:text-sky-400">
                {t('seasonality.colCommNet')}
              </th>
              <th className="py-2 px-2.5 text-right text-amber-600 dark:text-amber-400">
                {t('seasonality.colRentAway')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {summary.months.map((m, idx) => (
              <tr key={m.monthIndex} className="hover:bg-[var(--border)]/20 transition-colors">
                <td className="py-2 px-2.5 font-bold text-[var(--text-main)]">
                  {t(m.monthKey)}
                </td>

                <td className="py-2 px-2.5 text-center">
                  <select
                    value={m.multiplier}
                    onChange={(e) => updateMonth(idx, { multiplier: parseFloat(e.target.value) })}
                    className="bg-[var(--bg-app)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs text-[var(--text-main)] font-medium cursor-pointer"
                  >
                    <option value="0.6">0.6x (Very Slow)</option>
                    <option value="0.75">0.75x (Slow)</option>
                    <option value="0.85">0.85x (Quiet)</option>
                    <option value="1.0">1.0x (Average)</option>
                    <option value="1.1">1.1x (Steady)</option>
                    <option value="1.2">1.2x (Busy)</option>
                    <option value="1.3">1.3x (Holiday Surge)</option>
                  </select>
                </td>

                <td className="py-2 px-2.5 text-center">
                  <select
                    value={m.weeksOff}
                    onChange={(e) => updateMonth(idx, { weeksOff: parseInt(e.target.value, 10) })}
                    className="bg-[var(--bg-app)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs text-[var(--text-main)] font-medium cursor-pointer"
                  >
                    <option value="0">0 weeks</option>
                    <option value="1">1 week</option>
                    <option value="2">2 weeks</option>
                    <option value="3">3 weeks</option>
                    <option value="4">4 weeks (Full month off)</option>
                  </select>
                </td>

                <td className="py-2 px-2.5 text-right font-mono text-[var(--text-muted)]">
                  {formatCurrency(m.grossRevenue)}
                </td>

                <td className="py-2 px-2.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(m.boothArtistNet)}
                </td>

                <td className="py-2 px-2.5 text-right font-mono font-semibold text-sky-600 dark:text-sky-400">
                  {formatCurrency(m.commArtistNet)}
                </td>

                <td className="py-2 px-2.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                  {m.rentOwedWhileAway > 0 ? formatCurrency(m.rentOwedWhileAway) : '£0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
