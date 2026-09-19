/**
 * Deal Inclusions Component
 * Explicit itemisation of who pays for supplies, laundry/sterilisation, card fees, and utilities.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Package, HelpCircle } from 'lucide-react';
import { InclusionItem, PayerType } from '../types';
import { t } from '../i18n/translations';
import { formatCurrency, STANDARD_PIERCING_KIT } from '../utils/calculator';

interface DealInclusionsProps {
  inclusions: InclusionItem[];
  monthlyRevenue: number;
  monthlyProcedures?: number;
  onUpdateInclusions: (inclusions: InclusionItem[]) => void;
}

export const DealInclusions: React.FC<DealInclusionsProps> = ({
  inclusions,
  monthlyRevenue,
  monthlyProcedures = 60,
  onUpdateInclusions,
}) => {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCostType, setCustomCostType] = useState<'fixed' | 'per_procedure'>('fixed');
  const [customAmount, setCustomAmount] = useState<number>(50);

  const updateItem = (id: string, updates: Partial<InclusionItem>) => {
    const updated = inclusions.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    onUpdateInclusions(updated);
  };

  const removeItem = (id: string) => {
    onUpdateInclusions(inclusions.filter((item) => item.id !== id));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: InclusionItem = {
      id: 'custom-' + Date.now(),
      nameKey: customName.trim(),
      hintKey: customCostType === 'per_procedure' ? 'Per-procedure consumable' : 'Fixed monthly consumable',
      monthlyCost: customCostType === 'fixed' ? customAmount : customAmount * monthlyProcedures,
      unitCost: customCostType === 'per_procedure' ? customAmount : undefined,
      costType: customCostType,
      boothPayer: 'artist',
      commPayer: 'owner',
    };

    onUpdateInclusions([...inclusions, newItem]);
    setCustomName('');
    setShowAddCustom(false);
  };

  const loadStandardKit = () => {
    // Merge standard kit items without duplicating
    const existingIds = new Set(inclusions.map((i) => i.id));
    const toAdd = STANDARD_PIERCING_KIT.filter((kitItem) => !existingIds.has(kitItem.id));
    onUpdateInclusions([...inclusions, ...toAdd]);
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-5 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border)]">
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Package size={18} className="text-[var(--primary)]" />
            <span>{t('inclusions.secTitle')}</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {t('inclusions.secDesc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadStandardKit}
            id="btn-load-standard-kit"
            className="px-2.5 py-1.5 rounded-md bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-main)] font-semibold text-xs flex items-center gap-1.5 hover:bg-[var(--border)]/50 transition-all cursor-pointer min-h-[44px] sm:min-h-0"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>{t('customSupplies.loadStandardKit')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddCustom(!showAddCustom)}
            id="btn-add-custom-consumable"
            className="px-2.5 py-1.5 rounded-md bg-[var(--primary)] text-white font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer min-h-[44px] sm:min-h-0"
          >
            <Plus size={14} />
            <span>{t('customSupplies.addItem')}</span>
          </button>
        </div>
      </div>

      {/* ADD CUSTOM ITEM FORM */}
      {showAddCustom && (
        <form
          onSubmit={handleAddCustom}
          className="mb-4 p-4 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg space-y-3"
        >
          <div className="font-bold text-xs text-[var(--text-main)]">
            {t('customSupplies.addItem')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                {t('customSupplies.nameLabel')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sterile Needles & Cannulas"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded font-medium text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                {t('customSupplies.costType')}
              </label>
              <select
                value={customCostType}
                onChange={(e) => setCustomCostType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded font-medium text-[var(--text-main)] cursor-pointer"
              >
                <option value="fixed">{t('customSupplies.fixedMonthly')}</option>
                <option value="per_procedure">{t('customSupplies.perProcedure')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                {customCostType === 'fixed'
                  ? t('customSupplies.monthlyCost')
                  : t('customSupplies.unitCost')}
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--text-muted)]">£</span>
                <input
                  type="number"
                  step={customCostType === 'per_procedure' ? '0.10' : '5'}
                  min="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded font-medium text-[var(--text-main)]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--border)]/50 rounded cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-[var(--primary)] text-white rounded hover:opacity-90 cursor-pointer"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      )}

      {/* INCLUSIONS LIST */}
      <div className="space-y-4">
        {inclusions.map((item) => {
          const isStandard = ['supplies', 'laundry', 'cardFees', 'utilities'].includes(item.id);
          const itemTotal = item.isPercentage
            ? monthlyRevenue * ((item.ratePct || 0) / 100)
            : item.costType === 'per_procedure'
            ? (item.unitCost || 0) * monthlyProcedures
            : item.monthlyCost;

          return (
            <div
              key={item.id}
              className="bg-[var(--bg-input)] border border-[var(--border)] rounded-lg p-3 sm:p-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <div className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                    <span>{isStandard ? t(item.nameKey as any) : item.nameKey}</span>
                    {!isStandard && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)]">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {isStandard ? t(item.hintKey as any) : item.hintKey}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {item.isPercentage ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--text-muted)]">{t('inclusions.rateLabel')}</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={item.ratePct || 1.75}
                        onChange={(e) =>
                          updateItem(item.id, {
                            ratePct: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-18 min-h-[44px] px-2 py-1 text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-main)] text-right font-mono"
                      />
                      <span className="text-xs text-[var(--text-muted)]">%</span>
                      <span className="text-xs font-semibold text-[var(--text-main)] ml-1">
                        {t('inclusions.approxMonthlyCost', { amount: formatCurrency(itemTotal) })}
                      </span>
                    </div>
                  ) : item.costType === 'per_procedure' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--text-muted)]">£</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={item.unitCost || 0}
                        onChange={(e) =>
                          updateItem(item.id, {
                            unitCost: Math.max(0, parseFloat(e.target.value) || 0),
                            monthlyCost: (Math.max(0, parseFloat(e.target.value) || 0)) * monthlyProcedures,
                          })
                        }
                        className="w-20 min-h-[44px] px-2 py-1 text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-main)] text-right font-mono"
                      />
                      <span className="text-xs text-[var(--text-muted)]">/proc</span>
                      <span className="text-xs font-semibold text-[var(--text-main)] ml-1">
                        (~{formatCurrency(itemTotal)}/mo @ {monthlyProcedures} procs)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--text-muted)]">{t('inclusions.estCostLabel')}</span>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={item.monthlyCost}
                        onChange={(e) =>
                          updateItem(item.id, {
                            monthlyCost: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-22 min-h-[44px] px-2.5 py-1 text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-main)] text-right font-mono"
                      />
                      <span className="text-xs text-[var(--text-muted)]">/mo</span>
                    </div>
                  )}

                  {!isStandard && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove consumable item"
                      className="text-[var(--text-muted)] hover:text-red-500 p-2 cursor-pointer transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment controls for Booth vs Commission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-[var(--border)] border-opacity-50 text-xs">
                {/* Booth Model Payer */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-[var(--bg-card)] p-2.5 rounded border border-[var(--border)]">
                  <span className="font-semibold text-[var(--c-booth)]">
                    {t('inclusions.inBoothRent')}
                  </span>
                  <div className="flex items-center gap-1">
                    {(['artist', 'owner', 'split'] as PayerType[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateItem(item.id, { boothPayer: p })}
                        className={`min-h-[44px] min-w-[50px] px-3 py-2 rounded text-xs font-medium transition-all inline-flex items-center justify-center cursor-pointer ${
                          item.boothPayer === p
                            ? 'bg-[var(--primary)] text-white font-bold shadow-sm'
                            : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)]'
                        }`}
                      >
                        {p === 'artist'
                          ? t('inclusions.btnArtist')
                          : p === 'owner'
                          ? t('inclusions.btnOwner')
                          : t('inclusions.btnSplit')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commission Model Payer */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-[var(--bg-card)] p-2.5 rounded border border-[var(--border)]">
                  <span className="font-semibold text-[var(--c-comm)]">
                    {t('inclusions.inCommission')}
                  </span>
                  <div className="flex items-center gap-1">
                    {(['artist', 'owner', 'split'] as PayerType[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateItem(item.id, { commPayer: p })}
                        className={`min-h-[44px] min-w-[50px] px-3 py-2 rounded text-xs font-medium transition-all inline-flex items-center justify-center cursor-pointer ${
                          item.commPayer === p
                            ? 'bg-[var(--primary)] text-white font-bold shadow-sm'
                            : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)]'
                        }`}
                      >
                        {p === 'artist'
                          ? t('inclusions.btnArtist')
                          : p === 'owner'
                          ? t('inclusions.btnOwner')
                          : t('inclusions.btnSplit')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
