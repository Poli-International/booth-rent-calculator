/**
 * Printable Summary Component
 * Formal calculation summary suitable for printing and signing by both parties.
 * Clearly marked as a mathematical calculation and NOT an agreement or legal contract.
 */

import React from 'react';
import { CalculationModel, DealParameters, RealisticMonthParams, InclusionItem } from '../types';
import { t, getLocaleTag } from '../i18n/translations';
import {
  formatCurrency,
  formatWholeCurrency,
  computeItemCosts,
  computeMonthlyProcedures,
  inclusionLabel,
  exportToCsv,
  exportToJson,
} from '../utils/calculator';
import { Printer, X, FileSpreadsheet, FileCode } from 'lucide-react';

interface PrintableSummaryProps {
  model: CalculationModel;
  deal: DealParameters;
  realisticParams: RealisticMonthParams;
  inclusions: InclusionItem[];
  onClose?: () => void;
}

export const PrintableSummary: React.FC<PrintableSummaryProps> = ({
  model,
  deal,
  realisticParams,
  inclusions,
  onClose,
}) => {
  // Date follows the active language, so a French summary does not print an
  // English-ordered date. Previously hardcoded to 'en-GB' in every locale.
  const currentDate = new Date().toLocaleDateString(getLocaleTag(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Same completed-procedure count the on-screen panels use, so a per-procedure
  // consumable is priced identically on the sheet and in the live totals.
  const monthlyProcedures = computeMonthlyProcedures(realisticParams);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportToCsv(model, deal, inclusions);
  };

  const handleExportJson = () => {
    exportToJson(model, deal, inclusions);
  };

  return (
    <div className="printable-summary-container bg-white text-neutral-900 p-4 sm:p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-4 border border-neutral-300 print:border-0 print:shadow-none print:p-0 print:my-0 print:text-black">
      {/* Print Controls (Hidden when printing) */}
      <div className="print-controls flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-neutral-300">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-[var(--primary)] hover:opacity-90 text-white font-bold px-4 py-2.5 min-h-[44px] rounded-md shadow-sm transition-all cursor-pointer text-sm"
          >
            <Printer size={17} />
            <span>{t('print.printBtn')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-3 py-2 min-h-[44px] rounded border border-neutral-300 transition-all cursor-pointer text-xs"
          >
            <FileSpreadsheet size={15} />
            <span>{t('common.exportCsv')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-3 py-2 min-h-[44px] rounded border border-neutral-300 transition-all cursor-pointer text-xs"
          >
            <FileCode size={15} />
            <span>{t('common.exportJson')}</span>
          </button>

          <span className="text-xs text-neutral-500 hidden sm:inline ml-2">
            {t('print.pageHint')}
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 text-neutral-700 hover:text-black text-sm px-4 py-2.5 min-h-[44px] rounded border border-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={16} />
            <span>{t('print.closeBtn')}</span>
          </button>
        )}
      </div>

      {/* Sheet Header */}
      <div className="text-center pb-3 mb-3 border-b-2 border-black print:pb-1.5 print:mb-2">
        <div className="text-xs uppercase font-mono tracking-widest text-neutral-600 print:text-black mb-0.5">
          {t('print.suiteEyebrow')}
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black print:text-lg">
          {t('print.title')}
        </h1>
        <p className="text-xs text-neutral-600 print:text-neutral-800 mt-0.5 print:text-[9pt]">
          {t('print.subtitle')} • {t('print.generatedOn', { date: currentDate })}
        </p>
      </div>

      {/* Explicit Legal / Arithmetic Disclaimer Notice */}
      <div className="border border-neutral-400 p-2 mb-3 text-xs leading-snug text-neutral-800 rounded print:p-1.5 print:mb-2 print:text-[8.5pt] print:border-black">
        <strong>{t('print.disclaimerHeading')}</strong> {t('print.disclaimerText')}
      </div>

      {/* Deal Parameters & Basis */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 p-2.5 border border-neutral-300 rounded text-xs print:p-1.5 print:mb-2 print:border-black print:text-[8.5pt]">
        <div>
          <span className="text-neutral-500 print:text-neutral-700 block text-xs uppercase font-bold">{t('print.paramWeeklyRent')}</span>
          <span className="font-bold text-sm print:text-xs font-mono">{formatCurrency(deal.weeklyRent)} {t('common.perWeek')}</span>
        </div>
        <div>
          <span className="text-neutral-500 print:text-neutral-700 block text-xs uppercase font-bold">{t('print.paramCommSplit')}</span>
          <span className="font-bold text-sm print:text-xs font-mono">{t('print.paramSplitToStudio', { pct: deal.commissionPct })}</span>
        </div>
        <div>
          <span className="text-neutral-500 print:text-neutral-700 block text-xs uppercase font-bold">{t('print.paramWorkingWeeks')}</span>
          <span className="font-bold text-sm print:text-xs font-mono">{t('print.paramWeeksPerYear', { weeks: deal.weeksPerYear })}</span>
        </div>
        <div>
          <span className="text-neutral-500 print:text-neutral-700 block text-xs uppercase font-bold">{t('print.paramBreakEvenRevenue')}</span>
          <span className="font-bold text-sm print:text-xs font-mono">
            {model.breakEvenMonthly
              ? `${formatWholeCurrency(model.breakEvenMonthly)} ${t('common.perMonth')}`
              : t('print.notApplicable')}
          </span>
        </div>
      </div>

      {/* Side-by-Side Financial Arithmetic Comparison Table */}
      <div className="mb-3 print:mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1 border-b border-neutral-300 pb-0.5 print:text-[9pt] print:border-black">
          {t('print.sec1Heading')}
        </h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs print:text-[8.5pt] border-collapse border border-neutral-300 print:border-black min-w-[480px]">
            <thead>
              <tr className="border-b border-neutral-300 print:border-black text-black font-bold">
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-left">{t('print.thMetric')}</th>
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right">{t('print.thBooth')}</th>
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right">{t('print.thCommission')}</th>
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right">{t('print.thDifference')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 font-medium">{t('print.metricGrossMonthly')}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">{formatCurrency(model.grossMonthlyRevenue)}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">{formatCurrency(model.grossMonthlyRevenue)}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono text-neutral-400 print:text-neutral-600">—</td>
              </tr>
              <tr className="font-semibold">
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1">{t('print.metricArtistNetMonthly')}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono font-bold">
                  {formatCurrency(model.booth.artist.netIncomeMonthly)}
                </td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono font-bold">
                  {formatCurrency(model.comm.artist.netIncomeMonthly)}
                </td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono font-bold">
                  {model.booth.artist.netIncomeMonthly >= model.comm.artist.netIncomeMonthly
                    ? t('print.deltaBoothWins', { amount: formatCurrency(model.booth.artist.netIncomeMonthly - model.comm.artist.netIncomeMonthly) })
                    : t('print.deltaCommWins', { amount: formatCurrency(model.comm.artist.netIncomeMonthly - model.booth.artist.netIncomeMonthly) })}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-neutral-700 print:text-black">{t('print.metricArtistAnnualNet')}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">{formatCurrency(model.booth.artist.netIncomeAnnual)}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">{formatCurrency(model.comm.artist.netIncomeAnnual)}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">
                  {formatCurrency(Math.abs(model.booth.artist.netIncomeAnnual - model.comm.artist.netIncomeAnnual))}
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1">{t('print.metricOwnerNetMargin')}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono font-bold">
                  {formatCurrency(model.booth.owner.netIncomeMonthly)}
                </td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono font-bold">
                  {formatCurrency(model.comm.owner.netIncomeMonthly)}
                </td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono font-bold">
                  {model.booth.owner.netIncomeMonthly >= model.comm.owner.netIncomeMonthly
                    ? t('print.deltaBoothWins', { amount: formatCurrency(model.booth.owner.netIncomeMonthly - model.comm.owner.netIncomeMonthly) })
                    : t('print.deltaCommWins', { amount: formatCurrency(model.comm.owner.netIncomeMonthly - model.booth.owner.netIncomeMonthly) })}
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-neutral-700 print:text-black">{t('print.metricOwnerAnnualMargin')}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">{formatCurrency(model.booth.owner.netIncomeAnnual)}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">{formatCurrency(model.comm.owner.netIncomeAnnual)}</td>
                <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-right font-mono">
                  {formatCurrency(Math.abs(model.booth.owner.netIncomeAnnual - model.comm.owner.netIncomeAnnual))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemised Deal Inclusions */}
      <div className="mb-3 print:mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1 border-b border-neutral-300 pb-0.5 print:text-[9pt] print:border-black">
          {t('print.sec2Heading')}
        </h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs print:text-[8.5pt] border-collapse border border-neutral-300 print:border-black min-w-[480px]">
            <thead>
              <tr className="border-b border-neutral-300 print:border-black text-black font-bold">
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-left">{t('print.thExpenseCategory')}</th>
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-center">{t('print.thEstimatedCost')}</th>
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-center">{t('print.thInBoothModel')}</th>
                <th className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-center">{t('print.thInCommissionModel')}</th>
              </tr>
            </thead>
            <tbody>
              {inclusions.map((item) => {
                // Priced by the shared engine, so a per-procedure consumable
                // shows its real monthly cost here rather than the fixed
                // `monthlyCost` placeholder it is seeded with.
                const itemTotal = computeItemCosts(item, model.grossMonthlyRevenue, monthlyProcedures).total;
                return (
                  <tr key={item.id}>
                    <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 font-medium">
                      {inclusionLabel(item)}
                    </td>
                    <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-center font-mono">
                      {item.isPercentage
                        ? t('print.ratePctOfGross', { rate: item.ratePct ?? 0 })
                        : formatCurrency(itemTotal)}
                    </td>
                    <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-center font-semibold uppercase text-xs print:text-[8pt]">
                      {item.boothPayer === 'artist' ? t('inclusions.payerArtist') : item.boothPayer === 'owner' ? t('inclusions.payerOwner') : t('inclusions.payerSplit')}
                    </td>
                    <td className="border border-neutral-300 print:border-black p-1.5 print:p-1 text-center font-semibold uppercase text-xs print:text-[8pt]">
                      {item.commPayer === 'artist' ? t('inclusions.payerArtist') : item.commPayer === 'owner' ? t('inclusions.payerOwner') : t('inclusions.payerSplit')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Realistic Month Spread Table */}
      <div className="mb-3 print:mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1 border-b border-neutral-300 pb-0.5 print:text-[9pt] print:border-black">
          {t('print.sec3Heading')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs print:text-[8.5pt]">
          {[model.realistic.conservative, model.realistic.expected, model.realistic.peak].map((sc, i) => (
            <div key={i} className="border border-neutral-300 print:border-black p-2 rounded">
              <div className="font-bold text-black border-b border-neutral-200 print:border-black pb-0.5 mb-1 text-xs">
                {i === 0 ? t('print.colConservative') : i === 1 ? t('print.colExpected') : t('print.colPeak')}
              </div>
              <div className="space-y-0.5 text-xs print:text-[8pt]">
                <div className="flex justify-between">
                  <span className="text-neutral-600 print:text-black">{t('print.rowGrossRev')}</span>
                  <span className="font-mono font-semibold">{formatCurrency(sc.grossRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 print:text-black">{t('print.rowArtistBooth')}</span>
                  <span className="font-mono font-bold">{formatCurrency(sc.booth.artist.netIncomeMonthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 print:text-black">{t('print.rowArtistComm')}</span>
                  <span className="font-mono font-bold">{formatCurrency(sc.comm.artist.netIncomeMonthly)}</span>
                </div>
                <div className="flex justify-between pt-0.5 border-t border-neutral-200 print:border-black">
                  <span className="text-neutral-600 print:text-black">{t('print.rowOwnerBooth')}</span>
                  <span className="font-mono">{formatCurrency(sc.booth.owner.netIncomeMonthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 print:text-black">{t('print.rowOwnerComm')}</span>
                  <span className="font-mono">{formatCurrency(sc.comm.owner.netIncomeMonthly)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature & Mutual Acknowledgement Blocks */}
      <div className="pt-2 border-t border-black print:pt-1.5">
        <div className="text-xs text-neutral-700 print:text-black italic mb-3 print:mb-2 print:text-[8pt]">
          {t('print.signStatement')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3">
          {/* Artist Signature */}
          <div className="border border-neutral-300 print:border-black p-2.5 print:p-2 rounded">
            <h3 className="font-bold text-xs uppercase tracking-wider text-black mb-2 pb-0.5 border-b border-neutral-200 print:border-black">
              {t('print.signArtistTitle')}
            </h3>
            <div className="space-y-2 text-xs print:text-[8pt]">
              <div className="flex items-end gap-2">
                <span className="font-semibold text-neutral-600 print:text-black w-20">{t('print.nameLabel')}</span>
                <span className="flex-1 border-b border-neutral-400 print:border-black pb-0.5"></span>
              </div>
              <div className="flex items-end gap-2 pt-1">
                <span className="font-semibold text-neutral-600 print:text-black w-20">{t('print.signatureLabel')}</span>
                <span className="flex-1 border-b border-neutral-400 print:border-black pb-0.5 min-h-[20px]"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-semibold text-neutral-600 print:text-black w-20">{t('print.dateLabel')}</span>
                <span className="flex-1 border-b border-neutral-400 print:border-black pb-0.5"></span>
              </div>
            </div>
          </div>

          {/* Owner Signature */}
          <div className="border border-neutral-300 print:border-black p-2.5 print:p-2 rounded">
            <h3 className="font-bold text-xs uppercase tracking-wider text-black mb-2 pb-0.5 border-b border-neutral-200 print:border-black">
              {t('print.signOwnerTitle')}
            </h3>
            <div className="space-y-2 text-xs print:text-[8pt]">
              <div className="flex items-end gap-2">
                <span className="font-semibold text-neutral-600 print:text-black w-20">{t('print.nameLabel')}</span>
                <span className="flex-1 border-b border-neutral-400 print:border-black pb-0.5"></span>
              </div>
              <div className="flex items-end gap-2 pt-1">
                <span className="font-semibold text-neutral-600 print:text-black w-20">{t('print.signatureLabel')}</span>
                <span className="flex-1 border-b border-neutral-400 print:border-black pb-0.5 min-h-[20px]"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-semibold text-neutral-600 print:text-black w-20">{t('print.dateLabel')}</span>
                <span className="flex-1 border-b border-neutral-400 print:border-black pb-0.5"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
