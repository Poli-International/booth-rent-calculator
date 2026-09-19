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

export const DEFAULT_INCLUSIONS: InclusionItem[] = [
  {
    id: 'supplies',
    nameKey: 'inclusionSupplies',
    hintKey: 'inclusionSuppliesHint',
    monthlyCost: 320,
    isPercentage: false,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'laundry',
    nameKey: 'inclusionLaundry',
    hintKey: 'inclusionLaundryHint',
    monthlyCost: 110,
    isPercentage: false,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'cardFees',
    nameKey: 'inclusionCardFees',
    hintKey: 'inclusionCardFeesHint',
    monthlyCost: 0,
    isPercentage: true,
    ratePct: 1.75,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
  {
    id: 'utilities',
    nameKey: 'inclusionUtilities',
    hintKey: 'inclusionUtilitiesHint',
    monthlyCost: 180,
    isPercentage: false,
    boothPayer: 'owner',
    commPayer: 'owner',
  },
];

export const STANDARD_PIERCING_KIT: InclusionItem[] = [
  {
    id: 'kit-needles',
    nameKey: 'Sterile Needles & Cannulas',
    hintKey: 'Pre-sterilised single-use surgical piercing needles',
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
    nameKey: 'Nitrile Gloves & Medical Barrier Film',
    hintKey: 'Sterile procedure gloves, barrier film, tray sleeves',
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
    nameKey: 'Skin Antiseptic Prep & Gauze',
    hintKey: 'Skin cleansing agents and sterile woven gauze swabs',
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
    nameKey: 'Autoclave Pouches & Spore Strips',
    hintKey: 'Class 4 & 5 chemical indicators and biological spore vials',
    monthlyCost: 45,
    costType: 'fixed',
    unitCost: 0,
    isCustom: true,
    boothPayer: 'artist',
    commPayer: 'owner',
  },
];

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

export function computeItemCosts(
  item: InclusionItem,
  monthlyRevenue: number,
  monthlyProcedures: number = 40
): { total: number; boothArtist: number; boothOwner: number; commArtist: number; commOwner: number } {
  let total = 0;
  if (item.isPercentage) {
    total = monthlyRevenue * ((item.ratePct || 0) / 100);
  } else if (item.isPerProcedure && item.costPerProcedure !== undefined) {
    total = item.costPerProcedure * monthlyProcedures;
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

    if (item.id === 'supplies' || (item.isCustom && item.id.startsWith('cust-supply'))) {
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
  inclusions: InclusionItem[]
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
      const cost = item.monthlyCost || 0;
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
  const { breakEvenMonthly, breakEvenWeekly, reachable } = computeBreakEven(deal, inclusions);

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
    labelKey: 'spreadConservative',
    descKey: 'spreadConservativeDesc',
    appointments: conservativeCompleted,
    grossRevenue: conservativeGross,
    booth: conservativeBooth,
    comm: conservativeComm,
    deltaArtist: conservativeDelta,
  };

  // 2. Expected (Baseline):
  const expectedDelta = boothDeal.artist.netIncomeMonthly - commDeal.artist.netIncomeMonthly;
  const expectedScenario: MonthSpreadScenario = {
    labelKey: 'spreadExpected',
    descKey: 'spreadExpectedDesc',
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
    labelKey: 'spreadPeak',
    descKey: 'spreadPeakDesc',
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
    warnings.push('warnRentExceedsRev');
  }
  if (deal.commissionPct >= 100) {
    warnings.push('warnComm100');
  }
  if (realisticParams.noShowRatePct > 35) {
    warnings.push('warnHighNoShow');
  }
  if (grossMonthlyRevenue > 35000) {
    warnings.push('warnHighRevenue');
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

export function computeTaxBreakdown(
  grossRevenue: number,
  allowableDeductions: number,
  settings: TaxSettings
): TaxBreakdown {
  const taxableProfit = Math.max(0, grossRevenue - allowableDeductions);
  let estimatedTax = 0;

  if (settings.regime === 'uk_sole_trader') {
    // UK Sole Trader brackets (monthly scale):
    // Personal allowance: £12,570/yr (£1,047.50/mo)
    // Basic rate (20%) + Class 4 NIC (~6%) = 26% up to £50,270/yr (£4,189.17/mo)
    // Higher rate (40%) + Class 4 NIC (2%) = 42%
    const monthlyAllowance = 12570 / 12;
    const monthlyHigher = 50270 / 12;
    if (taxableProfit > monthlyAllowance) {
      const taxable = taxableProfit - monthlyAllowance;
      const basicBand = Math.min(taxable, monthlyHigher - monthlyAllowance);
      const higherBand = Math.max(0, taxable - basicBand);
      estimatedTax = (basicBand * 0.26) + (higherBand * 0.42);
    }
  } else if (settings.regime === 'us_self_employed') {
    // US Self-Employed: SE tax (~15.3% on 92.35% = 14.1%) + federal bracket
    const monthlyExemption = 14600 / 12;
    if (taxableProfit > monthlyExemption) {
      const taxable = taxableProfit - monthlyExemption;
      estimatedTax = (taxableProfit * 0.1413) + (taxable * 0.12);
    } else {
      estimatedTax = taxableProfit * 0.1413;
    }
  } else {
    // Flat rate
    const rate = (settings.flatRatePct || 25) / 100;
    estimatedTax = taxableProfit * rate;
  }

  const takeHomeCash = Math.max(0, grossRevenue - allowableDeductions - estimatedTax);
  const effectiveTaxRatePct = taxableProfit > 0 ? (estimatedTax / taxableProfit) * 100 : 0;
  const grossTaxEstimate = grossRevenue > (12570 / 12) ? (grossRevenue - (12570 / 12)) * 0.26 : 0;
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
  { id: 'chair-1', name: 'Station 1 (Senior Piercer)', model: 'booth', weeklyRent: 275, commissionPct: 40, monthlyRevenue: 5600 },
  { id: 'chair-2', name: 'Station 2 (Body Piercer)', model: 'booth', weeklyRent: 250, commissionPct: 40, monthlyRevenue: 4800 },
  { id: 'chair-3', name: 'Station 3 (Resident Artist)', model: 'comm', weeklyRent: 250, commissionPct: 50, monthlyRevenue: 5200 },
  { id: 'chair-4', name: 'Station 4 (Junior / Apprentice)', model: 'comm', weeklyRent: 200, commissionPct: 55, monthlyRevenue: 3400 },
  { id: 'chair-5', name: 'Station 5 (Guest / Flex Chair)', model: 'booth', weeklyRent: 250, commissionPct: 40, monthlyRevenue: 3000 },
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
  lines.push('POLI INTERNATIONAL - BOOTH RENT VS COMMISSION CALCULATION EXPORT');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('--- CORE DEAL SUMMARY ---');
  lines.push('Metric,Booth Rent Model,Commission Model');
  lines.push(`Gross Monthly Revenue,${model.grossMonthlyRevenue.toFixed(2)},${model.grossMonthlyRevenue.toFixed(2)}`);
  lines.push(`Studio Fee or Rent Monthly,${model.booth.artist.rent.toFixed(2)},${model.comm.artist.commission.toFixed(2)}`);
  lines.push(`Inclusions and Supplies Total,${model.booth.artist.totalInclusions.toFixed(2)},${model.comm.artist.totalInclusions.toFixed(2)}`);
  lines.push(`Artist Net Monthly Income,${model.booth.artist.netIncomeMonthly.toFixed(2)},${model.comm.artist.netIncomeMonthly.toFixed(2)}`);
  lines.push(`Artist Net Annual Income,${model.booth.artist.netIncomeAnnual.toFixed(2)},${model.comm.artist.netIncomeAnnual.toFixed(2)}`);
  lines.push(`Artist Retained Percentage,${model.booth.artist.retainedPct.toFixed(1)}%,${model.comm.artist.retainedPct.toFixed(1)}%`);
  lines.push(`Owner Net Monthly Profit,${model.booth.owner.netIncomeMonthly.toFixed(2)},${model.comm.owner.netIncomeMonthly.toFixed(2)}`);
  lines.push(`Break-Even Monthly Crossover,${model.breakEvenMonthly ? model.breakEvenMonthly.toFixed(2) : 'N/A'},${model.breakEvenMonthly ? model.breakEvenMonthly.toFixed(2) : 'N/A'}`);
  lines.push('');

  lines.push('--- INCLUSIONS RESPONSIBILITY MATRIX ---');
  lines.push('Item,Monthly Cost or Rate,Booth Payer,Commission Payer');
  for (const inc of inclusions) {
    const costDesc = inc.isPercentage ? `${inc.ratePct}%` : `£${inc.monthlyCost.toFixed(2)}`;
    const name = inc.isCustom ? (inc.customName || inc.id) : inc.id;
    lines.push(`"${name}",${costDesc},${inc.boothPayer},${inc.commPayer}`);
  }
  lines.push('');

  if (seasonality) {
    lines.push('--- 12-MONTH SEASONALITY AND CASH FLOW ---');
    lines.push('Month,Multiplier,Weeks Off,Gross Revenue,Booth Artist Net,Commission Artist Net,Rent Owed While Away');
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    for (let i = 0; i < seasonality.months.length; i++) {
      const m = seasonality.months[i];
      lines.push(`${monthNames[i]},${m.multiplier}x,${m.weeksOff},${m.grossRevenue.toFixed(2)},${m.boothArtistNet.toFixed(2)},${m.commArtistNet.toFixed(2)},${m.rentOwedWhileAway.toFixed(2)}`);
    }
    lines.push('');
  }

  if (studioFloor) {
    lines.push('--- STUDIO FLOOR CAPACITY PLANNER ---');
    lines.push(`Shop Monthly Overhead,£${studioFloor.shopFixedMonthlyOverhead.toFixed(2)}`);
    lines.push(`Occupancy Rate,${studioFloor.occupancyRatePct.toFixed(1)}%`);
    lines.push(`Studio Total Revenue,£${studioFloor.totalStudioRevenue.toFixed(2)}`);
    lines.push(`Studio Net Profit,£${studioFloor.totalStudioNetProfit.toFixed(2)}`);
    lines.push('Station,Model,Weekly Rent,Commission %,Monthly Revenue');
    for (const c of studioFloor.chairs) {
      lines.push(`"${c.name}",${c.model},£${c.weeklyRent},${c.commissionPct}%,£${c.monthlyRevenue.toFixed(2)}`);
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
      tool: 'Booth Rent vs Commission Calculator V2',
      author: 'Poli International Pro Suite',
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
  name: string;
  createdAt: string;
  deal: DealParameters;
  realisticParams?: RealisticMonthParams;
}

export const DEFAULT_PRESETS: SavedDealPreset[] = [
  {
    id: 'preset-standard-5050',
    name: 'Standard 50/50 Commission vs £250 Booth',
    createdAt: '2026-01-01',
    deal: { weeklyRent: 250, commissionPct: 50, weeksPerYear: 48, dealStructure: 'standard' },
  },
  {
    id: 'preset-city-centre',
    name: 'Prime City Centre (£350/wk vs 60/40 Split)',
    createdAt: '2026-01-01',
    deal: { weeklyRent: 350, commissionPct: 40, weeksPerYear: 50, dealStructure: 'standard' },
  },
  {
    id: 'preset-hybrid-deal',
    name: 'Hybrid: Base £120/wk + 20% Studio Cut',
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
    name: '50% Commission with £220/wk Minimum Floor',
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


export function formatCurrency(n: number): string {
  if (isNaN(n)) return '£0.00';
  return '£' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatWholeCurrency(n: number): string {
  if (isNaN(n)) return '£0';
  return '£' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
