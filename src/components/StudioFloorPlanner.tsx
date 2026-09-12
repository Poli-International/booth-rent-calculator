import React, { useState, useMemo } from 'react';
import { Building2, Plus, Trash2, ShieldCheck, AlertTriangle, Users, Store } from 'lucide-react';
import { StudioChair } from '../types';
import {
  DEFAULT_STUDIO_CHAIRS,
  computeStudioFloorModel,
  formatCurrency,
  formatWholeCurrency,
} from '../utils/calculator';
import { t, resolveName, getCurrencySymbol } from '../i18n/translations';

export const StudioFloorPlanner: React.FC = () => {
  const [chairs, setChairs] = useState<StudioChair[]>(DEFAULT_STUDIO_CHAIRS);
  const [overhead, setOverhead] = useState<number>(3200);

  const model = useMemo(() => {
    return computeStudioFloorModel(chairs, overhead);
  }, [chairs, overhead]);

  const addChair = () => {
    if (chairs.length >= 10) return;
    const newChair: StudioChair = {
      id: 'chair-' + Date.now(),
      nameKey: 'studio.newStation',
      nameParams: { number: chairs.length + 1 },
      model: 'booth',
      weeklyRent: 250,
      commissionPct: 45,
      monthlyRevenue: 4000,
    };
    setChairs([...chairs, newChair]);
  };

  const removeChair = (id: string) => {
    if (chairs.length <= 1) return;
    setChairs(chairs.filter((c) => c.id !== id));
  };

  const updateChair = (id: string, updates: Partial<StudioChair>) => {
    setChairs(chairs.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  return (
    <div className="studio-planner-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Building2 size={18} className="text-[var(--primary)]" />
            {t('studio.title')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {t('studio.subtitle')}
          </p>
        </div>

        {chairs.length < 10 && (
          <button
            type="button"
            id="btn-add-station-chair"
            onClick={addChair}
            className="px-3 py-2 text-xs font-semibold rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)] flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={15} />
            <span>{t('studio.addChair')}</span>
          </button>
        )}
      </div>

      {/* STUDIO FIXED OVERHEAD & TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
          <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
            {t('studio.monthlyOverhead')}
          </label>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold">{getCurrencySymbol()}</span>
            <input
              type="number"
              min="0"
              step="100"
              value={overhead}
              onChange={(e) => setOverhead(Math.max(0, Number(e.target.value)))}
              className="w-full text-base sm:text-lg font-black font-mono bg-transparent border-b border-dashed border-[var(--border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] block mt-1">
            {t('studio.overheadShortHint')}
          </span>
        </div>

        <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
            {t('studio.studioRevenueTotal')}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-[var(--text-main)] mt-1 block">
            {formatWholeCurrency(model.totalStudioRevenue)}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] block mt-1">
            {t('studio.revenueFromActive')}
          </span>
        </div>

        <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
            {t('studio.studioNetProfit')}
          </span>
          <span
            className={`text-base sm:text-lg font-black font-mono mt-1 block ${
              model.totalStudioNetProfit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {model.totalStudioNetProfit >= 0 ? '+' : ''}
            {formatWholeCurrency(model.totalStudioNetProfit)}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] block mt-1">
            {t('studio.monthlyMargin')}
          </span>
        </div>

        <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block">
            {t('studio.occupancyBreakEven')}
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-indigo-800 dark:text-indigo-200 mt-1 block">
            {t('studio.chairsCount', { count: model.breakEvenChairsNeeded, total: chairs.length })}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-1">
            {t('studio.requiredForRent')}
          </span>
        </div>
      </div>

      {/* VACANCY IMPACT & OCCUPANCY BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg mb-6 text-xs">
        <div className="flex items-center gap-2">
          <Store size={16} className="text-[var(--primary)] shrink-0" />
          <span className="font-semibold text-[var(--text-main)]">
            {t('studio.occupancyRate', { pct: model.occupancyRatePct.toFixed(0) })}
          </span>
        </div>

        <div className="text-[var(--text-muted)] flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <span>
            {t('studio.emptyChairCost', {
              amount: Math.round(model.emptyChairLostMonthly).toString(),
            })}
          </span>
        </div>
      </div>

      {/* STATIONS LIST */}
      <div className="space-y-3">
        {chairs.map((chair, idx) => (
          <div
            key={chair.id}
            className="p-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={t('studio.stationName')}
                  value={resolveName(chair.name, chair.nameKey, chair.nameParams)}
                  onChange={(e) => updateChair(chair.id, { name: e.target.value })}
                  className="font-bold text-xs sm:text-sm bg-transparent border-b border-dashed border-[var(--border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] w-full max-w-xs py-0.5"
                />
              </div>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-1">
              {(['booth', 'comm', 'vacant'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateChair(chair.id, { model: m })}
                  className={`text-xs px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    chair.model === m
                      ? m === 'booth'
                        ? 'bg-emerald-600 text-white'
                        : m === 'comm'
                        ? 'bg-sky-600 text-white'
                        : 'bg-rose-600 text-white'
                      : 'bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {m === 'booth'
                    ? t('studio.modelBooth')
                    : m === 'comm'
                    ? t('studio.modelComm')
                    : t('studio.modelVacant')}
                </button>
              ))}
            </div>

            {/* Params */}
            <div className="flex items-center gap-4 text-xs">
              {chair.model === 'booth' && (
                <div className="flex items-center gap-1">
                  <span className="text-[var(--text-muted)]">{t('studio.rentLabel')} {getCurrencySymbol()}</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={chair.weeklyRent}
                    onChange={(e) =>
                      updateChair(chair.id, { weeklyRent: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-16 px-1.5 py-0.5 bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right text-[var(--text-main)]"
                  />
                  <span className="text-[var(--text-muted)]">{t('common.perWeek')}</span>
                </div>
              )}

              {chair.model === 'comm' && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--text-muted)]">{t('studio.cutLabel')}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="5"
                      value={chair.commissionPct}
                      onChange={(e) =>
                        updateChair(chair.id, {
                          commissionPct: Math.min(100, Math.max(0, Number(e.target.value))),
                        })
                      }
                      className="w-14 px-1.5 py-0.5 bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right text-[var(--text-main)]"
                    />
                    <span className="text-[var(--text-muted)]">%</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[var(--text-muted)]">{t('studio.revLabel')} {getCurrencySymbol()}</span>
                    <input
                      type="number"
                      min="0"
                      step="200"
                      value={chair.monthlyRevenue}
                      onChange={(e) =>
                        updateChair(chair.id, {
                          monthlyRevenue: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-20 px-1.5 py-0.5 bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right text-[var(--text-main)]"
                    />
                  </div>
                </>
              )}

              {chair.model === 'vacant' && (
                <span className="text-rose-500 font-medium">{t('studio.zeroStation')}</span>
              )}

              {chairs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChair(chair.id)}
                  aria-label={t('studio.removeAria', {
                    name: resolveName(chair.name, chair.nameKey, chair.nameParams),
                  })}
                  className="text-[var(--text-muted)] hover:text-red-500 p-1 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
