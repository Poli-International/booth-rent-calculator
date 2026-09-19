import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Trophy, Sparkles, Building2, User } from 'lucide-react';
import { CompetingOffer, DealParameters, InclusionItem } from '../types';
import { computeCompetingOfferResult, formatCurrency } from '../utils/calculator';
import { t } from '../i18n/translations';

interface MultiDealComparisonProps {
  baselineDeal: DealParameters;
  inclusions: InclusionItem[];
  monthlyRevenue: number;
}

export const MultiDealComparison: React.FC<MultiDealComparisonProps> = ({
  baselineDeal,
  inclusions,
  monthlyRevenue,
}) => {
  const [offers, setOffers] = useState<CompetingOffer[]>([
    {
      id: 'offer-baseline',
      name: 'Offer A: Baseline',
      type: baselineDeal.dealStructure === 'hybrid' ? 'hybrid' : 'booth',
      weeklyRent: baselineDeal.weeklyRent,
      commissionPct: baselineDeal.commissionPct,
      hybridBaseRent: baselineDeal.hybridBaseWeeklyRent || 120,
      hybridCommPct: baselineDeal.hybridCommissionPct || 20,
      notes: 'Current baseline configuration',
    },
    {
      id: 'offer-high-comm',
      name: 'Offer B: 60/40 Split Studio',
      type: 'comm',
      weeklyRent: 250,
      commissionPct: 40,
      notes: 'Busy high-street walk-in studio',
    },
    {
      id: 'offer-hybrid',
      name: 'Offer C: Low Rent + 15% Cut',
      type: 'hybrid',
      weeklyRent: 250,
      commissionPct: 40,
      hybridBaseRent: 100,
      hybridCommPct: 15,
      notes: 'Hybrid security with upside',
    },
  ]);

  const addOffer = () => {
    if (offers.length >= 4) return;
    const newOffer: CompetingOffer = {
      id: 'offer-' + Date.now(),
      name: `Offer ${String.fromCharCode(65 + offers.length)}: Custom Deal`,
      type: 'booth',
      weeklyRent: 275,
      commissionPct: 45,
      hybridBaseRent: 120,
      hybridCommPct: 20,
    };
    setOffers([...offers, newOffer]);
  };

  const removeOffer = (id: string) => {
    if (offers.length <= 1) return;
    setOffers(offers.filter((o) => o.id !== id));
  };

  const updateOffer = (id: string, updates: Partial<CompetingOffer>) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  // Compute results for each offer
  const computedOffers = offers.map((offer) => {
    const res = computeCompetingOfferResult(offer, monthlyRevenue, inclusions);
    return {
      ...offer,
      results: res,
    };
  });

  // Identify best for artist (highest net income) and best for owner (highest owner net)
  let maxArtistNet = -Infinity;
  let maxOwnerNet = -Infinity;
  let bestArtistOfferId = '';
  let bestOwnerOfferId = '';

  computedOffers.forEach((o) => {
    if (o.results.artistNetMonthly > maxArtistNet) {
      maxArtistNet = o.results.artistNetMonthly;
      bestArtistOfferId = o.id;
    }
    if (o.results.ownerNetMonthly > maxOwnerNet) {
      maxOwnerNet = o.results.ownerNetMonthly;
      bestOwnerOfferId = o.id;
    }
  });

  const baselineArtistNet = computedOffers[0]?.results.artistNetMonthly || 0;

  return (
    <div className="multi-deal-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Trophy size={18} className="text-[var(--primary)]" />
            {t('multiDeal.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {t('multiDeal.subtitle')}
          </p>
        </div>

        {offers.length < 4 && (
          <button
            type="button"
            id="btn-add-competing-offer"
            onClick={addOffer}
            className="px-3 py-2 text-xs font-semibold rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)] flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={15} />
            <span>{t('multiDeal.addOffer')}</span>
          </button>
        )}
      </div>

      {/* OFFERS INPUT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {computedOffers.map((offer, idx) => (
          <div
            key={offer.id}
            className={`border rounded-lg p-3.5 flex flex-col justify-between transition-all ${
              offer.id === bestArtistOfferId
                ? 'border-[var(--primary)] bg-[var(--bg-card)] shadow-sm'
                : 'border-[var(--border)] bg-[var(--bg-card)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  aria-label={t('multiDeal.offerName')}
                  value={offer.name}
                  onChange={(e) => updateOffer(offer.id, { name: e.target.value })}
                  className="font-bold text-xs sm:text-sm bg-transparent border-b border-dashed border-[var(--border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] w-full mr-2 py-0.5"
                />
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeOffer(offer.id)}
                    aria-label={`Remove ${offer.name}`}
                    className="text-[var(--text-muted)] hover:text-red-500 p-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Type selection */}
              <div className="flex gap-1 mb-3">
                {(['booth', 'comm', 'hybrid'] as const).map((tType) => (
                  <button
                    key={tType}
                    type="button"
                    onClick={() => updateOffer(offer.id, { type: tType })}
                    className={`flex-1 text-[11px] py-1 px-1.5 rounded font-medium transition-all cursor-pointer ${
                      offer.type === tType
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {tType === 'booth'
                      ? t('multiDeal.typeBooth')
                      : tType === 'comm'
                      ? t('multiDeal.typeComm')
                      : t('multiDeal.typeHybrid')}
                  </button>
                ))}
              </div>

              {/* Param inputs depending on type */}
              {offer.type === 'booth' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)]">{t('multiDeal.rentLabel')}</span>
                    <div className="flex items-center gap-1">
                      <span>£</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={offer.weeklyRent}
                        onChange={(e) =>
                          updateOffer(offer.id, { weeklyRent: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-20 px-2 py-1 text-right text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-[var(--text-main)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {offer.type === 'comm' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)]">{t('multiDeal.commLabel')}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={offer.commissionPct}
                        onChange={(e) =>
                          updateOffer(offer.id, {
                            commissionPct: Math.min(100, Math.max(0, Number(e.target.value))),
                          })
                        }
                        className="w-16 px-2 py-1 text-right text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-[var(--text-main)]"
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              )}

              {offer.type === 'hybrid' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)]">{t('multiDeal.hybridBaseRent')}</span>
                    <div className="flex items-center gap-1">
                      <span>£</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={offer.hybridBaseRent || 100}
                        onChange={(e) =>
                          updateOffer(offer.id, {
                            hybridBaseRent: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-16 px-2 py-1 text-right text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-[var(--text-main)]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-muted)]">{t('multiDeal.hybridCommPct')}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={offer.hybridCommPct || 15}
                        onChange={(e) =>
                          updateOffer(offer.id, {
                            hybridCommPct: Math.min(100, Math.max(0, Number(e.target.value))),
                          })
                        }
                        className="w-16 px-2 py-1 text-right text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-[var(--text-main)]"
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick badges */}
            <div className="mt-3 pt-2 border-t border-[var(--border)] flex flex-wrap gap-1">
              {offer.id === bestArtistOfferId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <Sparkles size={11} /> {t('multiDeal.bestForArtist')}
                </span>
              )}
              {offer.id === bestOwnerOfferId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  <Building2 size={11} /> {t('multiDeal.bestForOwner')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SIDE-BY-SIDE MATRIX TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-bold">
              <th className="py-2.5 px-3">{t('multiDeal.thOffer')}</th>
              <th className="py-2.5 px-3 text-right">{t('multiDeal.thGross')}</th>
              <th className="py-2.5 px-3 text-right">{t('multiDeal.thDeductions')}</th>
              <th className="py-2.5 px-3 text-right font-black text-[var(--text-main)]">
                {t('multiDeal.thArtistNet')}
              </th>
              <th className="py-2.5 px-3 text-right">{t('multiDeal.thRetained')}</th>
              <th className="py-2.5 px-3 text-right">{t('multiDeal.thOwnerNet')}</th>
              <th className="py-2.5 px-3 text-right">{t('multiDeal.thDelta')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {computedOffers.map((o, idx) => {
              const delta = o.results.artistNetMonthly - baselineArtistNet;
              const isBest = o.id === bestArtistOfferId;

              return (
                <tr
                  key={o.id}
                  className={`hover:bg-[var(--border)]/30 transition-colors ${
                    isBest ? 'bg-[var(--primary)]/5 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                      {isBest && <CheckCircle size={14} className="text-emerald-500" />}
                      <span>{o.name}</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      {o.type}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-[var(--text-muted)]">
                    {formatCurrency(o.results.monthlyGross)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                    -{formatCurrency(o.results.monthlyDeductions)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-[var(--text-main)] text-sm">
                    {formatCurrency(o.results.artistNetMonthly)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-semibold text-[var(--text-main)]">
                    {o.results.retainedPct.toFixed(1)}%
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-[var(--text-muted)]">
                    {formatCurrency(o.results.ownerNetMonthly)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {idx === 0 ? (
                      <span className="text-[var(--text-muted)] text-[11px]">—</span>
                    ) : delta > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(delta)}
                      </span>
                    ) : delta < 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">
                        {formatCurrency(delta)}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">£0.00</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
