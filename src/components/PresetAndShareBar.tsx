import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, Download, Check, FileSpreadsheet, FileCode, FolderOpen } from 'lucide-react';
import { DealParameters, RealisticMonthParams, InclusionItem, CalculationModel } from '../types';
import {
  encodeStateToUrl,
  getSavedPresets,
  savePreset,
  deletePreset,
  SavedDealPreset,
  exportToCsv,
  exportToJson,
} from '../utils/calculator';
import { t } from '../i18n/translations';

interface PresetAndShareBarProps {
  deal: DealParameters;
  realisticParams: RealisticMonthParams;
  inclusions: InclusionItem[];
  model: CalculationModel;
  onLoadDeal: (deal: DealParameters, params?: RealisticMonthParams) => void;
}

export const PresetAndShareBar: React.FC<PresetAndShareBarProps> = ({
  deal,
  realisticParams,
  inclusions,
  model,
  onLoadDeal,
}) => {
  const [presets, setPresets] = useState<SavedDealPreset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    setPresets(getSavedPresets());
  }, []);

  const handleShare = () => {
    const url = encodeStateToUrl({ deal, realisticParams });
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    });
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    const updated = savePreset(presetName.trim(), deal, realisticParams);
    setPresets(updated);
    setPresetName('');
    setShowSaveModal(false);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePreset(id);
    setPresets(updated);
  };

  const handleExportCsv = () => {
    exportToCsv(model, deal, inclusions);
  };

  const handleExportJson = () => {
    exportToJson(model, deal, inclusions);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg mb-4 text-xs">
      {/* LEFT: PRESETS & SHARING */}
      <div className="flex flex-wrap items-center gap-2 relative">
        <button
          type="button"
          onClick={() => setShowPresetsMenu(!showPresetsMenu)}
          className="px-2.5 py-1.5 rounded-md bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-main)] font-semibold flex items-center gap-1.5 hover:bg-[var(--border)]/50 transition-all cursor-pointer min-h-[44px] sm:min-h-0"
        >
          <FolderOpen size={14} className="text-[var(--primary)]" />
          <span>{t('common.presets')}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[var(--border)] rounded-full">
            {presets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="px-2.5 py-1.5 rounded-md bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold flex items-center gap-1.5 hover:bg-[var(--border)]/50 transition-all cursor-pointer min-h-[44px] sm:min-h-0"
        >
          <Bookmark size={14} />
          <span>{t('presets.saveCurrent')}</span>
        </button>

        <button
          type="button"
          id="btn-share-deal-link"
          onClick={handleShare}
          className="px-2.5 py-1.5 rounded-md bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold flex items-center gap-1.5 hover:bg-[var(--border)]/50 transition-all cursor-pointer min-h-[44px] sm:min-h-0"
        >
          {copiedToast ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {t('common.copied')}
              </span>
            </>
          ) : (
            <>
              <Share2 size={14} />
              <span>{t('common.shareLink')}</span>
            </>
          )}
        </button>

        {/* PRESETS DROPDOWN */}
        {showPresetsMenu && (
          <div className="absolute top-full left-0 mt-1 w-72 max-h-80 overflow-y-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg z-50 p-2 space-y-1">
            <div className="text-[11px] font-bold text-[var(--text-muted)] px-2 py-1 border-b border-[var(--border)] mb-1">
              {t('presets.savedListTitle')}
            </div>
            {presets.length === 0 ? (
              <div className="p-3 text-center text-xs text-[var(--text-muted)]">
                {t('presets.emptyList')}
              </div>
            ) : (
              presets.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onLoadDeal(p.deal, p.realisticParams);
                    setShowPresetsMenu(false);
                  }}
                  className="p-2 rounded hover:bg-[var(--bg-app)] cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-[var(--text-main)] block truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      £{p.deal.weeklyRent}/wk · {p.deal.commissionPct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeletePreset(p.id, e)}
                      aria-label={`Delete ${p.name}`}
                      className="text-[var(--text-muted)] hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* RIGHT: EXPORT CSV & JSON */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleExportCsv}
          id="btn-export-csv"
          className="px-2.5 py-1.5 rounded-md bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold flex items-center gap-1.5 hover:bg-[var(--border)]/50 transition-all cursor-pointer min-h-[44px] sm:min-h-0"
        >
          <FileSpreadsheet size={14} />
          <span>{t('common.exportCsv')}</span>
        </button>

        <button
          type="button"
          onClick={handleExportJson}
          id="btn-export-json"
          className="px-2.5 py-1.5 rounded-md bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold flex items-center gap-1.5 hover:bg-[var(--border)]/50 transition-all cursor-pointer min-h-[44px] sm:min-h-0"
        >
          <FileCode size={14} />
          <span>{t('common.exportJson')}</span>
        </button>
      </div>

      {/* SAVE PRESET MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSavePreset}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 max-w-sm w-full shadow-xl space-y-4"
          >
            <h3 className="font-bold text-sm text-[var(--text-main)]">
              {t('presets.saveCurrent')}
            </h3>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Preset Name
              </label>
              <input
                type="text"
                autoFocus
                required
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder={t('presets.presetNamePlaceholder')}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-medium text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--border)]/50 cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 cursor-pointer"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
