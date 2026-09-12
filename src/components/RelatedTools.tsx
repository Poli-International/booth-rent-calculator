/**
 * Related Tools Component
 * Provides clean links to external suite calculators as mandated:
 * - studio-pricing-benchmark
 * - tax-deduction-tracker
 * - equipment-roi-calculator
 */

import React from 'react';
import { t } from '../i18n/translations';
import { ExternalLink, DollarSign, Calculator, Wrench } from 'lucide-react';

export const RelatedTools: React.FC = () => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-5 my-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
        <ExternalLink size={13} />
        <span>{t('relatedTools.title')}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Studio Pricing Benchmark */}
        <a
          href="https://poliinternational.com/studio-pricing-benchmark/"
          target="_top"
          className="p-3.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--primary)] transition-all flex flex-col justify-between group no-underline min-h-[60px]"
        >
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--primary)] mb-1">
              <DollarSign size={15} className="text-[var(--c-booth)]" />
              <span>{t('relatedTools.linkBenchmark')}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-normal">
              {t('relatedTools.linkBenchmarkDesc')}
            </p>
          </div>
          <span className="text-xs text-[var(--primary)] font-semibold mt-2.5 flex items-center gap-1">
            {t('relatedTools.openToolLink')}
          </span>
        </a>

        {/* Tax Deduction Tracker */}
        <a
          href="https://poliinternational.com/tax-deduction-tracker/"
          target="_top"
          className="p-3.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--primary)] transition-all flex flex-col justify-between group no-underline min-h-[60px]"
        >
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--primary)] mb-1">
              <Calculator size={15} className="text-[var(--c-comm)]" />
              <span>{t('relatedTools.linkTax')}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-normal">
              {t('relatedTools.linkTaxDesc')}
            </p>
          </div>
          <span className="text-xs text-[var(--primary)] font-semibold mt-2.5 flex items-center gap-1">
            {t('relatedTools.openToolLink')}
          </span>
        </a>

        {/* Equipment ROI Calculator */}
        <a
          href="https://poliinternational.com/equipment-roi-calculator/"
          target="_top"
          className="p-3.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--primary)] transition-all flex flex-col justify-between group no-underline min-h-[60px]"
        >
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--primary)] mb-1">
              <Wrench size={15} className="text-[var(--c-neutral)]" />
              <span>{t('relatedTools.linkRoi')}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-normal">
              {t('relatedTools.linkRoiDesc')}
            </p>
          </div>
          <span className="text-xs text-[var(--primary)] font-semibold mt-2.5 flex items-center gap-1">
            {t('relatedTools.openToolLink')}
          </span>
        </a>
      </div>
    </div>
  );
};
