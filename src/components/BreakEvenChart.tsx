/**
 * Break-Even Chart Component
 * Visualises the break-even revenue intersection where rent and commission yield the exact same cost.
 * Built with pure SVG with high contrast, accessible patterns, and crisp typography.
 */

import React from 'react';
import { DealParameters, InclusionItem } from '../types';
import { t } from '../i18n/translations';
import { formatWholeCurrency } from '../utils/calculator';

interface BreakEvenChartProps {
  deal: DealParameters;
  inclusions: InclusionItem[];
  breakEvenMonthly: number | null;
  currentMonthlyRevenue: number;
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({
  deal,
  inclusions,
  breakEvenMonthly,
  currentMonthlyRevenue,
}) => {
  // Chart dimensions & internal coordinate space
  const w = 680;
  const h = 340;
  const padL = 60;
  const padR = 30;
  const padT = 30;
  const padB = 55;

  const graphW = w - padL - padR;
  const graphH = h - padT - padB;

  // Derive domain from break-even and current revenue
  const maxRef = Math.max(
    breakEvenMonthly || 5000,
    currentMonthlyRevenue || 5000,
    6000
  );
  const maxRev = Math.ceil((maxRef * 1.6) / 1000) * 1000;

  // Sample points across revenue range
  const numSteps = 8;
  const step = maxRev / numSteps;
  const pointsData: Array<{ rev: number; artistBooth: number; artistComm: number; ownerBooth: number; ownerComm: number }> = [];

  const monthlyRent = (deal.weeklyRent * deal.weeksPerYear) / 12;
  const commRate = deal.commissionPct / 100;

  // Aggregate inclusion costs
  let fixedInclusionsArtist = 0;
  let fixedInclusionsOwner = 0;
  let pctInclusionsArtist = 0;
  let pctInclusionsOwner = 0;

  inclusions.forEach((item) => {
    const isArtist = item.boothPayer === 'artist';
    const isSplit = item.boothPayer === 'split';

    if (item.isPercentage) {
      const rate = item.ratePct / 100;
      if (isArtist) pctInclusionsArtist += rate;
      else if (isSplit) pctInclusionsArtist += rate * 0.5;
    } else {
      if (isArtist) fixedInclusionsArtist += item.monthlyCost;
      else if (isSplit) fixedInclusionsArtist += item.monthlyCost * 0.5;
    }
  });

  for (let i = 0; i <= numSteps; i++) {
    const rev = i * step;

    // Booth: Artist = rev - rent - expenses
    const ab = rev - monthlyRent - (fixedInclusionsArtist + rev * pctInclusionsArtist);
    // Commission: Artist = rev * (1 - comm) - expenses
    const ac = rev * (1 - commRate) - (fixedInclusionsArtist + rev * pctInclusionsArtist);

    // Owner Booth
    const ob = monthlyRent - fixedInclusionsOwner;
    // Owner Commission
    const oc = rev * commRate - fixedInclusionsOwner;

    pointsData.push({ rev, artistBooth: ab, artistComm: ac, ownerBooth: ob, ownerComm: oc });
  }

  // Find min/max for Y scale
  const allY = pointsData.flatMap((d) => [d.artistBooth, d.artistComm, d.ownerBooth, d.ownerComm]);
  const minY = Math.min(0, ...allY);
  const maxY = Math.max(...allY, 1000);
  const yCeil = Math.ceil(maxY / 1000) * 1000;
  const yFloor = Math.floor(minY / 1000) * 1000;
  const ySpan = Math.max(1000, yCeil - yFloor);

  const getX = (rev: number) => padL + (rev / maxRev) * graphW;
  const getY = (val: number) => padT + graphH - ((val - yFloor) / ySpan) * graphH;

  // Path generators
  const makePath = (key: 'artistBooth' | 'artistComm' | 'ownerBooth' | 'ownerComm') => {
    return pointsData
      .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(d.rev).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(' ');
  };

  const pathArtistBooth = makePath('artistBooth');
  const pathArtistComm = makePath('artistComm');
  const pathOwnerBooth = makePath('ownerBooth');
  const pathOwnerComm = makePath('ownerComm');

  // Coordinates of Break-Even
  const beX = breakEvenMonthly !== null && breakEvenMonthly <= maxRev ? getX(breakEvenMonthly) : null;
  const beNet = breakEvenMonthly !== null ? breakEvenMonthly * (1 - commRate) - (fixedInclusionsArtist + breakEvenMonthly * pctInclusionsArtist) : null;
  const beY = beNet !== null ? getY(beNet) : null;

  // Coordinates of Current Revenue
  const currentX = currentMonthlyRevenue <= maxRev ? getX(currentMonthlyRevenue) : null;

  const zeroY = getY(0);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 sm:p-5 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <span>📈</span>
            <span>{t('breakEven.secTitle')}</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {breakEvenMonthly && breakEvenMonthly > 0
              ? t('breakEven.explanation', {
                  rev: formatWholeCurrency(breakEvenMonthly),
                  weeklyRev: formatWholeCurrency((breakEvenMonthly * 12) / deal.weeksPerYear),
                })
              : t('breakEven.undefined')}
          </p>
        </div>

        {breakEvenMonthly && breakEvenMonthly > 0 && (
          <div className="bg-[var(--bg-input)] border border-[var(--border)] rounded-md px-3 py-1.5 self-start sm:self-auto text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--text-muted)] block">
              {t('breakEven.monthlyLabel')}
            </span>
            <span className="text-sm font-extrabold text-[var(--text-main)]">
              {formatWholeCurrency(breakEvenMonthly)} / mo
            </span>
          </div>
        )}
      </div>

      {/* SVG Diagram */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto min-w-[540px] select-none"
          role="img"
          aria-label={t('breakEven.ariaLabel')}
        >
          {/* Background & Defs */}
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x={padL} y={padT} width={graphW} height={graphH} fill="url(#grid-pattern)" />

          {/* Y Axis Grid Lines & Labels */}
          {[yFloor, (yFloor + yCeil) / 2, yCeil].map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + graphW}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeDasharray="3 3"
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.7"
                  fontFamily="monospace"
                >
                  {formatWholeCurrency(val)}
                </text>
              </g>
            );
          })}

          {/* Zero baseline (if within chart) */}
          {zeroY >= padT && zeroY <= padT + graphH && (
            <line
              x1={padL}
              y1={zeroY}
              x2={padL + graphW}
              y2={zeroY}
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
          )}

          {/* X Axis Grid Lines & Labels */}
          {[0, maxRev * 0.25, maxRev * 0.5, maxRev * 0.75, maxRev].map((rev, idx) => {
            const x = getX(rev);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={padT}
                  x2={x}
                  y2={padT + graphH}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
                <text
                  x={x}
                  y={padT + graphH + 18}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.75"
                  fontFamily="monospace"
                >
                  {formatWholeCurrency(rev)}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={padL + graphW / 2}
            y={h - 10}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="currentColor"
            opacity="0.8"
          >
            {t('breakEven.xAxisLabel')}
          </text>
          <text
            transform={`rotate(-90 ${padL - 45} ${padT + graphH / 2})`}
            x={padL - 45}
            y={padT + graphH / 2}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="currentColor"
            opacity="0.8"
          >
            {t('breakEven.yAxisLabel')}
          </text>

          {/* Curves with distinct styling and markers (Non-color reliant) */}
          {/* Owner Curves (Lighter, contextual) */}
          <path
            d={pathOwnerBooth}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d={pathOwnerComm}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeDasharray="6 2 2 2"
          />

          {/* Artist Curves (Primary) */}
          {/* Artist Booth: Solid line with diamond marks */}
          <path
            d={pathArtistBooth}
            fill="none"
            stroke="var(--c-booth)"
            strokeWidth="2.7"
          />
          {pointsData.map((p, i) => (
            <polygon
              key={`ab-${i}`}
              points={`${getX(p.rev)},${getY(p.artistBooth) - 4} ${getX(p.rev) + 4},${getY(p.artistBooth)} ${getX(p.rev)},${getY(p.artistBooth) + 4} ${getX(p.rev) - 4},${getY(p.artistBooth)}`}
              fill="var(--c-booth)"
              stroke="var(--bg-card)"
              strokeWidth="1.5"
            />
          ))}

          {/* Artist Commission: Dashed line with circle marks */}
          <path
            d={pathArtistComm}
            fill="none"
            stroke="var(--c-comm)"
            strokeWidth="2.7"
            strokeDasharray="7 4"
          />
          {pointsData.map((p, i) => (
            <circle
              key={`ac-${i}`}
              cx={getX(p.rev)}
              cy={getY(p.artistComm)}
              r="3.5"
              fill="var(--c-comm)"
              stroke="var(--bg-card)"
              strokeWidth="1.5"
            />
          ))}

          {/* Break-Even Vertical Line & Badge */}
          {beX !== null && beY !== null && (
            <g>
              <line
                x1={beX}
                y1={padT}
                x2={beX}
                y2={padT + graphH}
                stroke="var(--c-neutral)"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <circle cx={beX} cy={beY} r="7" fill="var(--c-neutral)" stroke="var(--bg-card)" strokeWidth="2" />
              
              {/* Callout box */}
              <rect
                x={Math.min(beX + 8, w - 146)}
                y={Math.max(padT + 8, beY - 32)}
                width="138"
                height="28"
                rx="4"
                fill="var(--bg-card)"
                stroke="var(--c-neutral)"
                strokeWidth="1.5"
              />
              <text
                x={Math.min(beX + 14, w - 140)}
                y={Math.max(padT + 26, beY - 14)}
                fontSize="12"
                fontWeight="bold"
                fill="var(--c-neutral)"
              >
                {t('breakEven.calloutText', { amount: formatWholeCurrency(breakEvenMonthly!) })}
              </text>
            </g>
          )}

          {/* Current Revenue Marker */}
          {currentX !== null && (
            <g opacity="0.8">
              <line
                x1={currentX}
                y1={padT}
                x2={currentX}
                y2={padT + graphH}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={currentX}
                y={padT - 6}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="currentColor"
              >
                {t('breakEven.currentMarkerText', { amount: formatWholeCurrency(currentMonthlyRevenue) })}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Multi-Modal Description (Ensuring print accessibility without color) */}
      <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.5 bg-[var(--c-booth)] inline-block relative">
            <span className="absolute -top-1 left-1.5 w-2 h-2 rotate-45 bg-[var(--c-booth)] inline-block border border-[var(--bg-card)]" />
          </span>
          <span className="font-semibold text-[var(--text-main)]">
            {t('breakEven.legendArtistBooth')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-0.5 border-t-2 border-dashed border-[var(--c-comm)] inline-block relative">
            <span className="absolute -top-1 left-1.5 w-2 h-2 rounded-full bg-[var(--c-comm)] inline-block border border-[var(--bg-card)]" />
          </span>
          <span className="font-semibold text-[var(--text-main)]">
            {t('breakEven.legendArtistComm')}
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-75">
          <span className="w-5 h-0.5 border-t-2 border-dotted border-gray-400 inline-block" />
          <span className="text-[var(--text-muted)]">
            {t('breakEven.legendOwnerBooth')}
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-75">
          <span className="w-5 h-0.5 border-t-2 border-dashed border-gray-400 inline-block" />
          <span className="text-[var(--text-muted)]">
            {t('breakEven.legendOwnerComm')}
          </span>
        </div>
      </div>
    </div>
  );
};
