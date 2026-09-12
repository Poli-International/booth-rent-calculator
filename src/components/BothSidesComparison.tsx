/**
 * Both Sides of the Same Deal Component
 * Displays the exact same revenue stream from the Artist's and Studio Owner's perspective.
 */

import React from 'react';
import { DealSideResult } from '../types';
import { t } from '../i18n/translations';
import { formatCurrency } from '../utils/calculator';
import { User, Building2 } from 'lucide-react';

interface BothSidesComparisonProps {
  booth: DealSideResult;
  comm: DealSideResult;
  grossMonthlyRevenue: number;
}

export const BothSidesComparison: React.FC<BothSidesComparisonProps> = ({
  booth,
  comm,
  grossMonthlyRevenue,
}) => {
  const artistDiff = booth.artist.netIncomeMonthly - comm.artist.netIncomeMonthly;
  const ownerDiff = booth.owner.netIncomeMonthly - comm.owner.netIncomeMonthly;

  return (
    <div className="my-4">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
          <span>⚖️</span>
          <span>{t('comparison.secTitle')}</span>
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {t('comparison.secDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ARTIST PERSPECTIVE */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--c-comm)]">
                <User size={17} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">
                  {t('comparison.artistTitle')}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {t('comparison.artistSubtitle')}
                </p>
              </div>
            </div>

            {/* Side-by-side sub-columns: Booth vs Commission for Artist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Booth Model */}
              <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border)]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--c-booth)] mb-2">
                  <span className="w-2 h-2 rotate-45 bg-[var(--c-booth)] inline-block" />
                  <span>{t('comparison.boothModel')}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.rentPaid')}</span>
                    <span className="font-mono text-[var(--text-main)]">-{formatCurrency(booth.artist.rent)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.inclusions')}</span>
                    <span className="font-mono text-[var(--text-main)]">-{formatCurrency(booth.artist.totalInclusions)}</span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-[var(--border)]">
                    <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('comparison.netTakeHome')}</span>
                    <span className="font-mono font-extrabold text-sm text-[var(--text-main)] block">
                      {formatCurrency(booth.artist.netIncomeMonthly)}
                      <span className="text-xs font-normal text-[var(--text-muted)]"> {t('common.perMonth')}</span>
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {t('comparison.retainedPct', { pct: booth.artist.retainedPct.toFixed(1) })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Model */}
              <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border)]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--c-comm)] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--c-comm)] inline-block" />
                  <span>{t('comparison.commModel')}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.commissionPaid')}</span>
                    <span className="font-mono text-[var(--text-main)]">-{formatCurrency(comm.artist.commission)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.inclusions')}</span>
                    <span className="font-mono text-[var(--text-main)]">-{formatCurrency(comm.artist.totalInclusions)}</span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-[var(--border)]">
                    <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('comparison.netTakeHome')}</span>
                    <span className="font-mono font-extrabold text-sm text-[var(--text-main)] block">
                      {formatCurrency(comm.artist.netIncomeMonthly)}
                      <span className="text-xs font-normal text-[var(--text-muted)]"> {t('common.perMonth')}</span>
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {t('comparison.retainedPct', { pct: comm.artist.retainedPct.toFixed(1) })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Delta Highlight */}
          <div className="bg-[var(--bg-input)] p-2.5 rounded-lg border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">{t('comparison.atCurrentVolume')}</span>
            <span className="font-mono font-bold text-[var(--text-main)]">
              {artistDiff > 0
                ? t('comparison.artistBoothWins', { amount: formatCurrency(Math.abs(artistDiff)) })
                : artistDiff < 0
                ? t('comparison.artistCommWins', { amount: formatCurrency(Math.abs(artistDiff)) })
                : t('comparison.artistEqual')}
            </span>
          </div>
        </div>

        {/* OWNER PERSPECTIVE */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--c-booth)]">
                <Building2 size={17} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">
                  {t('comparison.ownerTitle')}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {t('comparison.ownerSubtitle')}
                </p>
              </div>
            </div>

            {/* Side-by-side sub-columns: Booth vs Commission for Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Booth Model */}
              <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border)]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--c-booth)] mb-2">
                  <span className="w-2 h-2 rotate-45 bg-[var(--c-booth)] inline-block" />
                  <span>{t('comparison.boothModel')}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.rentCollected')}</span>
                    <span className="font-mono text-[var(--text-main)]">+{formatCurrency(booth.owner.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.overheadCovered')}</span>
                    <span className="font-mono text-[var(--text-main)]">-{formatCurrency(booth.owner.totalInclusions)}</span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-[var(--border)]">
                    <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('comparison.studioMargin')}</span>
                    <span className="font-mono font-extrabold text-sm text-[var(--text-main)] block">
                      {formatCurrency(booth.owner.netIncomeMonthly)}
                      <span className="text-xs font-normal text-[var(--text-muted)]"> {t('common.perMonth')}</span>
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {t('comparison.studioMarginPct', {
                        pct: grossMonthlyRevenue > 0 ? ((booth.owner.netIncomeMonthly / grossMonthlyRevenue) * 100).toFixed(1) : 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Model */}
              <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border)]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--c-comm)] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--c-comm)] inline-block" />
                  <span>{t('comparison.commModel')}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.commissionRecv')}</span>
                    <span className="font-mono text-[var(--text-main)]">+{formatCurrency(comm.owner.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{t('comparison.overheadCovered')}</span>
                    <span className="font-mono text-[var(--text-main)]">-{formatCurrency(comm.owner.totalInclusions)}</span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-[var(--border)]">
                    <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('comparison.studioMargin')}</span>
                    <span className="font-mono font-extrabold text-sm text-[var(--text-main)] block">
                      {formatCurrency(comm.owner.netIncomeMonthly)}
                      <span className="text-xs font-normal text-[var(--text-muted)]"> {t('common.perMonth')}</span>
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {t('comparison.studioMarginPct', {
                        pct: grossMonthlyRevenue > 0 ? ((comm.owner.netIncomeMonthly / grossMonthlyRevenue) * 100).toFixed(1) : 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Delta Highlight */}
          <div className="bg-[var(--bg-input)] p-2.5 rounded-lg border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">{t('comparison.atCurrentVolume')}</span>
            <span className="font-mono font-bold text-[var(--text-main)]">
              {ownerDiff > 0
                ? t('comparison.ownerBoothWins', { amount: formatCurrency(Math.abs(ownerDiff)) })
                : ownerDiff < 0
                ? t('comparison.ownerCommWins', { amount: formatCurrency(Math.abs(ownerDiff)) })
                : t('comparison.ownerEqual')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
