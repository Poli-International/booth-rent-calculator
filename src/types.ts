/**
 * Type definitions for Booth Rent vs Commission Calculator V2
 */

export type PayerType = 'artist' | 'owner' | 'split';

export type DealStructureType = 'standard' | 'hybrid' | 'floor';

export interface CommissionTier {
  threshold: number; // e.g. 3000 (applies up to this gross amount)
  pct: number; // e.g. 50%
}

export interface InclusionItem {
  id: string;
  nameKey: string;
  hintKey: string;
  monthlyCost: number; // in GBP
  isPercentage?: boolean; // e.g. for card fees
  ratePct?: number; // e.g. 1.75%
  isPerProcedure?: boolean;
  costPerProcedure?: number;
  costType?: 'fixed' | 'per_procedure';
  unitCost?: number;
  isCustom?: boolean;
  customName?: string;
  boothPayer: PayerType;
  commPayer: PayerType;
}

export interface WalkInSplitConfig {
  enabled: boolean;
  walkInPct: number; // e.g. 40% walk-in traffic
  walkInCommPct: number; // e.g. 50% shop split on walk-ins
  customCommPct: number; // e.g. 30% or custom split on artist's own bookings
}

export interface DealParameters {
  weeklyRent: number;
  commissionPct: number;
  weeksPerYear: number;
  // Hybrid & Advanced deal models
  dealStructure?: DealStructureType;
  hybridBaseWeeklyRent?: number; // e.g. £100/wk base rent
  hybridCommissionPct?: number; // e.g. 20% on top of base rent
  floorMinWeekly?: number; // e.g. minimum £200/wk to studio under commission
  // Tiered commission
  useTieredCommission?: boolean;
  tieredTiers?: CommissionTier[];
  // Walk-in vs Custom split
  walkInSplit?: WalkInSplitConfig;
}

export interface CompetingOffer {
  id: string;
  name: string;
  type: 'booth' | 'comm' | 'hybrid';
  weeklyRent: number;
  commissionPct: number;
  hybridBaseRent?: number;
  hybridCommPct?: number;
  notes?: string;
}

export interface TaxSettings {
  enabled: boolean;
  regime: 'uk_sole_trader' | 'us_self_employed' | 'flat';
  flatRatePct?: number;
}

export interface TaxBreakdown {
  grossRevenue: number;
  allowableDeductions: number;
  taxableProfit: number;
  estimatedTax: number;
  takeHomeCash: number;
  effectiveTaxRatePct: number;
  taxShieldSavings: number; // how much booth rent deduction shielded in taxes
}

export interface MonthSeasonalityItem {
  monthIndex: number;
  monthKey: string;
  multiplier: number; // e.g. 0.8 for slow Jan, 1.25 for holiday Dec
  weeksOff: number; // e.g. 1 week off
  grossRevenue: number;
  boothArtistNet: number;
  commArtistNet: number;
  rentOwedWhileAway: number;
}

export interface SeasonalitySummary {
  months: MonthSeasonalityItem[];
  annualGross: number;
  annualBoothArtistNet: number;
  annualCommArtistNet: number;
  totalWeeksOff: number;
  totalRentDuringTimeOff: number;
  recommendedReserveBuffer: number;
}

export interface StudioChair {
  id: string;
  name: string;
  model: 'booth' | 'comm' | 'vacant';
  weeklyRent: number;
  commissionPct: number;
  monthlyRevenue: number;
}

export interface StudioFloorModel {
  chairs: StudioChair[];
  shopFixedMonthlyOverhead: number; // rent, rates, insurance, front-desk
  totalGrossStationRevenue: number;
  totalStudioRevenue: number;
  totalStudioNetProfit: number;
  breakEvenChairsNeeded: number;
  occupancyRatePct: number;
  emptyChairLostMonthly: number;
}

export interface RealisticMonthParams {
  useRealisticEngine: boolean;
  directMonthlyRevenue: number;
  workingDaysPerMonth: number;
  apptsPerDay: number;
  avgTicket: number;
  noShowRatePct: number;
}

export interface FinancialSide {
  grossRevenue: number;
  rent: number;
  commission: number;
  supplies: number;
  laundry: number;
  cardFees: number;
  utilities: number;
  totalInclusions: number;
  totalDeductions: number;
  netIncomeMonthly: number;
  netIncomeAnnual: number;
  retainedPct: number;
  tax?: TaxBreakdown;
}

export interface DealSideResult {
  artist: FinancialSide;
  owner: FinancialSide;
}

export interface MonthSpreadScenario {
  labelKey: string;
  descKey: string;
  appointments: number;
  grossRevenue: number;
  booth: DealSideResult;
  comm: DealSideResult;
  deltaArtist: number; // positive = booth wins for artist
}

export interface CalculationModel {
  grossMonthlyRevenue: number;
  grossWeeklyRevenue: number;
  grossAnnualRevenue: number;
  
  // Current active deal comparison
  booth: DealSideResult;
  comm: DealSideResult;
  
  // Break-even
  breakEvenMonthly: number | null;
  breakEvenWeekly: number | null;
  breakEvenReachable: boolean;
  
  // Realistic Spread
  realistic: {
    bookedAppointments: number;
    completedAppointments: number;
    conservative: MonthSpreadScenario;
    expected: MonthSpreadScenario;
    peak: MonthSpreadScenario;
  };

  warnings: string[];
}

