/**
 * Realistic Month Spread Component
 * Calculates revenue based on working days, client appointments, average ticket, and no-show rate.
 * Shows the financial spread (Conservative, Expected, Peak) from both sides of the deal.
 */

import React from 'react';
import { RealisticMonthParams, MonthSpreadScenario } from '../types';
import { t } from '../i18n/translations';
import { formatCurrency } from '../utils/calculator';

interface RealisticMonthSpreadProps {
  params: RealisticMonthParams;
  scenarios: {
    conservative: MonthSpreadScenario;
    expected: MonthSpreadScenario;
    peak: MonthSpreadScenario;
  };
  onUpdateParams: (params: RealisticMonthParams) => void;
}

export const RealisticMonthSpread: React.FC<RealisticMonthSpreadProps> = ({
  params,
  scenarios,
  onUpdateParams,
}) => {
  const updateField = <K extends keyof RealisticMonthParams>(
    key: K,
    value: RealisticMonthParams[K]
  ) => {
    onUpdateParams({ ...params, [key]: value });
  };

  const scenarioList = [scenarios.conservative, scenarios.expected, scenarios.peak];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-5 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <span>📅</span>
            <span>{t('realistic.secTitle')}</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('realistic.secDesc')}
          </p>
        </div>

        {/* Toggle between realistic schedule or direct entry */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[var(--bg-input)] p-1 rounded-lg border border-[var(--border)]">
          <button
            type="button"
            onClick={() => updateField('useRealisticEngine', true)}
            className={`min-h-[44px] px-3.5 py-2 text-xs rounded-md font-semibold transition-all inline-flex items-center justify-center ${
              params.useRealisticEngine
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {t('realistic.btnSchedule')}
          </button>
          <button
            type="button"
            onClick={() => updateField('useRealisticEngine', false)}
            className={`min-h-[44px] px-3.5 py-2 text-xs rounded-md font-semibold transition-all inline-flex items-center justify-center ${
              !params.useRealisticEngine
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {t('realistic.btnDirect')}
          </button>
        </div>
      </div>

      {/* Parameter Inputs */}
      {params.useRealisticEngine ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-3 bg-[var(--bg-input)] rounded-lg border border-[var(--border)]">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t('realistic.workingDays')}
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={params.workingDaysPerMonth}
              onChange={(e) => updateField('workingDaysPerMonth', Math.max(1, parseInt(e.target.value) || 0))}
              className="input-field text-sm font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] block mt-0.5">
              {t('realistic.workingDaysHint')}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t('realistic.apptsPerDay')}
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="15"
              value={params.apptsPerDay}
              onChange={(e) => updateField('apptsPerDay', Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="input-field text-sm font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] block mt-0.5">
              {t('realistic.apptsPerDayHint')}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t('realistic.avgTicket')}
            </label>
            <input
              type="number"
              step="10"
              min="10"
              value={params.avgTicket}
              onChange={(e) => updateField('avgTicket', Math.max(1, parseFloat(e.target.value) || 0))}
              className="input-field text-sm font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] block mt-0.5">
              {t('realistic.avgTicketHint')}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t('realistic.noShowRate')}
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="80"
              value={params.noShowRatePct}
              onChange={(e) => updateField('noShowRatePct', Math.max(0, parseFloat(e.target.value) || 0))}
              className="input-field text-sm font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] block mt-0.5">
              {t('realistic.noShowHint')}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-5 p-3 bg-[var(--bg-input)] rounded-lg border border-[var(--border)] max-w-sm">
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            {t('realistic.directRevenue')}
          </label>
          <input
            type="number"
            step="100"
            min="0"
            value={params.directMonthlyRevenue}
            onChange={(e) => updateField('directMonthlyRevenue', Math.max(0, parseFloat(e.target.value) || 0))}
            className="input-field text-base font-mono"
          />
        </div>
      )}

      {/* Spread Cards: Conservative, Expected, Peak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarioList.map((sc, idx) => {
          const isExpected = idx === 1;
          const boothArtistNet = sc.booth.artist.netIncomeMonthly;
          const commArtistNet = sc.comm.artist.netIncomeMonthly;
          const boothOwnerNet = sc.booth.owner.netIncomeMonthly;
          const commOwnerNet = sc.comm.owner.netIncomeMonthly;
          const diff = Math.abs(boothArtistNet - commArtistNet);

          return (
            <div
              key={sc.labelKey}
              className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
                isExpected
                  ? 'bg-[var(--bg-card)] border-[var(--primary)] ring-1 ring-[var(--primary)] ring-opacity-30'
                  : 'bg-[var(--bg-input)] border-[var(--border)] opacity-95'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[var(--text-main)]">
                    {t(sc.labelKey)}
                  </span>
                  {isExpected && (
                    <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--primary)] bg-opacity-20 text-[var(--primary)]">
                      {t('realistic.baselineBadge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-2.5">
                  {t(sc.descKey)}
                </p>

                {/* Scenario Metrics */}
                <div className="space-y-1.5 text-xs py-2 border-y border-[var(--border)] mb-3">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('realistic.estCompletedClients')}</span>
                    <span className="font-mono text-[var(--text-main)]">
                      {t('realistic.apptsCount', { count: Math.round(sc.appointments) })}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('realistic.grossClientRevenue')}</span>
                    <span className="font-mono font-bold text-[var(--text-main)]">
                      {formatCurrency(sc.grossRevenue)}
                    </span>
                  </div>
                </div>

                {/* Artist Net Under Both */}
                <div className="mb-2.5">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    {t('realistic.artistNetTakeHome')}
                  </span>
                  <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-[var(--bg-card)] border border-[var(--border)] mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--c-booth)]">
                      <span className="w-2 h-2 rotate-45 bg-[var(--c-booth)] inline-block" />
                      {t('realistic.boothRentLabel')}
                    </span>
                    <span className="font-mono font-bold text-[var(--text-main)]">
                      {formatCurrency(boothArtistNet)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-[var(--bg-card)] border border-[var(--border)]">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--c-comm)]">
                      <span className="w-2 h-2 rounded-full bg-[var(--c-comm)] inline-block" />
                      {t('realistic.commissionLabel')}
                    </span>
                    <span className="font-mono font-bold text-[var(--text-main)]">
                      {formatCurrency(commArtistNet)}
                    </span>
                  </div>
                </div>

                {/* Owner Net Under Both */}
                <div>
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    {t('realistic.ownerNetMargin')}
                  </span>
                  <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-[var(--bg-card)] border border-[var(--border)] mb-1">
                    <span className="text-[var(--text-muted)]">{t('realistic.boothModelLabel')}</span>
                    <span className="font-mono font-semibold text-[var(--text-main)]">
                      {formatCurrency(boothOwnerNet)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1 px-2 rounded bg-[var(--bg-card)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">{t('realistic.commissionOwnerLabel')}</span>
                    <span className="font-mono font-semibold text-[var(--text-main)]">
                      {formatCurrency(commOwnerNet)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spread Delta Highlight */}
              <div className="mt-3 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)] flex items-center justify-between">
                <span>{t('realistic.modelSpread')}</span>
                <span className="font-mono font-bold text-[var(--text-main)]">
                  {boothArtistNet >= commArtistNet
                    ? t('realistic.boothDelta', { amount: formatCurrency(diff) })
                    : t('realistic.commDelta', { amount: formatCurrency(diff) })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
