/**
 * Booth Rent vs Commission Calculator V2
 * Poli International Pro Suite Tools
 *
 * Core Capabilities:
 * 1. Both sides of the same deal (Artist and Owner simultaneously)
 * 2. Multi-Deal Side-by-Side Comparison Matrix
 * 3. Tiered & Sliding-Scale Commission Curves
 * 4. URL Hash State Sharing & Preset Saving
 * 5. Custom Line-Item Supply & Consumables Builder
 * 6. Annual Seasonality & Time-Off Cash Flow Simulator
 * 7. Local Tax & Self-Employment Net Take-Home Overlay
 * 8. Multi-Chair Studio Capacity Planner (Owner Perspective)
 * 9. Walk-in vs. Custom Booking Revenue Split
 * 10. Client-Side CSV & JSON Data Export
 * 11. Hybrid Rent vs. Split & Minimum Guarantee Engine
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  Scale,
  ShieldCheck,
  Sparkles,
  Printer,
  Calendar,
  Layers,
  TrendingUp,
  FileText,
  AlertTriangle,
  Trophy,
  Landmark,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';

import {
  DealParameters,
  RealisticMonthParams,
  InclusionItem,
  TaxSettings,
} from './types';
import {
  DEFAULT_INCLUSIONS,
  computeFullModel,
  computeMonthlyProcedures,
  formatCurrency,
  formatWholeCurrency,
  decodeStateFromUrl,
} from './utils/calculator';
import {
  t,
  setLanguage,
  languageNames,
  SupportedLanguage,
  supportedLanguages,
} from './i18n/translations';

import { BothSidesComparison } from './components/BothSidesComparison';
import { BreakEvenChart } from './components/BreakEvenChart';
import { DealInclusions } from './components/DealInclusions';
import { RealisticMonthSpread } from './components/RealisticMonthSpread';
import { PrintableSummary } from './components/PrintableSummary';
import { RelatedTools } from './components/RelatedTools';
import { MultiDealComparison } from './components/MultiDealComparison';
import { SeasonalityCashFlow } from './components/SeasonalityCashFlow';
import { StudioFloorPlanner } from './components/StudioFloorPlanner';
import { PresetAndShareBar } from './components/PresetAndShareBar';

export default function App() {
  // Deal parameters
  const [deal, setDeal] = useState<DealParameters>(() => {
    // Check if initial URL hash contains encoded state
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeStateFromUrl(window.location.hash);
      if (decoded && decoded.deal) {
        return decoded.deal;
      }
    }
    return {
      weeklyRent: 250,
      commissionPct: 40,
      weeksPerYear: 48,
      dealStructure: 'standard',
      hybridBaseWeeklyRent: 120,
      hybridCommissionPct: 20,
      floorMinWeekly: 200,
      useTieredCommission: false,
      tieredTiers: [
        { threshold: 3000, pct: 50 },
        { threshold: 6000, pct: 40 },
        { threshold: 999999, pct: 30 },
      ],
      walkInSplit: {
        enabled: false,
        walkInPct: 35,
        walkInCommPct: 50,
        customCommPct: 30,
      },
    };
  });

  // Realistic month parameters
  const [realisticParams, setRealisticParams] = useState<RealisticMonthParams>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeStateFromUrl(window.location.hash);
      if (decoded && decoded.realisticParams) {
        return decoded.realisticParams;
      }
    }
    return {
      useRealisticEngine: true,
      directMonthlyRevenue: 5200,
      workingDaysPerMonth: 20,
      apptsPerDay: 2.5,
      avgTicket: 120,
      noShowRatePct: 12,
    };
  });

  // Tax settings
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    enabled: false,
    regime: 'uk_sole_trader',
    flatRatePct: 25,
  });

  // Deal Inclusions
  const [inclusions, setInclusions] = useState<InclusionItem[]>(DEFAULT_INCLUSIONS);

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    'both' | 'multi' | 'spread' | 'seasonality' | 'tax' | 'studio' | 'inclusions' | 'breakeven' | 'print'
  >('both');

  // Advanced deal controls drawer
  const [showAdvancedSplit, setShowAdvancedSplit] = useState<boolean>(false);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showStandardsModal, setShowStandardsModal] = useState<boolean>(false);

  // Language state (en, fr, it, de, es, nl, pt)
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setLanguageState(newLang);
  };

  // Handle dark/light theme
  useEffect(() => {
    const isIframe = window.self !== window.top;
    const initialTheme = document.documentElement.getAttribute('data-theme') || (isIframe ? 'dark' : 'dark');
    setTheme(initialTheme === 'light' ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', initialTheme);

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'poli-theme') {
        const nextTheme = e.data.light ? 'light' : 'dark';
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Full calculation model
  const model = useMemo(() => {
    return computeFullModel(deal, realisticParams, inclusions, taxSettings);
  }, [deal, realisticParams, inclusions, taxSettings]);

  // Completed procedures per month. Drives per-procedure consumable pricing in
  // the inclusions panel, the break-even curves and the printed summary, so it
  // comes from one shared helper rather than being recomputed in three places
  // that could drift apart.
  const monthlyProcedures = useMemo(
    () => computeMonthlyProcedures(realisticParams),
    [realisticParams]
  );

  const updateDeal = (key: keyof DealParameters, val: any) => {
    setDeal((prev) => ({ ...prev, [key]: val }));
  };

  const handleLoadPreset = (loadedDeal: DealParameters, loadedParams?: RealisticMonthParams) => {
    setDeal(loadedDeal);
    if (loadedParams) {
      setRealisticParams(loadedParams);
    }
  };

  return (
    <div className="tool-wrapper">
      {/* HEADER */}
      <header className="tool-header">
        <div className="flex justify-between items-center relative mb-2">
          <div className="tool-header__badge" id="category-badge">
            <Scale size={13} className="inline mr-1" />
            <span>{t('header.badgeCategory')}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative inline-block">
              <label htmlFor="language-select" className="sr-only">
                {t('header.languageLabel')}
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--text-main)] shadow-xs">
                <Globe size={14} className="text-[var(--text-muted)]" />
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-transparent border-0 text-xs font-medium cursor-pointer focus:outline-hidden text-[var(--text-main)]"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {languageNames[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              id="header-print-btn"
              onClick={() => setActiveTab('print')}
              className="px-3.5 py-2 text-xs rounded-md bg-[var(--primary)] text-white font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all cursor-pointer min-h-[44px]"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">{t('header.printBtn')}</span>
              <span className="sm:hidden">{t('header.printBtnShort')}</span>
            </button>

            <button
              type="button"
              className="theme-toggle-btn"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={t('header.themeToggleAria')}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span className="hidden sm:inline">
                {theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
              </span>
            </button>
          </div>
        </div>

        <h1 id="main-heading">{t('header.title')}</h1>
        <p id="sub-heading">{t('header.subtitle')}</p>
      </header>

      {/* WARNING NOTICES */}
      {model.warnings.length > 0 && (
        <div className="space-y-2 mb-4">
          {model.warnings.map((wKey, idx) => (
            <div
              key={idx}
              className="poli-warn-card flex items-center gap-2 text-xs"
              role="alert"
            >
              <AlertTriangle size={15} className="shrink-0 text-[var(--warn-text)]" />
              <span>{t(wKey)}</span>
            </div>
          ))}
        </div>
      )}

      {/* PRESETS & SHARING TOOLBAR */}
      <PresetAndShareBar
        deal={deal}
        realisticParams={realisticParams}
        inclusions={inclusions}
        model={model}
        onLoadDeal={handleLoadPreset}
      />

      {/* CORE DEAL INPUTS BAR (Always Visible Top Controls) */}
      <div className="deal-inputs-panel bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--text-main)]">
              {t('dealInputs.title')}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {t('dealInputs.subtitleNote')}
            </span>
          </div>

          {/* Quick Break-even Indicator */}
          {model.breakEvenMonthly ? (
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span>{t('dealInputs.breakEvenLabel')}:</span>
              <span className="font-mono font-bold text-[var(--c-neutral)] bg-[var(--bg-input)] px-2 py-0.5 rounded border border-[var(--border)]">
                {formatWholeCurrency(model.breakEvenMonthly)} {t('common.perMonth')}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">
              {t('dealInputs.breakEvenUndefined')}
            </span>
          )}
        </div>

        {/* DEAL STRUCTURE SELECTOR */}
        <div className="mb-4 p-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
          <div className="text-xs font-bold text-[var(--text-muted)] mb-1.5">
            {t('hybrid.structureLabel')}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateDeal('dealStructure', 'standard')}
              className={`text-xs py-1.5 px-2.5 rounded font-semibold text-left transition-all cursor-pointer ${
                deal.dealStructure === 'standard' || !deal.dealStructure
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)]/40'
              }`}
            >
              {t('hybrid.standard')}
            </button>

            <button
              type="button"
              onClick={() => updateDeal('dealStructure', 'hybrid')}
              className={`text-xs py-1.5 px-2.5 rounded font-semibold text-left transition-all cursor-pointer ${
                deal.dealStructure === 'hybrid'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)]/40'
              }`}
            >
              {t('hybrid.hybrid')}
            </button>

            <button
              type="button"
              onClick={() => updateDeal('dealStructure', 'floor')}
              className={`text-xs py-1.5 px-2.5 rounded font-semibold text-left transition-all cursor-pointer ${
                deal.dealStructure === 'floor'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--border)]/40'
              }`}
            >
              {t('hybrid.floor')}
            </button>
          </div>
        </div>

        {/* INPUTS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t('dealInputs.weeklyRent')}
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={deal.weeklyRent}
              onChange={(e) => updateDeal('weeklyRent', Math.max(0, parseFloat(e.target.value) || 0))}
              className="input-field font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] block mt-0.5">
              {t('dealInputs.weeklyRentCalculated', {
                amount: formatCurrency((deal.weeklyRent * deal.weeksPerYear) / 12),
              })}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t('dealInputs.commissionPct')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={deal.commissionPct}
              onChange={(e) =>
                updateDeal('commissionPct', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))
              }
              className="input-field font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] block mt-0.5">
              {t('dealInputs.commissionRetained', { pct: 100 - deal.commissionPct })}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              {t('dealInputs.weeksPerYear')}
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={deal.weeksPerYear}
              onChange={(e) =>
                updateDeal('weeksPerYear', Math.max(1, Math.min(52, parseInt(e.target.value, 10) || 48)))
              }
              className="input-field font-mono"
            />
            <span className="text-xs text-[var(--text-muted)] block mt-0.5">
              {t('dealInputs.weeksPerYearHint')}
            </span>
          </div>
        </div>

        {/* CONDITIONAL HYBRID OR FLOOR GUARANTEE PARAMETERS */}
        {deal.dealStructure === 'hybrid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[var(--border)] bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg">
            <div>
              <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                {t('hybrid.baseRent')}
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={deal.hybridBaseWeeklyRent || 120}
                onChange={(e) => updateDeal('hybridBaseWeeklyRent', Math.max(0, Number(e.target.value)))}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                {t('hybrid.baseRentHint')}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                {t('hybrid.commCut')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="2.5"
                value={deal.hybridCommissionPct || 20}
                onChange={(e) =>
                  updateDeal('hybridCommissionPct', Math.min(100, Math.max(0, Number(e.target.value))))
                }
                className="input-field font-mono"
              />
              <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                {t('hybrid.commCutHint')}
              </span>
            </div>
          </div>
        )}

        {deal.dealStructure === 'floor' && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg">
            <div className="max-w-xs">
              <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                {t('hybrid.floorMinWeekly')}
              </label>
              <input
                type="number"
                min="0"
                step="25"
                value={deal.floorMinWeekly || 200}
                onChange={(e) => updateDeal('floorMinWeekly', Math.max(0, Number(e.target.value)))}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                {t('hybrid.floorCalculated', {
                  amount: Math.round(((deal.floorMinWeekly || 200) * deal.weeksPerYear) / 12).toString(),
                })}
              </span>
            </div>
          </div>
        )}

        {/* ADVANCED SPLIT ACCORDION TOGGLE */}
        <div className="mt-3 pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowAdvancedSplit(!showAdvancedSplit)}
            className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>
              {showAdvancedSplit ? t('advanced.toggleHide') : t('advanced.toggleShow')}
            </span>
            {showAdvancedSplit ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showAdvancedSplit && (
            <div className="mt-3 space-y-4 p-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg">
              {/* TIERED COMMISSION */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--text-main)]">
                    {t('tiered.toggleTitle')}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deal.useTieredCommission || false}
                      onChange={(e) => updateDeal('useTieredCommission', e.target.checked)}
                      className="accent-[var(--primary)]"
                    />
                    <span className="font-semibold">{t('tiered.enableBtn')}</span>
                  </label>
                </div>

                {deal.useTieredCommission && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded">
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        {t('tiered.tier1', { amount: '3,000' })}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={deal.tieredTiers?.[0]?.pct ?? 50}
                          onChange={(e) => {
                            const tiers = [...(deal.tieredTiers || [])];
                            tiers[0] = { threshold: 3000, pct: Number(e.target.value) };
                            updateDeal('tieredTiers', tiers);
                          }}
                          className="w-16 px-1 py-0.5 text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right"
                        />
                        <span className="text-xs">{t('tiered.shopCutInline')}</span>
                      </div>
                    </div>

                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded">
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        {t('tiered.tier2', { from: '3,000', to: '6,000' })}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={deal.tieredTiers?.[1]?.pct ?? 40}
                          onChange={(e) => {
                            const tiers = [...(deal.tieredTiers || [])];
                            tiers[1] = { threshold: 6000, pct: Number(e.target.value) };
                            updateDeal('tieredTiers', tiers);
                          }}
                          className="w-16 px-1 py-0.5 text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right"
                        />
                        <span className="text-xs">{t('tiered.shopCutInline')}</span>
                      </div>
                    </div>

                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded">
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        {t('tiered.tier3', { from: '6,000' })}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={deal.tieredTiers?.[2]?.pct ?? 30}
                          onChange={(e) => {
                            const tiers = [...(deal.tieredTiers || [])];
                            tiers[2] = { threshold: 999999, pct: Number(e.target.value) };
                            updateDeal('tieredTiers', tiers);
                          }}
                          className="w-16 px-1 py-0.5 text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right"
                        />
                        <span className="text-xs">{t('tiered.shopCutInline')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WALK-IN SPLIT */}
              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--text-main)]">
                    {t('walkIn.title')}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deal.walkInSplit?.enabled || false}
                      onChange={(e) =>
                        updateDeal('walkInSplit', {
                          enabled: e.target.checked,
                          walkInPct: deal.walkInSplit?.walkInPct || 35,
                          walkInCommPct: deal.walkInSplit?.walkInCommPct || 50,
                          customCommPct: deal.walkInSplit?.customCommPct || 30,
                        })
                      }
                      className="accent-[var(--primary)]"
                    />
                    <span className="font-semibold">{t('walkIn.enable')}</span>
                  </label>
                </div>

                {deal.walkInSplit?.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded">
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        {t('walkIn.pctShare')}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={deal.walkInSplit.walkInPct}
                          onChange={(e) =>
                            updateDeal('walkInSplit', {
                              ...deal.walkInSplit,
                              walkInPct: Number(e.target.value),
                            })
                          }
                          className="w-14 px-1 py-0.5 text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    </div>

                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded">
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        {t('walkIn.shopSplit')}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={deal.walkInSplit.walkInCommPct}
                          onChange={(e) =>
                            updateDeal('walkInSplit', {
                              ...deal.walkInSplit,
                              walkInCommPct: Number(e.target.value),
                            })
                          }
                          className="w-14 px-1 py-0.5 text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    </div>

                    <div className="p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded">
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        {t('walkIn.customSplit')}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={deal.walkInSplit.customCommPct}
                          onChange={(e) =>
                            updateDeal('walkInSplit', {
                              ...deal.walkInSplit,
                              customCommPct: Number(e.target.value),
                            })
                          }
                          className="w-14 px-1 py-0.5 text-xs bg-[var(--bg-app)] border border-[var(--border)] rounded font-semibold text-right"
                        />
                        <span className="text-xs">%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 9 FULL-FEATURE TAB NAVIGATION */}
      <div className="tabs-navigation flex items-center gap-1 overflow-x-auto pb-1 mb-4 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setActiveTab('both')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
            activeTab === 'both'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <Scale size={14} />
          <span>{t('nav.overview')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('multi')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
            activeTab === 'multi'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <Trophy size={14} />
          <span>{t('nav.multi')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spread')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
            activeTab === 'spread'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <Calendar size={14} />
          <span>{t('nav.realistic')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seasonality')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
            activeTab === 'seasonality'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <Calendar size={14} />
          <span>{t('nav.seasonality')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
            activeTab === 'studio'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <Building2 size={14} />
          <span>{t('nav.studio')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inclusions')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
            activeTab === 'inclusions'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <Layers size={14} />
          <span>{t('nav.inclusions')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('breakeven')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
            activeTab === 'breakeven'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <TrendingUp size={14} />
          <span>{t('nav.breakEven')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('print')}
          className={`px-3 py-2 text-xs rounded-t-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ml-auto min-h-[44px] ${
            activeTab === 'print'
              ? 'bg-[var(--bg-card)] text-[var(--primary)] border-t border-x border-[var(--border)] -mb-[1px]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
          }`}
        >
          <FileText size={14} />
          <span>{t('nav.print')}</span>
        </button>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className={activeTab === 'print' ? 'hidden print:block' : 'block print:hidden'}>
        {activeTab === 'both' && (
          <BothSidesComparison
            booth={model.booth}
            comm={model.comm}
            grossMonthlyRevenue={model.grossMonthlyRevenue}
          />
        )}

        {activeTab === 'multi' && (
          <MultiDealComparison
            baselineDeal={deal}
            inclusions={inclusions}
            monthlyRevenue={model.grossMonthlyRevenue}
          />
        )}

        {activeTab === 'spread' && (
          <RealisticMonthSpread
            params={realisticParams}
            scenarios={model.realistic}
            onUpdateParams={setRealisticParams}
          />
        )}

        {activeTab === 'seasonality' && (
          <SeasonalityCashFlow
            deal={deal}
            inclusions={inclusions}
            baselineGrossMonthly={model.grossMonthlyRevenue}
          />
        )}

        {activeTab === 'studio' && <StudioFloorPlanner />}

        {activeTab === 'inclusions' && (
          <DealInclusions
            inclusions={inclusions}
            monthlyRevenue={model.grossMonthlyRevenue}
            monthlyProcedures={monthlyProcedures}
            onUpdateInclusions={setInclusions}
          />
        )}

        {activeTab === 'breakeven' && (
          <BreakEvenChart
            deal={deal}
            inclusions={inclusions}
            breakEvenMonthly={model.breakEvenMonthly}
            currentMonthlyRevenue={model.grossMonthlyRevenue}
            monthlyProcedures={monthlyProcedures}
          />
        )}
      </div>

      {/* PRINTABLE SUMMARY */}
      <div className={activeTab === 'print' ? 'block' : 'hidden print:block'}>
        <PrintableSummary
          model={model}
          deal={deal}
          realisticParams={realisticParams}
          inclusions={inclusions}
          onClose={activeTab === 'print' ? () => setActiveTab('both') : undefined}
        />
      </div>

      {/* QUICK SUMMARY SNAPSHOT (Always rendered beneath except when in print tab) */}
      {activeTab !== 'print' && (
        <div className="summary-snapshot-bar bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full sm:w-auto">
            <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)] uppercase block font-bold">
                {t('snapshot.grossRevenue')}
              </span>
              <span className="font-mono font-bold text-sm text-[var(--text-main)]">
                {formatCurrency(model.grossMonthlyRevenue)} {t('common.perMonth')}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)] uppercase block font-bold">
                {t('snapshot.artistNetBooth')}
              </span>
              <span className="font-mono font-bold text-sm text-[var(--c-booth)]">
                {formatCurrency(model.booth.artist.netIncomeMonthly)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)] uppercase block font-bold">
                {t('snapshot.artistNetComm')}
              </span>
              <span className="font-mono font-bold text-sm text-[var(--c-comm)]">
                {formatCurrency(model.comm.artist.netIncomeMonthly)}
              </span>
            </div>
          </div>

          <button
            type="button"
            id="snapshot-print-btn"
            onClick={() => setActiveTab('print')}
            className="self-stretch sm:self-auto flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-md border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-main)] bg-[var(--bg-input)] font-semibold transition-all cursor-pointer"
          >
            <FileText size={15} />
            <span>{t('snapshot.generateSheetBtn')}</span>
          </button>
        </div>
      )}

      {/* RELATED TOOLS (Links only, do not build) */}
      <div className="related-tools-section print:hidden">
        <RelatedTools />
      </div>

      {/* FOOTER */}
      <footer className="text-center mt-6 text-xs text-[var(--text-muted)] print:hidden">
        {t('footer.credit')}
      </footer>
    </div>
  );
}
