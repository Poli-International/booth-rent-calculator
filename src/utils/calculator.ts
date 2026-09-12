/**
 * Mathematical Calculation Engine for Booth Rent vs Commission V2
 * Pure arithmetic modeling from both artist and studio owner perspectives.
 */

import {
  DealParameters,
  RealisticMonthParams,
  InclusionItem,
  CalculationModel,
  DealSideResult,
  FinancialSide,
  MonthSpreadScenario,
  PayerType,
  TaxSettings,
  TaxBreakdown,
  SeasonalitySummary,
  MonthSeasonalityItem,
  StudioChair,
  StudioFloorModel,
  CompetingOffer,
} from '../types';
import { t, resolveName, getLanguage, getCurrencyCode, getCurrencySymbol } from '../i18n/translations';
import type { SupportedLanguage } from '../i18n/translations';

export const DEFAULT_INCLUSIONS: InclusionItem[] = [
  {
    id: 'supplies',
    nameKey: 'inclusions.supplies',
    hintKey: 'inclusions.suppliesHint',
    monthlyCost: 320,
    isPercentage: false,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'laundry',
    nameKey: 'inclusions.laundry',
    hintKey: 'inclusions.laundryHint',
    monthlyCost: 110,
    isPercentage: false,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'cardFees',
    nameKey: 'inclusions.cardFees',
    hintKey: 'inclusions.cardFeesHint',
    monthlyCost: 0,
    isPercentage: true,
    ratePct: 1.75,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'utilities',
    nameKey: 'inclusions.utilities',
    hintKey: 'inclusions.utilitiesHint',
    monthlyCost: 180,
    isPercentage: false,
    boothPayer: 'owner',
    commPayer: 'owner',
  },
];

export const STANDARD_PIERCING_KIT: InclusionItem[] = [
  {
    id: 'kit-needles',
    nameKey: 'kit.needlesName',
    hintKey: 'kit.needlesHint',
    monthlyCost: 90,
    costType: 'per_procedure',
    unitCost: 1.5,
    costPerProcedure: 1.5,
    isCustom: true,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'kit-gloves',
    nameKey: 'kit.glovesName',
    hintKey: 'kit.glovesHint',
    monthlyCost: 72,
    costType: 'per_procedure',
    unitCost: 1.2,
    costPerProcedure: 1.2,
    isCustom: true,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'kit-prep',
    nameKey: 'kit.prepName',
    hintKey: 'kit.prepHint',
    monthlyCost: 48,
    costType: 'per_procedure',
    unitCost: 0.8,
    costPerProcedure: 0.8,
    isCustom: true,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'kit-autoclave',
    nameKey: 'kit.autoclaveName',
    hintKey: 'kit.autoclaveHint',
    monthlyCost: 45,
    costType: 'fixed',
    unitCost: 0,
    isCustom: true,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
];

/**
 * The four baseline consumable rows that ship with the calculator.
 * Everything else in the list is an add-on: a loaded kit line or a line item
 * the user typed themselves.
 */
export const BASELINE_INCLUSION_IDS = ['supplies', 'laundry', 'cardFees', 'utilities'] as const;

/**
 * Display label for an inclusion row, in the active language.
 *
 * A seeded row (baseline or kit) stores a translation key in `nameKey`. A row
 * the user created stores the typed name itself in `nameKey` under an id of
 * `custom-<timestamp>`, and must be rendered verbatim. Testing the id rather
 * than `isCustom` is deliberate: the kit rows also carry `isCustom: true`
 * because they are optional add-ons, so that flag cannot distinguish a
 * translation key from a user-typed label. Getting this wrong printed the raw
 * key `kit.needlesName` on screen and in the printed summary.
 */
export function inclusionLabel(item: InclusionItem): string {
  return item.id.startsWith('custom-') ? item.nameKey : t(item.nameKey);
}

export function computeCommissionAmount(monthlyRevenue: number, deal: DealParameters): number {
  // 1. Walk-in split vs custom booking
  if (deal.walkInSplit?.enabled) {
    const walkInRev = monthlyRevenue * (deal.walkInSplit.walkInPct / 100);
    const customRev = Math.max(0, monthlyRevenue - walkInRev);
    const comm = (walkInRev * (deal.walkInSplit.walkInCommPct / 100)) + (customRev * (deal.walkInSplit.customCommPct / 100));
    return comm;
  }

  // 2. Tiered commission curves
  if (deal.useTieredCommission && deal.tieredTiers && deal.tieredTiers.length > 0) {
    let remaining = monthlyRevenue;
    let totalComm = 0;
    let prevThreshold = 0;

    for (let i = 0; i < deal.tieredTiers.length; i++) {
      const tier = deal.tieredTiers[i];
      const tierCapacity = tier.threshold - prevThreshold;
      const amountInTier = Math.min(remaining, Math.max(0, tierCapacity));
      totalComm += amountInTier * (tier.pct / 100);
      remaining = Math.max(0, remaining - amountInTier);
      prevThreshold = tier.threshold;
      if (remaining <= 0) break;
    }

    // Any excess above highest tier uses the highest tier's pct or baseline commissionPct
    if (remaining > 0) {
      const lastPct = deal.tieredTiers[deal.tieredTiers.length - 1]?.pct ?? deal.commissionPct;
      totalComm += remaining * (lastPct / 100);
    }
    return totalComm;
  }

  // 3. Flat percentage
  let comm = monthlyRevenue * (deal.commissionPct / 100);

  // 4. Floor minimum guarantee
  if (deal.dealStructure === 'floor' && deal.floorMinWeekly) {
    const floorMonthly = (deal.floorMinWeekly * deal.weeksPerYear) / 12;
    comm = Math.max(floorMonthly, comm);
  }

  return comm;
}

/**
 * Completed procedures per month, from the realistic-month inputs.
 *
 * Single source of truth: the per-procedure consumable cost, the break-even
 * chart and the printed summary must all divide by the same number, otherwise
 * the sheet disagrees with the screen.
 */
export function computeMonthlyProcedures(params: RealisticMonthParams): number {
  const completed =
    params.workingDaysPerMonth *
    params.apptsPerDay *
    (1 - (params.noShowRatePct || 0) / 100);
  return Math.max(0, Math.round(completed));
}

/**
 * Total monthly cost of one inclusion item.
 *
 * Per-procedure items are detected from either `costType: 'per_procedure'` or
 * the legacy `isPerProcedure` flag, and priced from `costPerProcedure` falling
 * back to `unitCost`. Previously only `isPerProcedure` was honoured, so every
 * standard-kit item silently fell through to its fixed `monthlyCost` and
 * editing a unit price changed nothing.
 */
export function computeItemCosts(
  item: InclusionItem,
  monthlyRevenue: number,
  monthlyProcedures: number = 40
): { total: number; boothArtist: number; boothOwner: number; commArtist: number; commOwner: number } {
  let total = 0;
  if (item.isPercentage) {
    total = monthlyRevenue * ((item.ratePct || 0) / 100);
  } else if (item.costType === 'per_procedure' || item.isPerProcedure) {
    const unit = item.costPerProcedure ?? item.unitCost ?? 0;
    total = unit > 0 ? unit * monthlyProcedures : item.monthlyCost || 0;
  } else {
    total = item.monthlyCost;
  }

  const splitAmount = (payer: PayerType, amount: number) => {
    if (payer === 'artist') return { artist: amount, owner: 0 };
    if (payer === 'owner') return { artist: 0, owner: amount };
    return { artist: amount * 0.5, owner: amount * 0.5 };
  };

  const bSplit = splitAmount(item.boothPayer, total);
  const cSplit = splitAmount(item.commPayer, total);

  return {
    total,
    boothArtist: bSplit.artist,
    boothOwner: bSplit.owner,
    commArtist: cSplit.artist,
    commOwner: cSplit.owner,
  };
}

export function computeDealSide(
  monthlyRevenue: number,
  deal: DealParameters,
  inclusions: InclusionItem[],
  model: 'booth' | 'comm',
  monthlyProcedures: number = 40,
  taxSettings?: TaxSettings
): DealSideResult {
  const annualRent = deal.weeklyRent * deal.weeksPerYear;
  const monthlyRent = annualRent / 12;

  // Aggregate inclusion items
  let suppliesArtist = 0, suppliesOwner = 0;
  let laundryArtist = 0, laundryOwner = 0;
  let cardFeesArtist = 0, cardFeesOwner = 0;
  let utilitiesArtist = 0, utilitiesOwner = 0;

  inclusions.forEach((item) => {
    const costs = computeItemCosts(item, monthlyRevenue, monthlyProcedures);
    const aCost = model === 'booth' ? costs.boothArtist : costs.commArtist;
    const oCost = model === 'booth' ? costs.boothOwner : costs.commOwner;

    // Anything the user added themselves — or that came from the standard
    // piercing kit — is a clinical consumable and belongs in the supplies
    // bucket. Previously only ids prefixed `cust-supply` qualified, so custom
    // line items created as `custom-<timestamp>` were misfiled as utilities.
    const isConsumable =
      item.id === 'supplies' ||
      item.isCustom === true ||
      item.id.startsWith('custom-') ||
      item.id.startsWith('cust-supply') ||
      item.id.startsWith('kit-');

    if (isConsumable) {
      suppliesArtist += aCost;
      suppliesOwner += oCost;
    } else if (item.id === 'laundry') {
      laundryArtist += aCost;
      laundryOwner += oCost;
    } else if (item.id === 'cardFees') {
      cardFeesArtist += aCost;
      cardFeesOwner += oCost;
    } else {
      utilitiesArtist += aCost;
      utilitiesOwner += oCost;
    }
  });

  const totalInclusionsArtist = suppliesArtist + laundryArtist + cardFeesArtist + utilitiesArtist;
  const totalInclusionsOwner = suppliesOwner + laundryOwner + cardFeesOwner + utilitiesOwner;

  if (model === 'booth') {
    // Check if Hybrid model applies (base rent + reduced commission)
    let rentDeduction = monthlyRent;
    let commDeduction = 0;

    if (deal.dealStructure === 'hybrid' && deal.hybridBaseWeeklyRent) {
      rentDeduction = (deal.hybridBaseWeeklyRent * deal.weeksPerYear) / 12;
      commDeduction = monthlyRevenue * ((deal.hybridCommissionPct || 0) / 100);
    }

    const artistTotalDeductions = rentDeduction + commDeduction + totalInclusionsArtist;
    const artistNetMonthly = monthlyRevenue - artistTotalDeductions;
    const artistNetAnnual = artistNetMonthly * 12;
    const artistRetainedPct = monthlyRevenue > 0 ? (artistNetMonthly / monthlyRevenue) * 100 : 0;

    const ownerGross = rentDeduction + commDeduction;
    const ownerTotalDeductions = totalInclusionsOwner;
    const ownerNetMonthly = ownerGross - ownerTotalDeductions;
    const ownerNetAnnual = ownerNetMonthly * 12;
    const ownerRetainedPct = monthlyRevenue > 0 ? (ownerNetMonthly / monthlyRevenue) * 100 : 0;

    const artistSide: FinancialSide = {
      grossRevenue: monthlyRevenue,
      rent: rentDeduction,
      commission: commDeduction,
      supplies: suppliesArtist,
      laundry: laundryArtist,
      cardFees: cardFeesArtist,
      utilities: utilitiesArtist,
      totalInclusions: totalInclusionsArtist,
      totalDeductions: artistTotalDeductions,
      netIncomeMonthly: artistNetMonthly,
      netIncomeAnnual: artistNetAnnual,
      retainedPct: artistRetainedPct,
    };

    if (taxSettings?.enabled) {
      artistSide.tax = computeTaxBreakdown(monthlyRevenue, artistTotalDeductions, taxSettings);
    }

    const ownerSide: FinancialSide = {
      grossRevenue: ownerGross,
      rent: rentDeduction,
      commission: commDeduction,
      supplies: suppliesOwner,
      laundry: laundryOwner,
      cardFees: cardFeesOwner,
      utilities: utilitiesOwner,
      totalInclusions: totalInclusionsOwner,
      totalDeductions: ownerTotalDeductions,
      netIncomeMonthly: ownerNetMonthly,
      netIncomeAnnual: ownerNetAnnual,
      retainedPct: ownerRetainedPct,
    };

    return { artist: artistSide, owner: ownerSide };
  } else {
    // Commission model (supports flat, tiered, walk-in split, and minimum floor guarantee)
    const commPaid = computeCommissionAmount(monthlyRevenue, deal);
    const artistTotalDeductions = commPaid + totalInclusionsArtist;
    const artistNetMonthly = monthlyRevenue - artistTotalDeductions;
    const artistNetAnnual = artistNetMonthly * 12;
    const artistRetainedPct = monthlyRevenue > 0 ? (artistNetMonthly / monthlyRevenue) * 100 : 0;

    const ownerGross = commPaid;
    const ownerTotalDeductions = totalInclusionsOwner;
    const ownerNetMonthly = ownerGross - ownerTotalDeductions;
    const ownerNetAnnual = ownerNetMonthly * 12;
    const ownerRetainedPct = monthlyRevenue > 0 ? (ownerNetMonthly / monthlyRevenue) * 100 : 0;

    const artistSide: FinancialSide = {
      grossRevenue: monthlyRevenue,
      rent: 0,
      commission: commPaid,
      supplies: suppliesArtist,
      laundry: laundryArtist,
      cardFees: cardFeesArtist,
      utilities: utilitiesArtist,
      totalInclusions: totalInclusionsArtist,
      totalDeductions: artistTotalDeductions,
      netIncomeMonthly: artistNetMonthly,
      netIncomeAnnual: artistNetAnnual,
      retainedPct: artistRetainedPct,
    };

    if (taxSettings?.enabled) {
      artistSide.tax = computeTaxBreakdown(monthlyRevenue, artistTotalDeductions, taxSettings);
    }

    const ownerSide: FinancialSide = {
      grossRevenue: ownerGross,
      rent: 0,
      commission: commPaid,
      supplies: suppliesOwner,
      laundry: laundryOwner,
      cardFees: cardFeesOwner,
      utilities: utilitiesOwner,
      totalInclusions: totalInclusionsOwner,
      totalDeductions: ownerTotalDeductions,
      netIncomeMonthly: ownerNetMonthly,
      netIncomeAnnual: ownerNetAnnual,
      retainedPct: ownerRetainedPct,
    };

    return { artist: artistSide, owner: ownerSide };
  }
}

export function computeBreakEven(
  deal: DealParameters,
  inclusions: InclusionItem[],
  monthlyProcedures: number = 40
): { breakEvenMonthly: number | null; breakEvenWeekly: number | null; reachable: boolean } {
  let annualRent = deal.weeklyRent * deal.weeksPerYear;
  let monthlyRent = annualRent / 12;
  let hybridCommRate = 0;

  if (deal.dealStructure === 'hybrid' && deal.hybridBaseWeeklyRent) {
    annualRent = deal.hybridBaseWeeklyRent * deal.weeksPerYear;
    monthlyRent = annualRent / 12;
    hybridCommRate = (deal.hybridCommissionPct || 0) / 100;
  }

  // Compute fixed inclusions paid by artist under booth vs commission
  let fixedIncBoothArtist = 0;
  let fixedIncCommArtist = 0;
  let cardFractionBooth = 0;
  let cardFractionComm = 0;
  let cardRatePct = 0;

  inclusions.forEach((item) => {
    if (item.isPercentage) {
      cardRatePct = item.ratePct || 0;
      cardFractionBooth = item.boothPayer === 'artist' ? 1 : item.boothPayer === 'split' ? 0.5 : 0;
      cardFractionComm = item.commPayer === 'artist' ? 1 : item.commPayer === 'split' ? 0.5 : 0;
    } else {
      // Per-procedure items are constant with respect to revenue, so they belong
      // in the fixed term here too — priced the same way computeItemCosts does,
      // otherwise the crossover point would disagree with the drawn curves.
      const unit = item.costPerProcedure ?? item.unitCost ?? 0;
      const cost =
        (item.costType === 'per_procedure' || item.isPerProcedure) && unit > 0
          ? unit * monthlyProcedures
          : item.monthlyCost || 0;
      const bCost = item.boothPayer === 'artist' ? cost : item.boothPayer === 'split' ? cost * 0.5 : 0;
      const cCost = item.commPayer === 'artist' ? cost : item.commPayer === 'split' ? cost * 0.5 : 0;
      fixedIncBoothArtist += bCost;
      fixedIncCommArtist += cCost;
    }
  });

  const deltaFixedArtist = fixedIncBoothArtist - fixedIncCommArtist;
  const commRate = (deal.commissionPct / 100) - hybridCommRate;
  const cardDeltaRate = ((cardFractionComm - cardFractionBooth) * cardRatePct) / 100;
  const effectiveSlope = commRate + cardDeltaRate;

  if (effectiveSlope <= 0) {
    return { breakEvenMonthly: null, breakEvenWeekly: null, reachable: false };
  }

  const beMonthly = (monthlyRent + deltaFixedArtist) / effectiveSlope;
  if (beMonthly < 0) {
    return { breakEvenMonthly: 0, breakEvenWeekly: 0, reachable: true };
  }

  const beWeekly = (beMonthly * 12) / deal.weeksPerYear;
  return { breakEvenMonthly: beMonthly, breakEvenWeekly: beWeekly, reachable: true };
}

export function computeFullModel(
  deal: DealParameters,
  realisticParams: RealisticMonthParams,
  inclusions: InclusionItem[],
  taxSettings?: TaxSettings
): CalculationModel {
  // Realistic appointment calculations
  const bookedAppointments = realisticParams.workingDaysPerMonth * realisticParams.apptsPerDay;
  const completedAppointments = Math.round(
    bookedAppointments * (1 - realisticParams.noShowRatePct / 100) * 10
  ) / 10;

  let grossMonthlyRevenue = realisticParams.useRealisticEngine
    ? completedAppointments * realisticParams.avgTicket
    : realisticParams.directMonthlyRevenue;

  if (isNaN(grossMonthlyRevenue) || grossMonthlyRevenue < 0) {
    grossMonthlyRevenue = 0;
  }

  const grossWeeklyRevenue = (grossMonthlyRevenue * 12) / deal.weeksPerYear;
  const grossAnnualRevenue = grossMonthlyRevenue * 12;

  // Calculate current DealSide for both booth and commission
  const boothDeal = computeDealSide(grossMonthlyRevenue, deal, inclusions, 'booth', completedAppointments, taxSettings);
  const commDeal = computeDealSide(grossMonthlyRevenue, deal, inclusions, 'comm', completedAppointments, taxSettings);

  // Break-even
  const { breakEvenMonthly, breakEvenWeekly, reachable } = computeBreakEven(
    deal,
    inclusions,
    completedAppointments
  );

  // Scenarios for Realistic Month Spread
  // 1. Conservative (Slow): e.g. higher no-shows (+8%) and 15% fewer bookings
  const conservativeBookings = Math.max(1, Math.round(bookedAppointments * 0.85));
  const conservativeNoShow = Math.min(60, realisticParams.noShowRatePct + 8);
  const conservativeCompleted = Math.round(conservativeBookings * (1 - conservativeNoShow / 100) * 10) / 10;
  const conservativeGross = realisticParams.useRealisticEngine
    ? conservativeCompleted * realisticParams.avgTicket
    : grossMonthlyRevenue * 0.8;
  const conservativeBooth = computeDealSide(conservativeGross, deal, inclusions, 'booth', conservativeCompleted, taxSettings);
  const conservativeComm = computeDealSide(conservativeGross, deal, inclusions, 'comm', conservativeCompleted, taxSettings);
  const conservativeDelta = conservativeBooth.artist.netIncomeMonthly - conservativeComm.artist.netIncomeMonthly;

  const conservativeScenario: MonthSpreadScenario = {
    labelKey: 'realistic.spreadConservative',
    descKey: 'realistic.spreadConservativeDesc',
    appointments: conservativeCompleted,
    grossRevenue: conservativeGross,
    booth: conservativeBooth,
    comm: conservativeComm,
    deltaArtist: conservativeDelta,
  };

  // 2. Expected (Baseline):
  const expectedDelta = boothDeal.artist.netIncomeMonthly - commDeal.artist.netIncomeMonthly;
  const expectedScenario: MonthSpreadScenario = {
    labelKey: 'realistic.spreadExpected',
    descKey: 'realistic.spreadExpectedDesc',
    appointments: completedAppointments,
    grossRevenue: grossMonthlyRevenue,
    booth: boothDeal,
    comm: commDeal,
    deltaArtist: expectedDelta,
  };

  // 3. Peak (Busy): e.g. lower no-shows (-5%, min 2%) and 15% higher bookings
  const peakBookings = Math.round(bookedAppointments * 1.15);
  const peakNoShow = Math.max(2, realisticParams.noShowRatePct - 6);
  const peakCompleted = Math.round(peakBookings * (1 - peakNoShow / 100) * 10) / 10;
  const peakGross = realisticParams.useRealisticEngine
    ? peakCompleted * (realisticParams.avgTicket * 1.05)
    : grossMonthlyRevenue * 1.25;
  const peakBooth = computeDealSide(peakGross, deal, inclusions, 'booth', peakCompleted, taxSettings);
  const peakComm = computeDealSide(peakGross, deal, inclusions, 'comm', peakCompleted, taxSettings);
  const peakDelta = peakBooth.artist.netIncomeMonthly - peakComm.artist.netIncomeMonthly;

  const peakScenario: MonthSpreadScenario = {
    labelKey: 'realistic.spreadPeak',
    descKey: 'realistic.spreadPeakDesc',
    appointments: peakCompleted,
    grossRevenue: peakGross,
    booth: peakBooth,
    comm: peakComm,
    deltaArtist: peakDelta,
  };

  // Warnings
  const warnings: string[] = [];
  const monthlyRent = (deal.weeklyRent * deal.weeksPerYear) / 12;
  if (monthlyRent > grossMonthlyRevenue && grossMonthlyRevenue > 0) {
    warnings.push('warnings.warnRentExceedsRev');
  }
  if (deal.commissionPct >= 100) {
    warnings.push('warnings.warnComm100');
  }
  if (realisticParams.noShowRatePct > 35) {
    warnings.push('warnings.warnHighNoShow');
  }
  if (grossMonthlyRevenue > 35000) {
    warnings.push('warnings.warnHighRevenue');
  }

  return {
    grossMonthlyRevenue,
    grossWeeklyRevenue,
    grossAnnualRevenue,
    booth: boothDeal,
    comm: commDeal,
    breakEvenMonthly,
    breakEvenWeekly,
    breakEvenReachable: reachable,
    realistic: {
      bookedAppointments,
      completedAppointments,
      conservative: conservativeScenario,
      expected: expectedScenario,
      peak: peakScenario,
    },
    warnings,
  };
}

/**
 * Tax constants for the estimated overlay. These are the figures for the
 * 2026/27 UK tax year and the 2026 US tax year, and they change annually —
 * they are estimates for planning, not a substitute for a filed return.
 *
 * Sources: HMRC personal allowance and basic rate limit frozen at 12,570 and
 * 50,270 to 2027/28; Class 4 NIC 6% between those points and 2% above. IRS
 * 2026 single-filer standard deduction 16,100; Social Security wage base
 * 184,500; self-employment tax 15.3% on 92.35% of net profit.
 */
const UK_PERSONAL_ALLOWANCE = 12570;
const UK_BASIC_RATE_LIMIT = 50270;
const UK_BASIC_RATE_COMBINED = 0.26; // 20% income tax + 6% Class 4 NIC
const UK_HIGHER_RATE_COMBINED = 0.42; // 40% income tax + 2% Class 4 NIC

const US_STANDARD_DEDUCTION = 16100;
const US_SS_WAGE_BASE = 184500;
const US_SE_INCOME_FACTOR = 0.9235; // SE tax applies to 92.35% of net profit
const US_SS_RATE = 0.124; // 12.4%, both shares of Social Security
const US_MEDICARE_RATE = 0.029; // 2.9%, uncapped
/** 2026 federal income tax brackets, single filer, on taxable income. */
const US_BRACKETS: ReadonlyArray<{ upTo: number; rate: number }> = [
  { upTo: 12100, rate: 0.1 },
  { upTo: 49150, rate: 0.12 },
  { upTo: 105225, rate: 0.22 },
  { upTo: 200700, rate: 0.24 },
  { upTo: 375000, rate: 0.32 },
  { upTo: 530000, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

export function computeTaxBreakdown(
  grossRevenue: number,
  allowableDeductions: number,
  settings: TaxSettings
): TaxBreakdown {
  const taxableProfit = Math.max(0, grossRevenue - allowableDeductions);

  // One estimate function for the active regime, so the "what you would have
  // paid with no deductions" figure used for the tax-shield comparison is
  // computed under the SAME regime as the actual figure. It previously applied
  // UK personal-allowance and 26% basic-rate maths unconditionally, so under the
  // US or flat regime the tax-shield number compared two different tax systems.
  const estimateTaxFor = (profit: number): number => {
    if (settings.regime === 'uk_sole_trader') {
      // UK sole trader. The annual bands are applied on a monthly scale, which
      // is exact because both bands are linear in profit.
      const monthlyAllowance = UK_PERSONAL_ALLOWANCE / 12;
      const monthlyBasicLimit = UK_BASIC_RATE_LIMIT / 12;
      if (profit <= monthlyAllowance) return 0;
      const taxable = profit - monthlyAllowance;
      const basicBand = Math.min(taxable, monthlyBasicLimit - monthlyAllowance);
      const higherBand = Math.max(0, taxable - basicBand);
      return basicBand * UK_BASIC_RATE_COMBINED + higherBand * UK_HIGHER_RATE_COMBINED;
    }
    if (settings.regime === 'us_self_employed') {
      // US self-employment tax plus federal income tax, single filer.
      // Annualised, because the brackets and the Social Security wage base are
      // annual amounts. The previous version used the 2024 standard deduction,
      // charged a flat 12% with no 10% band and no higher brackets, and never
      // capped Social Security at the wage base — so it overtaxed low profits
      // and undertaxed high ones.
      const annualProfit = profit * 12;
      const seIncome = annualProfit * US_SE_INCOME_FACTOR;
      const seTax =
        Math.min(seIncome, US_SS_WAGE_BASE) * US_SS_RATE + seIncome * US_MEDICARE_RATE;

      // Taxable income is net profit less the standard deduction and the
      // deductible half of self-employment tax.
      const taxableIncome = Math.max(0, annualProfit - US_STANDARD_DEDUCTION - seTax * 0.5);
      let incomeTax = 0;
      let lowerBound = 0;
      for (const bracket of US_BRACKETS) {
        if (taxableIncome <= lowerBound) break;
        incomeTax += (Math.min(taxableIncome, bracket.upTo) - lowerBound) * bracket.rate;
        lowerBound = bracket.upTo;
      }
      return (seTax + incomeTax) / 12;
    }
    // Flat rate.
    return profit * ((settings.flatRatePct || 25) / 100);
  };

  const estimatedTax = estimateTaxFor(taxableProfit);

  const takeHomeCash = Math.max(0, grossRevenue - allowableDeductions - estimatedTax);
  const effectiveTaxRatePct = taxableProfit > 0 ? (estimatedTax / taxableProfit) * 100 : 0;
  const grossTaxEstimate = estimateTaxFor(grossRevenue);
  const taxShieldSavings = Math.max(0, grossTaxEstimate - estimatedTax);

  return {
    grossRevenue,
    allowableDeductions,
    taxableProfit,
    estimatedTax,
    takeHomeCash,
    effectiveTaxRatePct,
    taxShieldSavings,
  };
}

export interface SeasonalityInputMonth {
  monthIndex: number;
  monthKey: string;
  multiplier: number;
  weeksOff: number;
}

export const DEFAULT_SEASONALITY_INPUTS: SeasonalityInputMonth[] = [
  { monthIndex: 0, monthKey: 'seasonality.jan', multiplier: 0.75, weeksOff: 1 },
  { monthIndex: 1, monthKey: 'seasonality.feb', multiplier: 0.80, weeksOff: 0 },
  { monthIndex: 2, monthKey: 'seasonality.mar', multiplier: 0.95, weeksOff: 0 },
  { monthIndex: 3, monthKey: 'seasonality.apr', multiplier: 1.00, weeksOff: 0 },
  { monthIndex: 4, monthKey: 'seasonality.may', multiplier: 1.10, weeksOff: 0 },
  { monthIndex: 5, monthKey: 'seasonality.jun', multiplier: 1.15, weeksOff: 0 },
  { monthIndex: 6, monthKey: 'seasonality.jul', multiplier: 1.20, weeksOff: 0 },
  { monthIndex: 7, monthKey: 'seasonality.aug', multiplier: 1.15, weeksOff: 2 },
  { monthIndex: 8, monthKey: 'seasonality.sep', multiplier: 0.95, weeksOff: 0 },
  { monthIndex: 9, monthKey: 'seasonality.oct', multiplier: 1.05, weeksOff: 0 },
  { monthIndex: 10, monthKey: 'seasonality.nov', multiplier: 1.10, weeksOff: 0 },
  { monthIndex: 11, monthKey: 'seasonality.dec', multiplier: 1.30, weeksOff: 1 },
];

export function computeSeasonalitySummary(
  baselineGrossMonthly: number,
  deal: DealParameters,
  inclusions: InclusionItem[],
  monthInputs: SeasonalityInputMonth[]
): SeasonalitySummary {
  const months: MonthSeasonalityItem[] = [];
  let annualGross = 0;
  let annualBoothArtistNet = 0;
  let annualCommArtistNet = 0;
  let totalWeeksOff = 0;
  let totalRentDuringTimeOff = 0;

  for (const m of monthInputs) {
    const activeWeeksFraction = Math.max(0, (4.33 - m.weeksOff) / 4.33);
    const monthGross = baselineGrossMonthly * m.multiplier * activeWeeksFraction;

    const bSide = computeDealSide(monthGross, deal, inclusions, 'booth');
    const cSide = computeDealSide(monthGross, deal, inclusions, 'comm');

    const weeklyRent = deal.dealStructure === 'hybrid' && deal.hybridBaseWeeklyRent
      ? deal.hybridBaseWeeklyRent
      : deal.weeklyRent;

    const rentOwedWhileAway = weeklyRent * m.weeksOff;

    months.push({
      monthIndex: m.monthIndex,
      monthKey: m.monthKey,
      multiplier: m.multiplier,
      weeksOff: m.weeksOff,
      grossRevenue: monthGross,
      boothArtistNet: bSide.artist.netIncomeMonthly,
      commArtistNet: cSide.artist.netIncomeMonthly,
      rentOwedWhileAway,
    });

    annualGross += monthGross;
    annualBoothArtistNet += bSide.artist.netIncomeMonthly;
    annualCommArtistNet += cSide.artist.netIncomeMonthly;
    totalWeeksOff += m.weeksOff;
    totalRentDuringTimeOff += rentOwedWhileAway;
  }

  const monthlyRent = (deal.weeklyRent * deal.weeksPerYear) / 12;
  const recommendedReserveBuffer = (monthlyRent * 2) + totalRentDuringTimeOff + 500;

  return {
    months,
    annualGross,
    annualBoothArtistNet,
    annualCommArtistNet,
    totalWeeksOff,
    totalRentDuringTimeOff,
    recommendedReserveBuffer,
  };
}

export const DEFAULT_STUDIO_CHAIRS: StudioChair[] = [
  { id: 'chair-1', nameKey: 'chairName.seniorPiercer', model: 'booth', weeklyRent: 275, commissionPct: 40, monthlyRevenue: 5600 },
  { id: 'chair-2', nameKey: 'chairName.bodyPiercer', model: 'booth', weeklyRent: 250, commissionPct: 40, monthlyRevenue: 4800 },
  { id: 'chair-3', nameKey: 'chairName.residentArtist', model: 'comm', weeklyRent: 250, commissionPct: 50, monthlyRevenue: 5200 },
  { id: 'chair-4', nameKey: 'chairName.juniorApprentice', model: 'comm', weeklyRent: 200, commissionPct: 55, monthlyRevenue: 3400 },
  { id: 'chair-5', nameKey: 'chairName.guestFlex', model: 'booth', weeklyRent: 250, commissionPct: 40, monthlyRevenue: 3000 },
];

export function computeStudioFloorModel(
  chairs: StudioChair[],
  shopFixedMonthlyOverhead: number = 3200
): StudioFloorModel {
  let totalGrossStationRevenue = 0;
  let totalStudioRevenue = 0;
  let occupiedChairs = 0;

  for (const c of chairs) {
    if (c.model === 'vacant') continue;

    occupiedChairs++;
    totalGrossStationRevenue += c.monthlyRevenue;

    if (c.model === 'booth') {
      const rentalIncome = (c.weeklyRent * 48) / 12;
      totalStudioRevenue += rentalIncome;
    } else {
      const commIncome = c.monthlyRevenue * (c.commissionPct / 100);
      totalStudioRevenue += commIncome;
    }
  }

  const totalStudioNetProfit = totalStudioRevenue - shopFixedMonthlyOverhead;
  const occupancyRatePct = chairs.length > 0 ? (occupiedChairs / chairs.length) * 100 : 0;
  const avgIncomePerOccupied = occupiedChairs > 0 ? totalStudioRevenue / occupiedChairs : 1000;
  const breakEvenChairsNeeded = Math.ceil(shopFixedMonthlyOverhead / (avgIncomePerOccupied || 1));
  const emptyChairLostMonthly = avgIncomePerOccupied;

  return {
    chairs,
    shopFixedMonthlyOverhead,
    totalGrossStationRevenue,
    totalStudioRevenue,
    totalStudioNetProfit,
    breakEvenChairsNeeded,
    occupancyRatePct,
    emptyChairLostMonthly,
  };
}

export function exportToCsv(
  model: CalculationModel,
  deal: DealParameters,
  inclusions: InclusionItem[],
  seasonality?: SeasonalitySummary,
  studioFloor?: StudioFloorModel
): void {
  const lines: string[] = [];
  // Plain fixed-point numbers: a formatted currency string would inject a
  // thousands separator and split the field across CSV columns.
  const num = (v: number) => v.toFixed(2);
  const payerLabel = (p: PayerType) =>
    p === 'artist'
      ? t('inclusions.payerArtist')
      : p === 'owner'
        ? t('inclusions.payerOwner')
        : t('inclusions.payerSplit');

  lines.push(t('export.title'));
  lines.push(t('export.generated', { date: new Date().toISOString() }));
  lines.push('');

  lines.push(t('export.sectionCore'));
  lines.push([t('export.colMetric'), t('print.thBooth'), t('print.thCommission')].join(','));
  lines.push([t('print.metricGrossMonthly'), num(model.grossMonthlyRevenue), num(model.grossMonthlyRevenue)].join(','));
  lines.push([t('export.rowStudioFee'), num(model.booth.artist.rent), num(model.comm.artist.commission)].join(','));
  lines.push(
    [t('export.rowInclusionsTotal'), num(model.booth.artist.totalInclusions), num(model.comm.artist.totalInclusions)].join(',')
  );
  lines.push(
    [t('print.metricArtistNetMonthly'), num(model.booth.artist.netIncomeMonthly), num(model.comm.artist.netIncomeMonthly)].join(',')
  );
  lines.push(
    [t('print.metricArtistAnnualNet'), num(model.booth.artist.netIncomeAnnual), num(model.comm.artist.netIncomeAnnual)].join(',')
  );
  lines.push(
    [t('export.rowArtistRetained'), `${model.booth.artist.retainedPct.toFixed(1)}%`, `${model.comm.artist.retainedPct.toFixed(1)}%`].join(',')
  );
  lines.push(
    [t('print.metricOwnerNetMargin'), num(model.booth.owner.netIncomeMonthly), num(model.comm.owner.netIncomeMonthly)].join(',')
  );
  const breakEven = model.breakEvenMonthly !== null ? num(model.breakEvenMonthly) : t('print.notApplicable');
  lines.push([t('print.paramBreakEvenRevenue'), breakEven, breakEven].join(','));
  lines.push('');

  lines.push(t('export.sectionInclusions'));
  lines.push(
    [t('export.colItem'), t('export.colCostOrRate'), t('export.colBoothPayer'), t('export.colCommPayer')].join(',')
  );
  for (const inc of inclusions) {
    const costDesc = inc.isPercentage
      ? `${inc.ratePct}%`
      : inc.costType === 'per_procedure' || inc.isPerProcedure
        ? `${(inc.costPerProcedure ?? inc.unitCost ?? 0).toFixed(2)}/${t('common.procedureAbbr')}`
        : num(inc.monthlyCost);
    // A user-typed name is stored verbatim; t() returns unknown keys unchanged,
    // so the same expression resolves standard, kit and custom rows correctly.
    const name = inc.customName || t(inc.nameKey);
    lines.push(`"${name}",${costDesc},${payerLabel(inc.boothPayer)},${payerLabel(inc.commPayer)}`);
  }
  lines.push('');

  if (seasonality) {
    lines.push(t('export.sectionSeasonality'));
    lines.push(
      [
        t('seasonality.colMonth'),
        t('seasonality.colMultiplier'),
        t('seasonality.colWeeksOff'),
        t('seasonality.colGross'),
        t('seasonality.colBoothNet'),
        t('seasonality.colCommNet'),
        t('seasonality.colRentAway'),
      ].join(',')
    );
    for (const m of seasonality.months) {
      lines.push(
        [
          t(m.monthKey),
          `${m.multiplier}x`,
          m.weeksOff,
          num(m.grossRevenue),
          num(m.boothArtistNet),
          num(m.commArtistNet),
          num(m.rentOwedWhileAway),
        ].join(',')
      );
    }
    lines.push('');
  }

  if (studioFloor) {
    lines.push(t('export.sectionStudio'));
    lines.push(`${t('export.rowShopOverhead')},${num(studioFloor.shopFixedMonthlyOverhead)}`);
    lines.push(`${t('export.rowOccupancyRate')},${studioFloor.occupancyRatePct.toFixed(1)}%`);
    lines.push(`${t('studio.studioRevenueTotal')},${num(studioFloor.totalStudioRevenue)}`);
    lines.push(`${t('studio.studioNetProfit')},${num(studioFloor.totalStudioNetProfit)}`);
    // Separate the two-column summary above from the five-column station table,
    // so the section has the same blank-line structure as every other one.
    lines.push('');
    lines.push(
      [
        t('export.colStation'),
        t('studio.modelLabel'),
        t('export.colWeeklyRent'),
        t('multiDeal.commLabel'),
        t('export.colMonthlyRevenue'),
      ].join(',')
    );
    for (const c of studioFloor.chairs) {
      const modelLabel =
        c.model === 'booth'
          ? t('studio.modelBooth')
          : c.model === 'comm'
            ? t('studio.modelComm')
            : t('studio.modelVacant');
      lines.push(
        `"${resolveName(c.name, c.nameKey, c.nameParams)}",${modelLabel},${c.weeklyRent},${c.commissionPct}%,${num(c.monthlyRevenue)}`
      );
    }
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `booth-rent-vs-commission-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJson(
  model: CalculationModel,
  deal: DealParameters,
  inclusions: InclusionItem[],
  seasonality?: SeasonalitySummary,
  studioFloor?: StudioFloorModel
): void {
  const data = {
    metadata: {
      generatedAt: new Date().toISOString(),
      tool: t('export.toolName'),
      author: t('print.suiteEyebrow'),
      language: getLanguage(),
    },
    deal,
    inclusions,
    summary: {
      grossMonthlyRevenue: model.grossMonthlyRevenue,
      breakEvenMonthly: model.breakEvenMonthly,
      booth: model.booth,
      commission: model.comm,
    },
    realisticSpread: model.realistic,
    seasonality,
    studioFloor,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `booth-rent-vs-commission-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function encodeStateToUrl(state: any): string {
  try {
    const json = JSON.stringify(state);
    const b64 = btoa(encodeURIComponent(json));
    const url = new URL(window.location.href);
    url.hash = 'deal=' + b64;
    window.history.replaceState(null, '', url.toString());
    return url.toString();
  } catch (err) {
    console.error('Failed to encode deal state:', err);
    return window.location.href;
  }
}

export function decodeStateFromUrl(hashOverride?: string): any | null {
  try {
    const hash = hashOverride !== undefined ? hashOverride : (typeof window !== 'undefined' ? window.location.hash : '');
    if (!hash.includes('deal=')) return null;
    const b64 = hash.split('deal=')[1];
    if (!b64) return null;
    const json = decodeURIComponent(atob(b64));
    return JSON.parse(json);
  } catch (err) {
    console.error('Failed to decode deal state from URL:', err);
    return null;
  }
}

export interface SavedDealPreset {
  id: string;
  /** Name typed by the user. Wins over nameKey when present. */
  name?: string;
  /** Translation key for a seeded preset name. */
  nameKey?: string;
  createdAt: string;
  deal: DealParameters;
  realisticParams?: RealisticMonthParams;
}

export const DEFAULT_PRESETS: SavedDealPreset[] = [
  {
    id: 'preset-standard-5050',
    nameKey: 'presetName.standard5050',
    createdAt: '2026-01-01',
    deal: { weeklyRent: 250, commissionPct: 50, weeksPerYear: 48, dealStructure: 'standard' },
  },
  {
    id: 'preset-city-centre',
    nameKey: 'presetName.cityCentre',
    createdAt: '2026-01-01',
    deal: { weeklyRent: 350, commissionPct: 40, weeksPerYear: 50, dealStructure: 'standard' },
  },
  {
    id: 'preset-hybrid-deal',
    nameKey: 'presetName.hybrid',
    createdAt: '2026-01-01',
    deal: {
      weeklyRent: 250,
      commissionPct: 40,
      weeksPerYear: 48,
      dealStructure: 'hybrid',
      hybridBaseWeeklyRent: 120,
      hybridCommissionPct: 20,
    },
  },
  {
    id: 'preset-floor-guarantee',
    nameKey: 'presetName.floorGuarantee',
    createdAt: '2026-01-01',
    deal: {
      weeklyRent: 250,
      commissionPct: 50,
      weeksPerYear: 48,
      dealStructure: 'floor',
      floorMinWeekly: 220,
    },
  },
];

export function getSavedPresets(): SavedDealPreset[] {
  try {
    const raw = localStorage.getItem('poli_booth_presets');
    if (!raw) return DEFAULT_PRESETS;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

export function savePreset(name: string, deal: DealParameters, realisticParams?: RealisticMonthParams): SavedDealPreset[] {
  const current = getSavedPresets();
  const newPreset: SavedDealPreset = {
    id: 'preset-' + Date.now(),
    name,
    createdAt: new Date().toISOString().slice(0, 10),
    deal,
    realisticParams,
  };
  const updated = [newPreset, ...current.filter((p) => p.id !== newPreset.id)];
  try {
    localStorage.setItem('poli_booth_presets', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save preset to localStorage', e);
  }
  return updated;
}

export function deletePreset(id: string): SavedDealPreset[] {
  const current = getSavedPresets();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem('poli_booth_presets', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete preset from localStorage', e);
  }
  return updated;
}

export function computeCompetingOfferResult(
  offer: CompetingOffer,
  monthlyRevenue: number,
  inclusions: InclusionItem[],
  monthlyProcedures: number = 40
): { monthlyGross: number; monthlyDeductions: number; artistNetMonthly: number; retainedPct: number; ownerNetMonthly: number } {
  const dealParams: DealParameters = {
    weeklyRent: offer.weeklyRent,
    commissionPct: offer.commissionPct,
    weeksPerYear: 48,
    dealStructure: offer.type === 'hybrid' ? 'hybrid' : 'standard',
    hybridBaseWeeklyRent: offer.hybridBaseRent,
    hybridCommissionPct: offer.hybridCommPct,
  };

  const side = computeDealSide(
    monthlyRevenue,
    dealParams,
    inclusions,
    offer.type === 'comm' ? 'comm' : 'booth',
    monthlyProcedures
  );

  return {
    monthlyGross: monthlyRevenue,
    monthlyDeductions: side.artist.totalDeductions,
    artistNetMonthly: side.artist.netIncomeMonthly,
    retainedPct: side.artist.retainedPct,
    ownerNetMonthly: side.owner.netIncomeMonthly,
  };
}


/**
 * Money formatting for the active locale.
 *
 * No currency symbol is hardcoded: the symbol and its position come from
 * Intl with the locale's ISO 4217 code, so a French reader sees `1 234,56 €`
 * and a UK reader sees `£1,234.56`.
 */
function formatMoney(value: number, fractionDigits: number, lang?: SupportedLanguage): string {
  const locale = lang || getLanguage();
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: getCurrencyCode(locale),
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    // Fallback for engines without full Intl currency data.
    return `${getCurrencySymbol(locale)}${value.toFixed(fractionDigits)}`;
  }
}

export function formatCurrency(n: number, lang?: SupportedLanguage): string {
  return formatMoney(isNaN(n) ? 0 : n, 2, lang);
}

export function formatWholeCurrency(n: number, lang?: SupportedLanguage): string {
  return formatMoney(isNaN(n) ? 0 : Math.round(n), 0, lang);
}
