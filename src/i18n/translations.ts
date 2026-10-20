/**
 * i18n Translation Engine for Booth Rent vs Commission Calculator V2
 * English reference dictionary with parameter interpolation.
 * All keys are strictly grouped into namespaces describing where they appear.
 */

import { fr } from './locales/fr';
import { de } from './locales/de';
import { it } from './locales/it';
import { es } from './locales/es';
import { nl } from './locales/nl';
import { pt } from './locales/pt';

export const translations: Record<string, string> = {
  // ── HEADER NAMESPACE (src/App.tsx) ───────────────────────────
  'header.badgeCategory': 'Studio Economics V2',
  'header.printBtn': 'Print Calculation Summary',
  'header.printBtnShort': 'Print',
  'header.themeToggleAria': 'Toggle light/dark theme',
  'header.themeLight': 'Light Mode',
  'header.themeDark': 'Dark Mode',
  'header.title': 'Booth Rent vs Commission Calculator',
  'header.subtitle': 'Calculate the objective arithmetic of booth rent against commission from both sides of the table—for independent artists and studio owners.',

  // ── NAVIGATION NAMESPACE (src/App.tsx) ───────────────────────
  'nav.overview': 'Deal Comparison',
  'nav.multi': 'Multi-Offer Matrix',
  'nav.realistic': 'Realistic Simulation',
  'nav.seasonality': 'Annual Cash Flow',
  'nav.tax': 'Tax & Take-Home',
  'nav.studio': 'Studio Floor Plan',
  'nav.inclusions': 'Consumables & Supplies',
  'nav.breakEven': 'Break-Even Curve',
  'nav.print': 'Printable Sheet',

  // ── DEAL INPUTS NAMESPACE (src/App.tsx) ──────────────────────
  'dealInputs.title': 'Deal Parameters',
  'dealInputs.subtitleNote': '(Common contract baseline)',
  'dealInputs.breakEvenLabel': 'Break-Even Monthly Revenue',
  'dealInputs.breakEvenUndefined': 'Break-even is not reachable with current 0% commission rate.',
  'dealInputs.weeklyRent': 'Booth Rent (£ / week)',
  'dealInputs.weeklyRentHint': 'Fixed rental rate charged per week',
  'dealInputs.weeklyRentCalculated': '= ~{amount} / month',
  'dealInputs.commissionPct': 'Studio Commission (%)',
  'dealInputs.commissionPctHint': 'Percentage of gross service revenue paid to studio',
  'dealInputs.commissionRetained': 'Artist retains {pct}% before expenses',
  'dealInputs.weeksPerYear': 'Working Weeks per Year',
  'dealInputs.weeksPerYearHint': 'Typical full-time standard is 48 to 50 weeks',

  // ── COMPARISON NAMESPACE (src/components/BothSidesComparison.tsx) ──
  'comparison.secTitle': 'Both Sides of the Same Deal',
  'comparison.secDesc': 'Examining the exact same client revenue stream simultaneously from the artist\'s and owner\'s perspective.',
  'comparison.artistTitle': 'Artist Perspective',
  'comparison.artistSubtitle': 'Independent Artist Take-Home',
  'comparison.ownerTitle': 'Studio Owner Perspective',
  'comparison.ownerSubtitle': 'Studio Operating Revenue & Margin',
  'comparison.boothModel': 'Booth Rent Model',
  'comparison.commModel': 'Commission Model',
  'comparison.rentPaid': 'Rent Paid:',
  'comparison.inclusions': 'Inclusions:',
  'comparison.netTakeHome': 'Net Take-Home',
  'comparison.retainedPct': '{pct}% of gross revenue',
  'comparison.commissionPaid': 'Commission:',
  'comparison.atCurrentVolume': 'At current volume:',
  'comparison.artistBoothWins': 'Booth leaves +{amount}/mo with artist',
  'comparison.artistCommWins': 'Commission leaves +{amount}/mo with artist',
  'comparison.artistEqual': 'Both models leave equal net with artist',
  'comparison.rentCollected': 'Rent Collected:',
  'comparison.overheadCovered': 'Overhead Covered:',
  'comparison.studioMargin': 'Studio Margin',
  'comparison.studioMarginPct': '{pct}% of client gross',
  'comparison.commissionRecv': 'Commission Recv:',
  'comparison.ownerBoothWins': 'Booth leaves +{amount}/mo with studio',
  'comparison.ownerCommWins': 'Commission leaves +{amount}/mo with studio',
  'comparison.ownerEqual': 'Both models leave equal margin with studio',

  // ── BREAK-EVEN NAMESPACE (src/components/BreakEvenChart.tsx) ─
  'breakEven.secTitle': 'Break-Even Analysis',
  'breakEven.secDesc': 'The monthly client revenue threshold where both models yield the exact same cost.',
  'breakEven.explanation': 'At {rev} per month ({weeklyRev} per week), both booth rent and commission produce the exact same net earnings for the artist and the owner.',
  'breakEven.undefined': 'Break-even is not reachable with current 0% commission rate.',
  'breakEven.monthlyLabel': 'Break-Even Monthly Revenue',
  'breakEven.weeklyLabel': 'Break-Even Weekly Revenue',
  'breakEven.aboveBreakEven': 'Above this revenue, Booth Rent leaves more money with the artist.',
  'breakEven.belowBreakEven': 'Below this revenue, Commission leaves more money with the artist.',
  'breakEven.ariaLabel': 'Break-even crossover chart comparing booth rent and commission net income',
  'breakEven.xAxisLabel': 'Monthly Gross Client Revenue (£)',
  'breakEven.yAxisLabel': 'Monthly Net Income (£)',
  'breakEven.calloutText': 'Break-Even: {amount}',
  'breakEven.currentMarkerText': 'Current ({amount})',
  'breakEven.legendArtistBooth': 'Artist (Booth) [◆ Solid]',
  'breakEven.legendArtistComm': 'Artist (Comm) [● Dashed]',
  'breakEven.legendOwnerBooth': 'Owner (Booth) [⋯ Dotted]',
  'breakEven.legendOwnerComm': 'Owner (Comm) [—· Dash-Dot]',

  // ── INCLUSIONS NAMESPACE (src/components/DealInclusions.tsx & src/utils/calculator.ts) ──
  'inclusions.secTitle': 'Included Operating Expenses',
  'inclusions.secDesc': 'Rent and commission figures mean nothing without knowing who pays for supplies, sterilization, card fees, and utilities.',
  'inclusions.supplies': 'Clinical Consumables & Supplies',
  'inclusions.suppliesHint': 'Gloves, needles, barriers, ink, prep solutions, skin cleansers',
  'inclusions.laundry': 'Laundry, Sterilisation & Waste',
  'inclusions.laundryHint': 'Autoclave pouches, biological indicators, sharps disposal, linen',
  'inclusions.cardFees': 'Card Processing Fees',
  'inclusions.cardFeesHint': 'Payment terminal rate (typically 1.5% - 2.0% of revenue)',
  'inclusions.utilities': 'Utilities, Licences & Facilities',
  'inclusions.utilitiesHint': 'Council licensing, power, water, high-speed Wi-Fi, cleaning',
  'inclusions.rateLabel': 'Rate:',
  'inclusions.estCostLabel': 'Est: £',
  'inclusions.approxMonthlyCost': '(~{amount}/mo)',
  'inclusions.inBoothRent': 'In Booth Rent:',
  'inclusions.inCommission': 'In Commission:',
  'inclusions.btnArtist': 'Artist',
  'inclusions.btnOwner': 'Owner',
  'inclusions.btnSplit': '50/50',
  'inclusions.payerArtist': 'Artist Pays 100%',
  'inclusions.payerOwner': 'Owner Pays 100%',
  'inclusions.payerSplit': '50 / 50 Split',
  'inclusions.monthlyCostEstimate': 'Monthly Cost (£)',

  // ── REALISTIC SPREAD NAMESPACE (src/components/RealisticMonthSpread.tsx & src/utils/calculator.ts) ──
  'realistic.secTitle': 'Realistic Month Simulation',
  'realistic.secDesc': 'Revenue is rarely a steady best-case. Factoring in booked appointments, working schedule, and client no-show rate.',
  'realistic.btnSchedule': 'Schedule Model',
  'realistic.btnDirect': 'Direct Revenue',
  'realistic.workingDays': 'Working Days per Month',
  'realistic.workingDaysHint': 'e.g. 4 days/wk × 4.33 wks = ~17 to 20 days',
  'realistic.apptsPerDay': 'Client Appointments / Day',
  'realistic.apptsPerDayHint': 'Average booked clients or piercings/tattoos per day',
  'realistic.avgTicket': 'Average Ticket Value (£)',
  'realistic.avgTicketHint': 'Average spend per client appointment',
  'realistic.noShowRate': 'No-Show & Cancellation Rate (%)',
  'realistic.noShowHint': 'Unfilled cancellations or client no-shows',
  'realistic.directRevenue': 'Direct Monthly Revenue (£)',
  'realistic.spreadConservative': 'Conservative / Slow Month',
  'realistic.spreadConservativeDesc': 'High cancellation (+10%), lower volume (-15%)',
  'realistic.spreadExpected': 'Realistic / Expected Month',
  'realistic.spreadExpectedDesc': 'Baseline scheduled days and standard no-shows',
  'realistic.spreadPeak': 'Peak / Busy Month',
  'realistic.spreadPeakDesc': 'Near-zero cancellations, maximum client demand (+20%)',
  'realistic.baselineBadge': 'Baseline',
  'realistic.estCompletedClients': 'Est. Completed Clients:',
  'realistic.apptsCount': '{count} appts',
  'realistic.grossClientRevenue': 'Gross Client Revenue:',
  'realistic.artistNetTakeHome': 'Artist Net Take-Home',
  'realistic.boothRentLabel': 'Booth Rent:',
  'realistic.commissionLabel': 'Commission:',
  'realistic.ownerNetMargin': 'Studio Owner Net Margin',
  'realistic.boothModelLabel': 'Booth Model:',
  'realistic.commissionOwnerLabel': 'Commission:',
  'realistic.modelSpread': 'Model Spread:',
  'realistic.boothDelta': 'Booth +{amount}/mo',
  'realistic.commDelta': 'Comm +{amount}/mo',
  'realistic.bookedAppts': 'Booked Appointments',
  'realistic.completedAppts': 'Completed Appointments',
  'realistic.expectedMonthlyRev': 'Expected Monthly Revenue',
  'realistic.expectedWeeklyRev': 'Expected Weekly Revenue',

  // ── PRINTABLE SHEET NAMESPACE (src/components/PrintableSummary.tsx) ──
  'print.printBtn': 'Print or Save to PDF',
  'print.pageHint': '(Optimised for 1-page standard A4 / US Letter)',
  'print.closeBtn': 'Close Summary',
  'print.suiteEyebrow': 'Poli International Studio Economics Suite',
  'print.title': 'Booth Rent vs Commission Calculation Summary',
  'print.subtitle': 'Objective mathematical projection for independent artist and studio owner review',
  'print.generatedOn': 'Calculation generated on {date}',
  'print.disclaimerHeading': 'IMPORTANT NOTICE & DISCLAIMER:',
  'print.disclaimerText': 'NOTICE & DISCLAIMER: This document is a mathematical calculation summary generated for objective review and financial projection only. It does NOT constitute a legal contract, tenancy agreement, employment arrangement, or binding business partnership. Rules governing employment classification, booth leasing, and tax obligations differ by jurisdiction. Neither Poli International nor this tool provides legal or tax advice. Parties must consult qualified professional legal and accounting counsel.',
  'print.paramWeeklyRent': 'Weekly Booth Rent',
  'print.paramCommSplit': 'Commission Split',
  'print.paramSplitToStudio': '{pct}% to Studio',
  'print.paramWorkingWeeks': 'Working Weeks',
  'print.paramWeeksPerYear': '{weeks} wks / yr',
  'print.paramBreakEvenRevenue': 'Break-Even Revenue',
  'print.notApplicable': 'N/A',
  'print.sec1Heading': '1. Side-by-Side Deal Comparison (Expected Monthly Baseline)',
  'print.thMetric': 'Financial Metric',
  'print.thBooth': 'Booth Rent Model',
  'print.thCommission': 'Commission Model',
  'print.thDifference': 'Difference (Delta)',
  'print.metricGrossMonthly': 'Gross Monthly Client Revenue',
  'print.metricArtistNetMonthly': 'Artist: Net Monthly Take-Home',
  'print.deltaBoothWins': 'Booth +{amount}',
  'print.deltaCommWins': 'Comm +{amount}',
  'print.metricArtistAnnualNet': 'Artist: Annual Projected Net',
  'print.metricOwnerNetMargin': 'Studio Owner: Net Monthly Margin',
  'print.metricOwnerAnnualMargin': 'Studio Owner: Annual Projected Margin',
  'print.sec2Heading': '2. Explicit Deal Inclusions & Cost Allocation',
  'print.thExpenseCategory': 'Expense Category',
  'print.thEstimatedCost': 'Estimated Cost',
  'print.thInBoothModel': 'In Booth Model',
  'print.thInCommissionModel': 'In Commission Model',
  'print.ratePctOfGross': '{rate}% of gross',
  'print.sec3Heading': '3. Realistic Month Volume Spread',
  'print.colConservative': 'Conservative (Slow)',
  'print.colExpected': 'Expected (Baseline)',
  'print.colPeak': 'Peak (Busy)',
  'print.rowGrossRev': 'Gross Rev:',
  'print.rowArtistBooth': 'Artist (Booth):',
  'print.rowArtistComm': 'Artist (Comm):',
  'print.rowOwnerBooth': 'Owner (Booth):',
  'print.rowOwnerComm': 'Owner (Comm):',
  'print.signStatement': 'I acknowledge that I have reviewed the mathematical calculations and deal inclusions outlined above. I understand this document is purely an arithmetic projection and not a legal contract.',
  'print.signArtistTitle': 'Independent Artist Review & Acknowledgement',
  'print.signOwnerTitle': 'Studio Owner / Representative Review & Acknowledgement',
  'print.nameLabel': 'Printed Name:',
  'print.signatureLabel': 'Signature:',
  'print.dateLabel': 'Date:',

  // ── SNAPSHOT NAMESPACE (src/App.tsx) ─────────────────────────
  'snapshot.grossRevenue': 'Gross Revenue',
  'snapshot.artistNetBooth': 'Artist Net (Booth)',
  'snapshot.artistNetComm': 'Artist Net (Comm)',
  'snapshot.generateSheetBtn': 'Generate Printable Sheet',

  // ── STANDARDS NAMESPACE (src/App.tsx) ────────────────────────
  'standards.title': 'Poli International Pro Suite & Professional Body Piercing Standards',
  'standards.toggleHide': 'Hide Clinical Matrices',
  'standards.toggleShow': 'View Clinical & Material Matrices',
  'standards.intro': 'Designed for independent artists, tattooists, body piercing studios, and Qualified Professional Piercers. When budgeting overhead and consumable matrices, verify that all studio autoclaves, needles, and body jewellery comply with Professional Body Piercing Standards.',
  'standards.matricesTitle': 'Clinical & Material Matrices (Global Benchmarks)',
  'standards.matTitaniumTitle': 'ASTM F-136 Titanium',
  'standards.matTitaniumDesc': 'Ti-6Al-4V ELI medical/implant grade. High biocompatibility, corrosion resistant, and compliant with Professional Body Piercing Standards.',
  'standards.matSteelTitle': 'ASTM F-138 Stainless Steel',
  'standards.matSteelDesc': 'Implant-grade 316LVM surgical stainless steel vacuum melted for clinical safety and low nickel leaching.',
  'standards.matGaugesTitle': 'Wire Gauge & Tolerances',
  'standards.matGaugesDesc': 'Standardised AWG/metric matrices with internal threading or threadless press-fit geometries for Qualified Professional Piercers.',

  // ── RELATED TOOLS NAMESPACE (src/components/RelatedTools.tsx) ─
  'relatedTools.title': 'Related Studio Economics Tools',
  'relatedTools.linkBenchmark': 'Studio Pricing Benchmark Tool',
  'relatedTools.linkBenchmarkDesc': 'Compare studio station rates and hourly pricing across regions.',
  'relatedTools.linkTax': 'Tax & Deduction Tracker',
  'relatedTools.linkTaxDesc': 'Calculate allowable business expenses, VAT, and self-employment tax deductions.',
  'relatedTools.linkRoi': 'Equipment ROI Calculator',
  'relatedTools.linkRoiDesc': 'Calculate payback periods and capital expenditure returns on autoclaves and laser equipment.',
  'relatedTools.openToolLink': 'Open tool →',

  // ── WARNINGS NAMESPACE (src/utils/calculator.ts) ─────────────
  'warnings.errRevenuePositive': 'Revenue must be a positive number greater than zero.',
  'warnings.warnRentExceedsRev': 'Fixed booth rent exceeds monthly client revenue in this scenario.',
  'warnings.warnComm100': 'Commission is set at 100%. Review this arrangement.',
  'warnings.warnHighNoShow': 'No-show rate is set higher than 35%. Verify appointment booking structure.',
  'warnings.warnHighRevenue': 'Revenue is exceptionally high for a single artist station. Verify figures.',

  // ── FOOTER NAMESPACE (src/App.tsx) ───────────────────────────
  'footer.credit': 'Poli International Pro Suite Tools • Booth Rent vs Commission V2 • Studio Economics Engine',

  // ── COMMON & UNITS NAMESPACE ─────────────────────────────────
  'common.perMonth': '/ month',
  'common.perWeek': '/ week',
  'common.perYear': '/ year',
  'common.monthAbbr': 'mo',
  'common.weekAbbr': 'wk',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.reset': 'Reset',
  'common.copied': 'Copied to clipboard!',
  'common.exportCsv': 'Export CSV',
  'common.exportJson': 'Export JSON',
  'common.shareLink': 'Share Deal Link',
  'common.presets': 'Saved Presets',

  // ── MULTI-DEAL COMPARISON NAMESPACE (Improvement 1) ───────────
  'multiDeal.title': 'Multi-Offer Comparison Matrix',
  'multiDeal.subtitle': 'Evaluate up to 3 competing studio contracts side by side with full deduction breakdown.',
  'multiDeal.addOffer': 'Add Competing Offer',
  'multiDeal.offerName': 'Offer Name',
  'multiDeal.offerType': 'Contract Type',
  'multiDeal.typeBooth': 'Booth Rent',
  'multiDeal.typeComm': 'Commission Split',
  'multiDeal.typeHybrid': 'Hybrid (Rent + Cut)',
  'multiDeal.rentLabel': 'Weekly Rent (£)',
  'multiDeal.commLabel': 'Commission Cut (%)',
  'multiDeal.hybridBaseRent': 'Base Weekly Rent (£)',
  'multiDeal.hybridCommPct': 'Commission Cut (%)',
  'multiDeal.thOffer': 'Contract Offer',
  'multiDeal.thGross': 'Gross Monthly',
  'multiDeal.thDeductions': 'Total Deductions',
  'multiDeal.thArtistNet': 'Artist Net Monthly',
  'multiDeal.thRetained': 'Retained %',
  'multiDeal.thOwnerNet': 'Studio Owner Margin',
  'multiDeal.thDelta': 'Diff vs Baseline',
  'multiDeal.bestForArtist': 'Top Artist Take-Home',
  'multiDeal.bestForOwner': 'Top Studio Margin',
  'multiDeal.baselineBadge': 'Baseline Offer',

  // ── TIERED COMMISSION NAMESPACE (Improvement 2) ───────────────
  'tiered.toggleTitle': 'Tiered / Sliding-Scale Commission',
  'tiered.toggleDesc': 'Apply progressive commission splits based on gross monthly revenue brackets.',
  'tiered.enableBtn': 'Enable Sliding-Scale Curves',
  'tiered.tierHeader': 'Revenue Tier Brackets',
  'tiered.tier1': 'Tier 1 (Up to £{amount})',
  'tiered.tier2': 'Tier 2 (£{from} to £{to})',
  'tiered.tier3': 'Tier 3 (Above £{from})',
  'tiered.cutPct': 'Studio Cut (%)',
  'tiered.effectiveRate': 'Blended Effective Rate: {rate}% to studio',

  // ── PRESETS & STATE SHARING NAMESPACE (Improvement 3) ─────────
  'presets.title': 'Saved Presets & Link Sharing',
  'presets.saveCurrent': 'Save Current Deal',
  'presets.presetNamePlaceholder': 'e.g. City Centre Offer, High Season Deal',
  'presets.savedListTitle': 'Saved Presets Library',
  'presets.emptyList': 'No custom presets saved yet.',
  'presets.loadBtn': 'Load',
  'presets.deleteBtn': 'Delete',
  'presets.shareSuccess': 'Direct URL link copied to clipboard! Anyone with this link can view this exact deal.',

  // ── CUSTOM LINE-ITEM SUPPLIES NAMESPACE (Improvement 4) ───────
  'customSupplies.title': 'Custom Consumables & Line-Item Builder',
  'customSupplies.subtitle': 'Add specific clinical supplies, disposables, or equipment consumables.',
  'customSupplies.addItem': 'Add Custom Line Item',
  'customSupplies.loadStandardKit': 'Load Standard Body Piercing Consumables Kit',
  'customSupplies.nameLabel': 'Item / Consumable Name',
  'customSupplies.costType': 'Cost Type',
  'customSupplies.fixedMonthly': 'Fixed Monthly (£)',
  'customSupplies.perProcedure': 'Per-Procedure Unit (£)',
  'customSupplies.monthlyCost': 'Monthly Amount (£)',
  'customSupplies.unitCost': 'Cost per Client / Procedure (£)',
  'customSupplies.boothPayer': 'Paid in Booth Rent',
  'customSupplies.commPayer': 'Paid in Commission',
  'customSupplies.totalCustomLabel': 'Custom Consumables Subtotal:',
  'customSupplies.kitLoadedToast': 'Standard clinical consumables kit loaded successfully.',

  // ── SEASONALITY & CASH FLOW NAMESPACE (Improvement 5) ─────────
  'seasonality.title': 'Annual Seasonality & Time-Off Simulator',
  'seasonality.subtitle': 'Project 52-week annual cash flow, holiday downtime, and mandatory booth rent obligations while away.',
  'seasonality.jan': 'January',
  'seasonality.feb': 'February',
  'seasonality.mar': 'March',
  'seasonality.apr': 'April',
  'seasonality.may': 'May',
  'seasonality.jun': 'June',
  'seasonality.jul': 'July',
  'seasonality.aug': 'August',
  'seasonality.sep': 'September',
  'seasonality.oct': 'October',
  'seasonality.nov': 'November',
  'seasonality.dec': 'December',
  'seasonality.annualGross': 'Projected Annual Gross Revenue',
  'seasonality.annualBoothNet': 'Annual Artist Net (Booth)',
  'seasonality.annualCommNet': 'Annual Artist Net (Commission)',
  'seasonality.totalWeeksOff': 'Planned Weeks Off per Year',
  'seasonality.rentWhileAway': 'Rent Accrued During Time Off',
  'seasonality.rentWhileAwayAlert': 'Critical Cash-Flow Fact: Under booth rent, weekly rent remains 100% payable while on holiday or sick leave. You will owe £{amount} in rent while earning £0.',
  'seasonality.recommendedBuffer': 'Recommended Emergency Cash Cushion',
  'seasonality.recommendedBufferDesc': 'Includes 2 months of fixed booth rent plus planned vacation rent and baseline consumables.',
  'seasonality.colMonth': 'Month',
  'seasonality.colMultiplier': 'Demand Index',
  'seasonality.colWeeksOff': 'Weeks Off',
  'seasonality.colGross': 'Gross Rev',
  'seasonality.colBoothNet': 'Booth Net',
  'seasonality.colCommNet': 'Comm Net',
  'seasonality.colRentAway': 'Rent While Away',

  // ── TAX & SELF-EMPLOYMENT OVERLAY NAMESPACE (Improvement 6) ───
  'tax.title': 'Tax & Self-Employment Net Take-Home Overlay',
  'tax.subtitle': 'Calculate real spendable income in your pocket after allowable deductions, Income Tax, and Self-Employment contributions.',
  'tax.enable': 'Enable Estimated Tax Overlay',
  'tax.regimeLabel': 'Tax Jurisdiction / System',
  'tax.regimeUk': 'UK Self-Employed Sole Trader (HMRC 2026/27)',
  'tax.regimeUs': 'US Independent Contractor / Self-Employed (1099)',
  'tax.regimeFlat': 'Custom Flat Income Tax Rate (%)',
  'tax.flatRatePct': 'Flat Tax Percentage (%)',
  'tax.gross': 'Gross Revenue',
  'tax.allowable': 'Allowable Business Deductions',
  'tax.allowableHint': 'Booth rent, supplies, card fees, laundry, and utility contributions are 100% tax-deductible against self-employment income.',
  'tax.taxableProfit': 'Net Taxable Business Profit',
  'tax.estTax': 'Estimated Tax & NI / SE Liability',
  'tax.takeHome': 'Actual Spendable Cash in Pocket',
  'tax.effectiveRate': 'Effective Tax Rate: {rate}%',
  'tax.shieldBenefit': 'Tax-Shielding Impact of Booth Rent: Deducting fixed booth rent lowers your taxable profit by £{amount}/year compared to commission arrangements.',

  // ── MULTI-CHAIR STUDIO CAPACITY PLANNER (Improvement 7) ───────
  'studio.title': 'Studio Floor & Capacity Planner (Owner Perspective)',
  'studio.subtitle': 'Model your entire studio station roster, fixed commercial overhead, and financial occupancy break-even.',
  'studio.addChair': 'Add Station / Chair',
  'studio.overheadTitle': 'Studio Fixed Monthly Overhead',
  'studio.overheadHint': 'Commercial lease rent, business rates, commercial insurance, receptionist/front desk salary, software licenses, waste contracts.',
  'studio.monthlyOverhead': 'Total Monthly Overhead (£)',
  'studio.stationName': 'Station Name',
  'studio.modelLabel': 'Contract Model',
  'studio.modelBooth': 'Booth Rent',
  'studio.modelComm': 'Commission Split',
  'studio.modelVacant': 'Vacant / Unfilled',
  'studio.stationGrossRev': 'Station Monthly Gross (£)',
  'studio.studioRevenueTotal': 'Studio Monthly Gross Revenue',
  'studio.studioNetProfit': 'Studio Net Monthly Profit',
  'studio.occupancyRate': 'Station Occupancy Rate: {pct}%',
  'studio.breakEvenChairs': 'Break-Even Occupancy: {count} active stations required to cover shop overhead',
  'studio.emptyChairCost': 'Cost of 1 Vacant Chair: ~£{amount}/month in lost studio contribution',

  // ── WALK-IN VS CUSTOM BOOKING REVENUE SPLIT (Improvement 8) ───
  'walkIn.title': 'Walk-In vs. Custom Client Split',
  'walkIn.subtitle': 'Differentiate shop-provided foot-traffic from artist-generated appointments.',
  'walkIn.enable': 'Enable Split Walk-in / Custom Booking Rates',
  'walkIn.pctShare': 'Walk-In Share of Total Appointments (%)',
  'walkIn.shopSplit': 'Shop Cut on Walk-In Clients (%)',
  'walkIn.customSplit': 'Shop Cut on Artist Direct Bookings (%)',
  'walkIn.blendedLabel': 'Blended Commission: {rate}% average cut',

  // ── HYBRID & FLOOR GUARANTEE ENGINE (Improvement 10) ──────────
  'hybrid.structureLabel': 'Deal Contract Architecture',
  'hybrid.standard': 'Standard Comparison (Flat Rent vs Flat Commission)',
  'hybrid.hybrid': 'Hybrid Model (Base Weekly Rent + Reduced Commission Cut)',
  'hybrid.floor': 'Minimum Guarantee (Commission with Studio Floor)',
  'hybrid.baseRent': 'Base Weekly Rent (£)',
  'hybrid.baseRentHint': 'Guaranteed weekly floor rent paid to studio',
  'hybrid.commCut': 'Reduced Commission Cut (%)',
  'hybrid.commCutHint': 'Lower commission percentage applied to client gross on top of base rent',
  'hybrid.floorMinWeekly': 'Studio Minimum Weekly Floor (£)',
  'hybrid.floorMinHint': 'Studio receives commission, or this minimum floor weekly amount, whichever is higher',
  'hybrid.floorCalculated': 'Studio is guaranteed at least £{amount}/month even during slow periods.',
};

// Aliases for backward compatibility
translations['appTitle'] = translations['header.title'];
translations['appSubtitle'] = translations['header.subtitle'];
translations['badgeCategory'] = translations['header.badgeCategory'];
translations['themeLight'] = translations['header.themeLight'];
translations['themeDark'] = translations['header.themeDark'];

translations['printBtn'] = translations['header.printBtn'];
translations['tabOverview'] = translations['nav.overview'];
translations['tabRealistic'] = translations['nav.realistic'];
translations['tabInclusions'] = translations['nav.inclusions'];
translations['tabBreakEven'] = translations['nav.breakEven'];
translations['tabPrint'] = translations['nav.print'];
translations['secBothSides'] = translations['comparison.secTitle'];
translations['secBothSidesDesc'] = translations['comparison.secDesc'];
translations['secRealistic'] = translations['realistic.secTitle'];
translations['secRealisticDesc'] = translations['realistic.secDesc'];
translations['secInclusions'] = translations['inclusions.secTitle'];
translations['secInclusionsDesc'] = translations['inclusions.secDesc'];
translations['secBreakEven'] = translations['breakEven.secTitle'];
translations['secBreakEvenDesc'] = translations['breakEven.secDesc'];
translations['dealInputsTitle'] = translations['dealInputs.title'];
translations['weeklyRent'] = translations['dealInputs.weeklyRent'];
translations['weeklyRentHint'] = translations['dealInputs.weeklyRentHint'];
translations['commissionPct'] = translations['dealInputs.commissionPct'];
translations['commissionPctHint'] = translations['dealInputs.commissionPctHint'];
translations['weeksPerYear'] = translations['dealInputs.weeksPerYear'];
translations['weeksPerYearHint'] = translations['dealInputs.weeksPerYearHint'];
translations['workingDaysPerMonth'] = translations['realistic.workingDays'];
translations['workingDaysHint'] = translations['realistic.workingDaysHint'];
translations['apptsPerDay'] = translations['realistic.apptsPerDay'];
translations['apptsPerDayHint'] = translations['realistic.apptsPerDayHint'];
translations['avgTicket'] = translations['realistic.avgTicket'];
translations['avgTicketHint'] = translations['realistic.avgTicketHint'];
translations['noShowRate'] = translations['realistic.noShowRate'];
translations['noShowHint'] = translations['realistic.noShowHint'];
translations['directMonthlyRevenue'] = translations['realistic.directRevenue'];
translations['spreadConservative'] = translations['realistic.spreadConservative'];
translations['spreadConservativeDesc'] = translations['realistic.spreadConservativeDesc'];
translations['spreadExpected'] = translations['realistic.spreadExpected'];
translations['spreadExpectedDesc'] = translations['realistic.spreadExpectedDesc'];
translations['spreadPeak'] = translations['realistic.spreadPeak'];
translations['spreadPeakDesc'] = translations['realistic.spreadPeakDesc'];
translations['artistPerspective'] = translations['comparison.artistTitle'];
translations['artistSubtitle'] = translations['comparison.artistSubtitle'];
translations['ownerPerspective'] = translations['comparison.ownerTitle'];
translations['ownerSubtitle'] = translations['comparison.ownerSubtitle'];
translations['boothModel'] = translations['comparison.boothModel'];
translations['commModel'] = translations['comparison.commModel'];
translations['inclusionSupplies'] = translations['inclusions.supplies'];
translations['inclusionSuppliesHint'] = translations['inclusions.suppliesHint'];
translations['inclusionLaundry'] = translations['inclusions.laundry'];
translations['inclusionLaundryHint'] = translations['inclusions.laundryHint'];
translations['inclusionCardFees'] = translations['inclusions.cardFees'];
translations['inclusionCardFeesHint'] = translations['inclusions.cardFeesHint'];
translations['inclusionUtilities'] = translations['inclusions.utilities'];
translations['inclusionUtilitiesHint'] = translations['inclusions.utilitiesHint'];
translations['payerArtist'] = translations['inclusions.payerArtist'];
translations['payerOwner'] = translations['inclusions.payerOwner'];
translations['payerSplit'] = translations['inclusions.payerSplit'];
translations['breakEvenMonthly'] = translations['breakEven.monthlyLabel'];
translations['breakEvenWeekly'] = translations['breakEven.weeklyLabel'];
translations['breakEvenExplanation'] = translations['breakEven.explanation'];
translations['breakEvenUndefined'] = translations['breakEven.undefined'];
translations['errRevenuePositive'] = translations['warnings.errRevenuePositive'];
translations['warnRentExceedsRev'] = translations['warnings.warnRentExceedsRev'];
translations['warnComm100'] = translations['warnings.warnComm100'];
translations['warnHighNoShow'] = translations['warnings.warnHighNoShow'];
translations['warnHighRevenue'] = translations['warnings.warnHighRevenue'];
translations['printTitle'] = translations['print.title'];
translations['printSubtitle'] = translations['print.subtitle'];
translations['printDisclaimer'] = translations['print.disclaimerText'];
translations['printGeneratedOn'] = translations['print.generatedOn'];
translations['printSignArtist'] = translations['print.signArtistTitle'];
translations['printSignOwner'] = translations['print.signOwnerTitle'];
translations['printNameLabel'] = translations['print.nameLabel'];
translations['printSignLabel'] = translations['print.signatureLabel'];
translations['printDateLabel'] = translations['print.dateLabel'];
translations['printSignStatement'] = translations['print.signStatement'];
translations['standardsTitle'] = translations['standards.title'];
translations['standardsToggleHide'] = translations['standards.toggleHide'];
translations['standardsToggleShow'] = translations['standards.toggleShow'];
translations['standardsIntro'] = translations['standards.intro'];
translations['matTitaniumTitle'] = translations['standards.matTitaniumTitle'];
translations['matTitaniumDesc'] = translations['standards.matTitaniumDesc'];
translations['matSteelTitle'] = translations['standards.matSteelTitle'];
translations['matSteelDesc'] = translations['standards.matSteelDesc'];
translations['matGaugesTitle'] = translations['standards.matGaugesTitle'];
translations['matGaugesDesc'] = translations['standards.matGaugesDesc'];
translations['relatedToolsTitle'] = translations['relatedTools.title'];
translations['linkBenchmark'] = translations['relatedTools.linkBenchmark'];
translations['linkBenchmarkDesc'] = translations['relatedTools.linkBenchmarkDesc'];
translations['linkTax'] = translations['relatedTools.linkTax'];
translations['linkTaxDesc'] = translations['relatedTools.linkTaxDesc'];
translations['linkRoi'] = translations['relatedTools.linkRoi'];
translations['linkRoiDesc'] = translations['relatedTools.linkRoiDesc'];
translations['perMonth'] = translations['common.perMonth'];
translations['perWeek'] = translations['common.perWeek'];
translations['perYear'] = translations['common.perYear'];
translations['monthAbbr'] = translations['common.monthAbbr'];
translations['weekAbbr'] = translations['common.weekAbbr'];

// Thai dictionary (th). Keys mirror the English dictionary above exactly.
export const th: Record<string, string> = {
  "header.badgeCategory": "เศรษฐศาสตร์สตูดิโอ V2",
  "header.printBtn": "พิมพ์สรุปการคำนวณ",
  "header.printBtnShort": "พิมพ์",
  "header.themeToggleAria": "สลับธีมสว่าง/มืด",
  "header.themeLight": "โหมดสว่าง",
  "header.themeDark": "โหมดมืด",
  "header.title": "เครื่องคำนวณค่าเช่าบูธเทียบกับค่าคอมมิชชัน",
  "header.subtitle": "คำนวณเปรียบเทียบค่าเช่าบูธกับค่าคอมมิชชันอย่างเป็นกลาง จากทั้งสองฝั่งของโต๊ะเจรจา สำหรับศิลปินอิสระและเจ้าของสตูดิโอ",
  "nav.overview": "การเปรียบเทียบข้อเสนอ",
  "nav.multi": "เมทริกซ์เปรียบเทียบหลายข้อเสนอ",
  "nav.realistic": "การจำลองสถานการณ์จริง",
  "nav.seasonality": "กระแสเงินสดรายปี",
  "nav.tax": "ภาษีและรายได้สุทธิ",
  "nav.studio": "ผังพื้นที่สตูดิโอ",
  "nav.inclusions": "วัสดุสิ้นเปลืองและอุปกรณ์",
  "nav.breakEven": "กราฟจุดคุ้มทุน",
  "nav.print": "แผ่นสรุปสำหรับพิมพ์",
  "dealInputs.title": "พารามิเตอร์ของข้อเสนอ",
  "dealInputs.subtitleNote": "(เกณฑ์พื้นฐานสัญญาทั่วไป)",
  "dealInputs.breakEvenLabel": "รายได้รายเดือนที่จุดคุ้มทุน",
  "dealInputs.breakEvenUndefined": "ไม่สามารถถึงจุดคุ้มทุนได้ด้วยอัตราค่าคอมมิชชัน 0% ในปัจจุบัน",
  "dealInputs.weeklyRent": "ค่าเช่าบูธ (£ / สัปดาห์)",
  "dealInputs.weeklyRentHint": "อัตราค่าเช่าคงที่ที่คิดต่อสัปดาห์",
  "dealInputs.weeklyRentCalculated": "= ~{amount} / เดือน",
  "dealInputs.commissionPct": "ค่าคอมมิชชันของสตูดิโอ (%)",
  "dealInputs.commissionPctHint": "เปอร์เซ็นต์ของรายได้รวมจากบริการที่จ่ายให้สตูดิโอ",
  "dealInputs.commissionRetained": "ศิลปินเก็บไว้ {pct}% ก่อนหักค่าใช้จ่าย",
  "dealInputs.weeksPerYear": "จำนวนสัปดาห์ทำงานต่อปี",
  "dealInputs.weeksPerYearHint": "มาตรฐานทั่วไปของงานเต็มเวลาอยู่ที่ 48 ถึง 50 สัปดาห์",
  "comparison.secTitle": "สองฝั่งของข้อเสนอเดียวกัน",
  "comparison.secDesc": "พิจารณารายได้จากลูกค้าชุดเดียวกันพร้อมกัน จากมุมมองของศิลปินและเจ้าของสตูดิโอ",
  "comparison.artistTitle": "มุมมองของศิลปิน",
  "comparison.artistSubtitle": "รายได้สุทธิของศิลปินอิสระ",
  "comparison.ownerTitle": "มุมมองของเจ้าของสตูดิโอ",
  "comparison.ownerSubtitle": "รายได้จากการดำเนินงานและอัตรากำไรของสตูดิโอ",
  "comparison.boothModel": "รูปแบบค่าเช่าบูธ",
  "comparison.commModel": "รูปแบบค่าคอมมิชชัน",
  "comparison.rentPaid": "ค่าเช่าที่จ่าย:",
  "comparison.inclusions": "สิ่งที่รวมอยู่:",
  "comparison.netTakeHome": "รายได้สุทธิ",
  "comparison.retainedPct": "{pct}% ของรายได้รวม",
  "comparison.commissionPaid": "ค่าคอมมิชชัน:",
  "comparison.atCurrentVolume": "ที่ปริมาณงานปัจจุบัน:",
  "comparison.artistBoothWins": "ค่าเช่าบูธทำให้ศิลปินเหลือ +{amount}/เดือน",
  "comparison.artistCommWins": "ค่าคอมมิชชันทำให้ศิลปินเหลือ +{amount}/เดือน",
  "comparison.artistEqual": "ทั้งสองรูปแบบทำให้ศิลปินได้รายได้สุทธิเท่ากัน",
  "comparison.rentCollected": "ค่าเช่าที่เก็บได้:",
  "comparison.overheadCovered": "ค่าใช้จ่ายส่วนกลางที่ครอบคลุม:",
  "comparison.studioMargin": "อัตรากำไรของสตูดิโอ",
  "comparison.studioMarginPct": "{pct}% ของรายได้รวมจากลูกค้า",
  "comparison.commissionRecv": "ค่าคอมมิชชันที่ได้รับ:",
  "comparison.ownerBoothWins": "ค่าเช่าบูธทำให้สตูดิโอเหลือ +{amount}/เดือน",
  "comparison.ownerCommWins": "ค่าคอมมิชชันทำให้สตูดิโอเหลือ +{amount}/เดือน",
  "comparison.ownerEqual": "ทั้งสองรูปแบบทำให้สตูดิโอได้กำไรเท่ากัน",
  "breakEven.secTitle": "การวิเคราะห์จุดคุ้มทุน",
  "breakEven.secDesc": "เกณฑ์รายได้รายเดือนจากลูกค้าที่ทำให้ทั้งสองรูปแบบมีต้นทุนเท่ากันพอดี",
  "breakEven.explanation": "ที่ {rev} ต่อเดือน ({weeklyRev} ต่อสัปดาห์) ทั้งค่าเช่าบูธและค่าคอมมิชชันให้รายได้สุทธิของศิลปินและเจ้าของสตูดิโอเท่ากันพอดี",
  "breakEven.undefined": "ไม่สามารถถึงจุดคุ้มทุนได้ด้วยอัตราค่าคอมมิชชัน 0% ในปัจจุบัน",
  "breakEven.monthlyLabel": "รายได้รายเดือนที่จุดคุ้มทุน",
  "breakEven.weeklyLabel": "รายได้รายสัปดาห์ที่จุดคุ้มทุน",
  "breakEven.aboveBreakEven": "เหนือรายได้นี้ ค่าเช่าบูธทำให้ศิลปินเหลือเงินมากกว่า",
  "breakEven.belowBreakEven": "ต่ำกว่ารายได้นี้ ค่าคอมมิชชันทำให้ศิลปินเหลือเงินมากกว่า",
  "breakEven.ariaLabel": "กราฟจุดตัดจุดคุ้มทุนเปรียบเทียบรายได้สุทธิจากค่าเช่าบูธและค่าคอมมิชชัน",
  "breakEven.xAxisLabel": "รายได้รวมจากลูกค้าต่อเดือน (£)",
  "breakEven.yAxisLabel": "รายได้สุทธิต่อเดือน (£)",
  "breakEven.calloutText": "จุดคุ้มทุน: {amount}",
  "breakEven.currentMarkerText": "ปัจจุบัน ({amount})",
  "breakEven.legendArtistBooth": "ศิลปิน (บูธ) [◆ เส้นทึบ]",
  "breakEven.legendArtistComm": "ศิลปิน (คอมมิชชัน) [● เส้นประ]",
  "breakEven.legendOwnerBooth": "เจ้าของ (บูธ) [⋯ เส้นจุด]",
  "breakEven.legendOwnerComm": "เจ้าของ (คอมมิชชัน) [—· เส้นประสลับจุด]",
  "inclusions.secTitle": "ค่าใช้จ่ายในการดำเนินงานที่รวมอยู่",
  "inclusions.secDesc": "ตัวเลขค่าเช่าและค่าคอมมิชชันไม่มีความหมาย หากไม่ทราบว่าใครเป็นผู้จ่ายค่าวัสดุ การฆ่าเชื้อ ค่าธรรมเนียมบัตร และค่าสาธารณูปโภค",
  "inclusions.supplies": "วัสดุสิ้นเปลืองและอุปกรณ์ทางคลินิก",
  "inclusions.suppliesHint": "ถุงมือ เข็ม แผ่นกั้น หมึก น้ำยาเตรียมผิว น้ำยาทำความสะอาดผิว",
  "inclusions.laundry": "การซักรีด การฆ่าเชื้อ และขยะ",
  "inclusions.laundryHint": "ซองนึ่งฆ่าเชื้อ ตัวบ่งชี้ทางชีวภาพ การทิ้งของมีคม ผ้าสะอาด",
  "inclusions.cardFees": "ค่าธรรมเนียมการรูดบัตร",
  "inclusions.cardFeesHint": "อัตราเครื่องรูดบัตร (โดยทั่วไป 1.5% - 2.0% ของรายได้)",
  "inclusions.utilities": "สาธารณูปโภค ใบอนุญาต และสิ่งอำนวยความสะดวก",
  "inclusions.utilitiesHint": "ใบอนุญาตจากเทศบาล ไฟฟ้า น้ำ Wi-Fi ความเร็วสูง การทำความสะอาด",
  "inclusions.rateLabel": "อัตรา:",
  "inclusions.estCostLabel": "ประมาณ: £",
  "inclusions.approxMonthlyCost": "(~{amount}/เดือน)",
  "inclusions.inBoothRent": "รวมอยู่ในค่าเช่าบูธ:",
  "inclusions.inCommission": "รวมอยู่ในค่าคอมมิชชัน:",
  "inclusions.btnArtist": "ศิลปิน",
  "inclusions.btnOwner": "เจ้าของ",
  "inclusions.btnSplit": "50/50",
  "inclusions.payerArtist": "ศิลปินจ่าย 100%",
  "inclusions.payerOwner": "เจ้าของจ่าย 100%",
  "inclusions.payerSplit": "แบ่ง 50 / 50",
  "inclusions.monthlyCostEstimate": "ต้นทุนรายเดือน (£)",
  "realistic.secTitle": "การจำลองเดือนตามความเป็นจริง",
  "realistic.secDesc": "รายได้แทบไม่เคยอยู่ในสถานการณ์ที่ดีที่สุดอย่างคงที่ โดยคำนึงถึงการนัดหมายที่จอง ตารางการทำงาน และอัตราลูกค้าไม่มาตามนัด",
  "realistic.btnSchedule": "รูปแบบตามตารางนัด",
  "realistic.btnDirect": "รายได้โดยตรง",
  "realistic.workingDays": "จำนวนวันทำงานต่อเดือน",
  "realistic.workingDaysHint": "เช่น 4 วัน/สัปดาห์ × 4.33 สัปดาห์ = ประมาณ 17 ถึง 20 วัน",
  "realistic.apptsPerDay": "จำนวนนัดลูกค้าต่อวัน",
  "realistic.apptsPerDayHint": "จำนวนลูกค้าหรือการเจาะ/สักที่จองโดยเฉลี่ยต่อวัน",
  "realistic.avgTicket": "มูลค่าการใช้บริการเฉลี่ยต่อครั้ง (£)",
  "realistic.avgTicketHint": "ค่าใช้จ่ายเฉลี่ยต่อนัดของลูกค้า",
  "realistic.noShowRate": "อัตราการไม่มาตามนัดและการยกเลิก (%)",
  "realistic.noShowHint": "การยกเลิกที่ไม่มีคนมาแทนหรือลูกค้าไม่มาตามนัด",
  "realistic.directRevenue": "รายได้รายเดือนโดยตรง (£)",
  "realistic.spreadConservative": "เดือนซบเซา / ระมัดระวัง",
  "realistic.spreadConservativeDesc": "การยกเลิกสูง (+10%) ปริมาณงานลดลง (-15%)",
  "realistic.spreadExpected": "เดือนปกติ / ตามที่คาดการณ์",
  "realistic.spreadExpectedDesc": "วันที่กำหนดไว้เป็นพื้นฐานและอัตราการไม่มาตามนัดมาตรฐาน",
  "realistic.spreadPeak": "เดือนที่คึกคัก / ช่วงไฮซีซั่น",
  "realistic.spreadPeakDesc": "การยกเลิกแทบไม่มี ความต้องการของลูกค้าสูงสุด (+20%)",
  "realistic.baselineBadge": "พื้นฐาน",
  "realistic.estCompletedClients": "จำนวนลูกค้าที่ให้บริการเสร็จโดยประมาณ:",
  "realistic.apptsCount": "{count} นัด",
  "realistic.grossClientRevenue": "รายได้รวมจากลูกค้า:",
  "realistic.artistNetTakeHome": "รายได้สุทธิของศิลปิน",
  "realistic.boothRentLabel": "ค่าเช่าบูธ:",
  "realistic.commissionLabel": "ค่าคอมมิชชัน:",
  "realistic.ownerNetMargin": "อัตรากำไรสุทธิของเจ้าของสตูดิโอ",
  "realistic.boothModelLabel": "รูปแบบค่าเช่าบูธ:",
  "realistic.commissionOwnerLabel": "ค่าคอมมิชชัน:",
  "realistic.modelSpread": "ส่วนต่างของรูปแบบ:",
  "realistic.boothDelta": "บูธ +{amount}/เดือน",
  "realistic.commDelta": "คอมมิชชัน +{amount}/เดือน",
  "realistic.bookedAppts": "นัดหมายที่จองแล้ว",
  "realistic.completedAppts": "นัดหมายที่ให้บริการเสร็จแล้ว",
  "realistic.expectedMonthlyRev": "รายได้รายเดือนที่คาดการณ์",
  "realistic.expectedWeeklyRev": "รายได้รายสัปดาห์ที่คาดการณ์",
  "print.printBtn": "พิมพ์หรือบันทึกเป็น PDF",
  "print.pageHint": "(ปรับให้พอดีหนึ่งหน้า A4 / US Letter มาตรฐาน)",
  "print.closeBtn": "ปิดสรุป",
  "print.suiteEyebrow": "ชุดเครื่องมือเศรษฐศาสตร์สตูดิโอ Poli International",
  "print.title": "สรุปการคำนวณค่าเช่าบูธเทียบกับค่าคอมมิชชัน",
  "print.subtitle": "การประมาณการทางคณิตศาสตร์อย่างเป็นกลางสำหรับการทบทวนของศิลปินอิสระและเจ้าของสตูดิโอ",
  "print.generatedOn": "สร้างการคำนวณเมื่อ {date}",
  "print.disclaimerHeading": "ประกาศและข้อจำกัดความรับผิดชอบที่สำคัญ:",
  "print.disclaimerText": "ประกาศและข้อจำกัดความรับผิดชอบ: เอกสารนี้เป็นสรุปการคำนวณทางคณิตศาสตร์ที่จัดทำขึ้นเพื่อการทบทวนอย่างเป็นกลางและการประมาณการทางการเงินเท่านั้น เอกสารนี้ไม่ถือเป็นสัญญาทางกฎหมาย สัญญาเช่า ข้อตกลงการจ้างงาน หรือความร่วมมือทางธุรกิจที่มีผลผูกพัน กฎเกณฑ์เกี่ยวกับการจัดประเภทการจ้างงาน การเช่าบูธ และภาระภาษีแตกต่างกันตามเขตอำนาจศาล ทั้ง Poli International และเครื่องมือนี้ไม่ได้ให้คำแนะนำทางกฎหมายหรือทางภาษี คู่สัญญาควรปรึกษาที่ปรึกษากฎหมายและนักบัญชีที่มีคุณสมบัติเหมาะสมเสมอ",
  "print.paramWeeklyRent": "ค่าเช่าบูธรายสัปดาห์",
  "print.paramCommSplit": "การแบ่งค่าคอมมิชชัน",
  "print.paramSplitToStudio": "{pct}% ให้สตูดิโอ",
  "print.paramWorkingWeeks": "สัปดาห์ทำงาน",
  "print.paramWeeksPerYear": "{weeks} สัปดาห์ / ปี",
  "print.paramBreakEvenRevenue": "รายได้ที่จุดคุ้มทุน",
  "print.notApplicable": "ไม่มีข้อมูล",
  "print.sec1Heading": "1. เปรียบเทียบข้อเสนอแบบเคียงข้าง (พื้นฐานรายเดือนที่คาดการณ์)",
  "print.thMetric": "ตัวชี้วัดทางการเงิน",
  "print.thBooth": "รูปแบบค่าเช่าบูธ",
  "print.thCommission": "รูปแบบค่าคอมมิชชัน",
  "print.thDifference": "ส่วนต่าง (Delta)",
  "print.metricGrossMonthly": "รายได้รวมจากลูกค้ารายเดือน",
  "print.metricArtistNetMonthly": "ศิลปิน: รายได้สุทธิรายเดือน",
  "print.deltaBoothWins": "บูธ +{amount}",
  "print.deltaCommWins": "คอมมิชชัน +{amount}",
  "print.metricArtistAnnualNet": "ศิลปิน: รายได้สุทธิประมาณการรายปี",
  "print.metricOwnerNetMargin": "เจ้าของสตูดิโอ: อัตรากำไรสุทธิรายเดือน",
  "print.metricOwnerAnnualMargin": "เจ้าของสตูดิโอ: อัตรากำไรประมาณการรายปี",
  "print.sec2Heading": "2. รายการที่รวมอยู่ในข้อเสนอและการจัดสรรต้นทุน",
  "print.thExpenseCategory": "หมวดค่าใช้จ่าย",
  "print.thEstimatedCost": "ต้นทุนโดยประมาณ",
  "print.thInBoothModel": "ในรูปแบบค่าเช่าบูธ",
  "print.thInCommissionModel": "ในรูปแบบค่าคอมมิชชัน",
  "print.ratePctOfGross": "{rate}% ของรายได้รวม",
  "print.sec3Heading": "3. การกระจายปริมาณงานในเดือนตามความเป็นจริง",
  "print.colConservative": "ระมัดระวัง (ซบเซา)",
  "print.colExpected": "ตามที่คาดการณ์ (พื้นฐาน)",
  "print.colPeak": "สูงสุด (คึกคัก)",
  "print.rowGrossRev": "รายได้รวม:",
  "print.rowArtistBooth": "ศิลปิน (บูธ):",
  "print.rowArtistComm": "ศิลปิน (คอมมิชชัน):",
  "print.rowOwnerBooth": "เจ้าของ (บูธ):",
  "print.rowOwnerComm": "เจ้าของ (คอมมิชชัน):",
  "print.signStatement": "ข้าพเจ้ารับทราบว่าได้ตรวจสอบการคำนวณทางคณิตศาสตร์และรายการที่รวมอยู่ในข้อเสนอตามที่ระบุไว้ข้างต้นแล้ว ข้าพเจ้าเข้าใจว่าเอกสารนี้เป็นเพียงการประมาณการทางคณิตศาสตร์เท่านั้น ไม่ใช่สัญญาทางกฎหมาย",
  "print.signArtistTitle": "การทบทวนและรับทราบของศิลปินอิสระ",
  "print.signOwnerTitle": "การทบทวนและรับทราบของเจ้าของสตูดิโอ / ตัวแทน",
  "print.nameLabel": "ชื่อที่พิมพ์:",
  "print.signatureLabel": "ลายเซ็น:",
  "print.dateLabel": "วันที่:",
  "snapshot.grossRevenue": "รายได้รวม",
  "snapshot.artistNetBooth": "รายได้สุทธิศิลปิน (บูธ)",
  "snapshot.artistNetComm": "รายได้สุทธิศิลปิน (คอมมิชชัน)",
  "snapshot.generateSheetBtn": "สร้างแผ่นสรุปสำหรับพิมพ์",
  "standards.title": "Poli International Pro Suite และมาตรฐานการเจาะร่างกายระดับมืออาชีพ",
  "standards.toggleHide": "ซ่อนตารางข้อมูลทางคลินิก",
  "standards.toggleShow": "ดูตารางข้อมูลทางคลินิกและวัสดุ",
  "standards.intro": "จัดทำขึ้นสำหรับศิลปินอิสระ ช่างสัก สตูดิโอเจาะร่างกาย และช่างเจาะมืออาชีพที่มีคุณสมบัติ เมื่อจัดทำงบประมาณค่าใช้จ่ายส่วนกลางและตารางวัสดุสิ้นเปลือง โปรดตรวจสอบว่าเครื่องนึ่งฆ่าเชื้อ เข็ม และเครื่องประดับร่างกายทั้งหมดของสตูดิโอเป็นไปตามมาตรฐานการเจาะร่างกายระดับมืออาชีพ",
  "standards.matricesTitle": "ตารางข้อมูลทางคลินิกและวัสดุ (เกณฑ์มาตรฐานสากล)",
  "standards.matTitaniumTitle": "ไทเทเนียม ASTM F-136",
  "standards.matTitaniumDesc": "Ti-6Al-4V ELI เกรดการแพทย์/ฝังในร่างกาย มีความเข้ากันได้ทางชีวภาพสูง ต้านทานการกัดกร่อน และเป็นไปตามมาตรฐานการเจาะร่างกายระดับมืออาชีพ",
  "standards.matSteelTitle": "สแตนเลส ASTM F-138",
  "standards.matSteelDesc": "สแตนเลสเกรดศัลยกรรม 316LVM สำหรับฝังในร่างกาย หลอมด้วยสุญญากาศเพื่อความปลอดภัยทางคลินิกและการปลดปล่อยนิกเกิลต่ำ",
  "standards.matGaugesTitle": "เกจลวดและค่าความคลาดเคลื่อน",
  "standards.matGaugesDesc": "ตารางมาตรฐาน AWG/เมตริก พร้อมเกลียวภายในหรือรูปทรงแบบประกอบโดยไม่มีเกลียวสำหรับช่างเจาะมืออาชีพที่มีคุณสมบัติ",
  "relatedTools.title": "เครื่องมือเศรษฐศาสตร์สตูดิโอที่เกี่ยวข้อง",
  "relatedTools.linkBenchmark": "Studio Pricing Benchmark Tool",
  "relatedTools.linkBenchmarkDesc": "เปรียบเทียบอัตราค่าบริการและราคาต่อชั่วโมงของสตูดิโอในแต่ละภูมิภาค",
  "relatedTools.linkTax": "Tax & Deduction Tracker",
  "relatedTools.linkTaxDesc": "คำนวณค่าใช้จ่ายทางธุรกิจที่หักได้ ภาษีมูลค่าเพิ่ม และค่าลดหย่อนภาษีสำหรับผู้ประกอบอาชีพอิสระ",
  "relatedTools.linkRoi": "Equipment ROI Calculator",
  "relatedTools.linkRoiDesc": "คำนวณระยะเวลาคืนทุนและผลตอบแทนจากการลงทุนในเครื่องนึ่งฆ่าเชื้อและอุปกรณ์เลเซอร์",
  "relatedTools.openToolLink": "เปิดเครื่องมือ →",
  "warnings.errRevenuePositive": "รายได้ต้องเป็นตัวเลขบวกที่มากกว่าศูนย์",
  "warnings.warnRentExceedsRev": "ค่าเช่าบูธคงที่สูงกว่ารายได้รายเดือนจากลูกค้าในสถานการณ์นี้",
  "warnings.warnComm100": "ค่าคอมมิชชันตั้งไว้ที่ 100% โปรดทบทวนข้อตกลงนี้",
  "warnings.warnHighNoShow": "อัตราการไม่มาตามนัดตั้งไว้สูงกว่า 35% โปรดตรวจสอบโครงสร้างการจองนัดหมาย",
  "warnings.warnHighRevenue": "รายได้สูงมากสำหรับพื้นที่ทำงานของศิลปินหนึ่งคน โปรดตรวจสอบตัวเลข",
  "footer.credit": "เครื่องมือ Poli International Pro Suite • ค่าเช่าบูธเทียบกับค่าคอมมิชชัน V2 • เอนจินเศรษฐศาสตร์สตูดิโอ",
  "common.perMonth": "/ เดือน",
  "common.perWeek": "/ สัปดาห์",
  "common.perYear": "/ ปี",
  "common.monthAbbr": "ด.",
  "common.weekAbbr": "สป.",
  "common.save": "บันทึก",
  "common.cancel": "ยกเลิก",
  "common.delete": "ลบ",
  "common.reset": "รีเซ็ต",
  "common.copied": "คัดลอกไปยังคลิปบอร์ดแล้ว!",
  "common.exportCsv": "ส่งออก CSV",
  "common.exportJson": "ส่งออก JSON",
  "common.shareLink": "แชร์ลิงก์ดีล",
  "common.presets": "การตั้งค่าที่บันทึกไว้",
  "multiDeal.title": "เมทริกซ์การเปรียบเทียบหลายข้อเสนอ",
  "multiDeal.subtitle": "ประเมินสัญญาของสตูดิโอที่แข่งขันกันได้สูงสุด 3 ฉบับเคียงข้างกัน พร้อมรายละเอียดการหักค่าใช้จ่ายทั้งหมด",
  "multiDeal.addOffer": "เพิ่มข้อเสนอที่แข่งขัน",
  "multiDeal.offerName": "ชื่อข้อเสนอ",
  "multiDeal.offerType": "ประเภทสัญญา",
  "multiDeal.typeBooth": "ค่าเช่าบูธ",
  "multiDeal.typeComm": "การแบ่งค่าคอมมิชชัน",
  "multiDeal.typeHybrid": "แบบผสม (ค่าเช่า + ค่าคอมมิชชันลด)",
  "multiDeal.rentLabel": "ค่าเช่ารายสัปดาห์ (£)",
  "multiDeal.commLabel": "ส่วนแบ่งค่าคอมมิชชัน (%)",
  "multiDeal.hybridBaseRent": "ค่าเช่ารายสัปดาห์พื้นฐาน (£)",
  "multiDeal.hybridCommPct": "ส่วนแบ่งค่าคอมมิชชัน (%)",
  "multiDeal.thOffer": "ข้อเสนอสัญญา",
  "multiDeal.thGross": "รายได้รวมรายเดือน",
  "multiDeal.thDeductions": "ค่าหักทั้งหมด",
  "multiDeal.thArtistNet": "รายได้สุทธิศิลปินรายเดือน",
  "multiDeal.thRetained": "อัตราที่เก็บไว้ %",
  "multiDeal.thOwnerNet": "อัตรากำไรของเจ้าของสตูดิโอ",
  "multiDeal.thDelta": "ส่วนต่างเทียบกับพื้นฐาน",
  "multiDeal.bestForArtist": "รายได้สุทธิศิลปินสูงสุด",
  "multiDeal.bestForOwner": "อัตรากำไรสตูดิโอสูงสุด",
  "multiDeal.baselineBadge": "ข้อเสนอพื้นฐาน",
  "tiered.toggleTitle": "ค่าคอมมิชชันแบบขั้นบันได / เลื่อนระดับ",
  "tiered.toggleDesc": "ใช้การแบ่งค่าคอมมิชชันแบบก้าวหน้าตามช่วงรายได้รวมรายเดือน",
  "tiered.enableBtn": "เปิดใช้กราฟค่าคอมมิชชันแบบเลื่อนระดับ",
  "tiered.tierHeader": "ช่วงระดับรายได้",
  "tiered.tier1": "ระดับ 1 (ไม่เกิน £{amount})",
  "tiered.tier2": "ระดับ 2 (£{from} ถึง £{to})",
  "tiered.tier3": "ระดับ 3 (มากกว่า £{from})",
  "tiered.cutPct": "ส่วนแบ่งของสตูดิโอ (%)",
  "tiered.effectiveRate": "อัตราผสมที่มีผลจริง: {rate}% ให้สตูดิโอ",
  "presets.title": "การตั้งค่าที่บันทึกไว้และการแชร์ลิงก์",
  "presets.saveCurrent": "บันทึกข้อเสนอปัจจุบัน",
  "presets.presetNamePlaceholder": "เช่น ข้อเสนอใจกลางเมือง, ข้อเสนอช่วงไฮซีซั่น",
  "presets.savedListTitle": "คลังการตั้งค่าที่บันทึกไว้",
  "presets.emptyList": "ยังไม่มีการตั้งค่าที่กำหนดเองที่บันทึกไว้",
  "presets.loadBtn": "โหลด",
  "presets.deleteBtn": "ลบ",
  "presets.shareSuccess": "คัดลอกลิงก์ URL โดยตรงไปยังคลิปบอร์ดแล้ว ผู้ที่มีลิงก์นี้สามารถดูข้อเสนอนี้ได้ทุกประการ",
  "customSupplies.title": "เครื่องมือสร้างรายการวัสดุสิ้นเปลืองแบบกำหนดเอง",
  "customSupplies.subtitle": "เพิ่มวัสดุทางคลินิก ของใช้แล้วทิ้ง หรือวัสดุสิ้นเปลืองของอุปกรณ์ที่ต้องการ",
  "customSupplies.addItem": "เพิ่มรายการที่กำหนดเอง",
  "customSupplies.loadStandardKit": "โหลดชุดวัสดุสิ้นเปลืองมาตรฐานสำหรับการเจาะร่างกาย",
  "customSupplies.nameLabel": "ชื่อรายการ / วัสดุสิ้นเปลือง",
  "customSupplies.costType": "ประเภทต้นทุน",
  "customSupplies.fixedMonthly": "รายเดือนคงที่ (£)",
  "customSupplies.perProcedure": "ต่อหน่วยการให้บริการ (£)",
  "customSupplies.monthlyCost": "จำนวนรายเดือน (£)",
  "customSupplies.unitCost": "ต้นทุนต่อลูกค้า / ต่อหัตถการ (£)",
  "customSupplies.boothPayer": "จ่ายรวมในค่าเช่าบูธ",
  "customSupplies.commPayer": "จ่ายรวมในค่าคอมมิชชัน",
  "customSupplies.totalCustomLabel": "ยอดรวมย่อยของวัสดุสิ้นเปลืองที่กำหนดเอง:",
  "customSupplies.kitLoadedToast": "โหลดชุดวัสดุสิ้นเปลืองทางคลินิกมาตรฐานสำเร็จแล้ว",
  "seasonality.title": "เครื่องจำลองฤดูกาลประจำปีและการหยุดงาน",
  "seasonality.subtitle": "ประมาณการกระแสเงินสดรายปี 52 สัปดาห์ ช่วงหยุดพักระหว่างวันหยุด และภาระค่าเช่าบูธที่ต้องจ่ายแม้ไม่ได้อยู่ที่บูธ",
  "seasonality.jan": "มกราคม",
  "seasonality.feb": "กุมภาพันธ์",
  "seasonality.mar": "มีนาคม",
  "seasonality.apr": "เมษายน",
  "seasonality.may": "พฤษภาคม",
  "seasonality.jun": "มิถุนายน",
  "seasonality.jul": "กรกฎาคม",
  "seasonality.aug": "สิงหาคม",
  "seasonality.sep": "กันยายน",
  "seasonality.oct": "ตุลาคม",
  "seasonality.nov": "พฤศจิกายน",
  "seasonality.dec": "ธันวาคม",
  "seasonality.annualGross": "รายได้รวมรายปีที่ประมาณการ",
  "seasonality.annualBoothNet": "รายได้สุทธิศิลปินรายปี (บูธ)",
  "seasonality.annualCommNet": "รายได้สุทธิศิลปินรายปี (คอมมิชชัน)",
  "seasonality.totalWeeksOff": "จำนวนสัปดาห์หยุดที่วางแผนต่อปี",
  "seasonality.rentWhileAway": "ค่าเช่าที่สะสมระหว่างช่วงหยุดงาน",
  "seasonality.rentWhileAwayAlert": "ข้อเท็จจริงสำคัญด้านกระแสเงินสด: ภายใต้ค่าเช่าบูธ ค่าเช่ารายสัปดาห์ยังคงต้องชำระเต็มจำนวน 100% แม้อยู่ในช่วงลาพักร้อนหรือลาป่วย คุณจะต้องชำระค่าเช่า £{amount} ขณะที่มีรายได้ £0",
  "seasonality.recommendedBuffer": "เงินสำรองฉุกเฉินที่แนะนำ",
  "seasonality.recommendedBufferDesc": "รวมค่าเช่าบูธคงที่ 2 เดือน บวกค่าเช่าช่วงพักร้อนที่วางแผนไว้ และวัสดุสิ้นเปลืองพื้นฐาน",
  "seasonality.colMonth": "เดือน",
  "seasonality.colMultiplier": "ดัชนีความต้องการ",
  "seasonality.colWeeksOff": "สัปดาห์หยุด",
  "seasonality.colGross": "รายได้รวม",
  "seasonality.colBoothNet": "สุทธิ (บูธ)",
  "seasonality.colCommNet": "สุทธิ (คอมมิชชัน)",
  "seasonality.colRentAway": "ค่าเช่าระหว่างหยุด",
  "tax.title": "การซ้อนทับรายได้สุทธิหลังภาษีและการประกอบอาชีพอิสระ",
  "tax.subtitle": "คำนวณรายได้ที่ใช้จ่ายได้จริงในมือคุณหลังหักค่าใช้จ่ายที่อนุญาต ภาษีเงินได้ และเงินสมทบจากการประกอบอาชีพอิสระ",
  "tax.enable": "เปิดการซ้อนทับภาษีโดยประมาณ",
  "tax.regimeLabel": "เขตอำนาจภาษี / ระบบ",
  "tax.regimeUk": "ผู้ประกอบอาชีพอิสระในสหราชอาณาจักร (HMRC 2026/27)",
  "tax.regimeUs": "ผู้รับเหมาอิสระ / ผู้ประกอบอาชีพอิสระในสหรัฐอเมริกา (1099)",
  "tax.regimeFlat": "อัตราภาษีเงินได้แบบคงที่ที่กำหนดเอง (%)",
  "tax.flatRatePct": "เปอร์เซ็นต์ภาษีแบบคงที่ (%)",
  "tax.gross": "รายได้รวม",
  "tax.allowable": "ค่าใช้จ่ายทางธุรกิจที่หักได้",
  "tax.allowableHint": "ค่าเช่าบูธ วัสดุ ค่าธรรมเนียมบัตร ค่าซักรีด และส่วนร่วมค่าสาธารณูปโภค สามารถหักภาษีได้ 100% จากรายได้จากการประกอบอาชีพอิสระ",
  "tax.taxableProfit": "กำไรทางธุรกิจสุทธิที่ต้องเสียภาษี",
  "tax.estTax": "ภาระภาษีและเงินประกันสังคมโดยประมาณ (NI / SE)",
  "tax.takeHome": "เงินสดที่ใช้จ่ายได้จริงในมือ",
  "tax.effectiveRate": "อัตราภาษีที่มีผลจริง: {rate}%",
  "tax.shieldBenefit": "ผลการลดหย่อนภาษีของค่าเช่าบูธ: การหักค่าเช่าบูธคงที่ทำให้กำไรที่ต้องเสียภาษีของคุณลดลง £{amount}/ปี เมื่อเทียบกับการจ่ายค่าคอมมิชชัน",
  "studio.title": "เครื่องมือวางแผนพื้นที่และความจุของสตูดิโอ (มุมมองเจ้าของ)",
  "studio.subtitle": "จำลองรายชื่อสถานีทำงานทั้งหมดของสตูดิโอ ค่าใช้จ่ายส่วนกลางทางการค้าคงที่ และจุดคุ้มทุนของการใช้พื้นที่ทางการเงิน",
  "studio.addChair": "เพิ่มสถานี / เก้าอี้",
  "studio.overheadTitle": "ค่าใช้จ่ายส่วนกลางคงที่รายเดือนของสตูดิโอ",
  "studio.overheadHint": "ค่าเช่าสถานที่เชิงพาณิชย์ ภาษีโรงเรือนและที่ดิน ประกันเชิงพาณิชย์ เงินเดือนพนักงานต้อนรับ ใบอนุญาตซอฟต์แวร์ สัญญาการจัดการขยะ",
  "studio.monthlyOverhead": "ค่าใช้จ่ายส่วนกลางรวมรายเดือน (£)",
  "studio.stationName": "ชื่อสถานี",
  "studio.modelLabel": "รูปแบบสัญญา",
  "studio.modelBooth": "ค่าเช่าบูธ",
  "studio.modelComm": "การแบ่งค่าคอมมิชชัน",
  "studio.modelVacant": "ว่าง / ยังไม่มีผู้ใช้",
  "studio.stationGrossRev": "รายได้รวมรายเดือนของสถานี (£)",
  "studio.studioRevenueTotal": "รายได้รวมรายเดือนของสตูดิโอ",
  "studio.studioNetProfit": "กำไรสุทธิรายเดือนของสตูดิโอ",
  "studio.occupancyRate": "อัตราการใช้งานสถานี: {pct}%",
  "studio.breakEvenChairs": "จุดคุ้มทุนการใช้งาน: ต้องมีสถานีที่ใช้งานอยู่ {count} สถานี เพื่อครอบคลุมค่าใช้จ่ายส่วนกลางของร้าน",
  "studio.emptyChairCost": "ต้นทุนของเก้าอี้ว่าง 1 ตัว: ประมาณ £{amount}/เดือน ในรูปของรายได้ของสตูดิโอที่สูญเสียไป",
  "walkIn.title": "ลูกค้าเดินเข้ามา vs ลูกค้าของศิลปินเอง",
  "walkIn.subtitle": "แยกลูกค้าที่เดินเข้ามาที่ร้านออกจากนัดหมายที่ศิลปินหาเอง",
  "walkIn.enable": "เปิดใช้อัตราแยกสำหรับลูกค้าเดินเข้า / การจองของศิลปินเอง",
  "walkIn.pctShare": "สัดส่วนลูกค้าเดินเข้ามาจากนัดหมายทั้งหมด (%)",
  "walkIn.shopSplit": "ส่วนแบ่งของร้านจากลูกค้าเดินเข้ามา (%)",
  "walkIn.customSplit": "ส่วนแบ่งของร้านจากการจองโดยตรงของศิลปิน (%)",
  "walkIn.blendedLabel": "ค่าคอมมิชชันผสม: ส่วนแบ่งเฉลี่ย {rate}%",
  "hybrid.structureLabel": "โครงสร้างสัญญาข้อเสนอ",
  "hybrid.standard": "การเปรียบเทียบมาตรฐาน (ค่าเช่าคงที่เทียบกับค่าคอมมิชชันคงที่)",
  "hybrid.hybrid": "โมเดลผสม (ค่าเช่ารายสัปดาห์พื้นฐาน + ค่าคอมมิชชันลดลง)",
  "hybrid.floor": "ค่าคอมมิชชันพร้อมขั้นต่ำที่สตูดิโอรับประกัน",
  "hybrid.baseRent": "ค่าเช่ารายสัปดาห์พื้นฐาน (£)",
  "hybrid.baseRentHint": "ค่าเช่ารายสัปดาห์ขั้นต่ำที่รับประกันจ่ายให้สตูดิโอ",
  "hybrid.commCut": "ส่วนแบ่งค่าคอมมิชชันที่ลดลง (%)",
  "hybrid.commCutHint": "เปอร์เซ็นต์ค่าคอมมิชชันที่ต่ำลง คิดจากรายได้รวมของลูกค้า นอกเหนือจากค่าเช่าพื้นฐาน",
  "hybrid.floorMinWeekly": "ขั้นต่ำรายสัปดาห์ที่สตูดิโอรับประกัน (£)",
  "hybrid.floorMinHint": "สตูดิโอได้รับค่าคอมมิชชัน หรือยอดขั้นต่ำรายสัปดาห์นี้ แล้วแต่จำนวนใดจะสูงกว่า",
  "hybrid.floorCalculated": "สตูดิโอได้รับการรับประกันอย่างน้อย £{amount}/เดือน แม้ในช่วงซบเซา",
  "appTitle": "เครื่องคำนวณค่าเช่าบูธเทียบกับค่าคอมมิชชัน",
  "appSubtitle": "คำนวณเปรียบเทียบค่าเช่าบูธกับค่าคอมมิชชันอย่างเป็นกลาง จากทั้งสองฝั่งของโต๊ะเจรจา สำหรับศิลปินอิสระและเจ้าของสตูดิโอ",
  "badgeCategory": "เศรษฐศาสตร์สตูดิโอ V2",
  "themeLight": "โหมดสว่าง",
  "themeDark": "โหมดมืด",
  "printBtn": "พิมพ์สรุปการคำนวณ",
  "tabOverview": "การเปรียบเทียบข้อเสนอ",
  "tabRealistic": "การจำลองสถานการณ์จริง",
  "tabInclusions": "วัสดุสิ้นเปลืองและอุปกรณ์",
  "tabBreakEven": "กราฟจุดคุ้มทุน",
  "tabPrint": "แผ่นสรุปสำหรับพิมพ์",
  "secBothSides": "สองฝั่งของข้อเสนอเดียวกัน",
  "secBothSidesDesc": "พิจารณารายได้จากลูกค้าชุดเดียวกันพร้อมกัน จากมุมมองของศิลปินและเจ้าของสตูดิโอ",
  "secRealistic": "การจำลองเดือนตามความเป็นจริง",
  "secRealisticDesc": "รายได้แทบไม่เคยอยู่ในสถานการณ์ที่ดีที่สุดอย่างคงที่ โดยคำนึงถึงการนัดหมายที่จอง ตารางการทำงาน และอัตราลูกค้าไม่มาตามนัด",
  "secInclusions": "ค่าใช้จ่ายในการดำเนินงานที่รวมอยู่",
  "secInclusionsDesc": "ตัวเลขค่าเช่าและค่าคอมมิชชันไม่มีความหมาย หากไม่ทราบว่าใครเป็นผู้จ่ายค่าวัสดุ การฆ่าเชื้อ ค่าธรรมเนียมบัตร และค่าสาธารณูปโภค",
  "secBreakEven": "การวิเคราะห์จุดคุ้มทุน",
  "secBreakEvenDesc": "เกณฑ์รายได้รายเดือนจากลูกค้าที่ทำให้ทั้งสองรูปแบบมีต้นทุนเท่ากันพอดี",
  "dealInputsTitle": "พารามิเตอร์ของข้อเสนอ",
  "weeklyRent": "ค่าเช่าบูธ (£ / สัปดาห์)",
  "weeklyRentHint": "อัตราค่าเช่าคงที่ที่คิดต่อสัปดาห์",
  "commissionPct": "ค่าคอมมิชชันของสตูดิโอ (%)",
  "commissionPctHint": "เปอร์เซ็นต์ของรายได้รวมจากบริการที่จ่ายให้สตูดิโอ",
  "weeksPerYear": "จำนวนสัปดาห์ทำงานต่อปี",
  "weeksPerYearHint": "มาตรฐานทั่วไปของงานเต็มเวลาอยู่ที่ 48 ถึง 50 สัปดาห์",
  "workingDaysPerMonth": "จำนวนวันทำงานต่อเดือน",
  "workingDaysHint": "เช่น 4 วัน/สัปดาห์ × 4.33 สัปดาห์ = ประมาณ 17 ถึง 20 วัน",
  "apptsPerDay": "จำนวนนัดลูกค้าต่อวัน",
  "apptsPerDayHint": "จำนวนลูกค้าหรือการเจาะ/สักที่จองโดยเฉลี่ยต่อวัน",
  "avgTicket": "มูลค่าการใช้บริการเฉลี่ยต่อครั้ง (£)",
  "avgTicketHint": "ค่าใช้จ่ายเฉลี่ยต่อนัดของลูกค้า",
  "noShowRate": "อัตราการไม่มาตามนัดและการยกเลิก (%)",
  "noShowHint": "การยกเลิกที่ไม่มีคนมาแทนหรือลูกค้าไม่มาตามนัด",
  "directMonthlyRevenue": "รายได้รายเดือนโดยตรง (£)",
  "spreadConservative": "เดือนซบเซา / ระมัดระวัง",
  "spreadConservativeDesc": "การยกเลิกสูง (+10%) ปริมาณงานลดลง (-15%)",
  "spreadExpected": "เดือนปกติ / ตามที่คาดการณ์",
  "spreadExpectedDesc": "วันที่กำหนดไว้เป็นพื้นฐานและอัตราการไม่มาตามนัดมาตรฐาน",
  "spreadPeak": "เดือนที่คึกคัก / ช่วงไฮซีซั่น",
  "spreadPeakDesc": "การยกเลิกแทบไม่มี ความต้องการของลูกค้าสูงสุด (+20%)",
  "artistPerspective": "มุมมองของศิลปิน",
  "artistSubtitle": "รายได้สุทธิของศิลปินอิสระ",
  "ownerPerspective": "มุมมองของเจ้าของสตูดิโอ",
  "ownerSubtitle": "รายได้จากการดำเนินงานและอัตรากำไรของสตูดิโอ",
  "boothModel": "รูปแบบค่าเช่าบูธ",
  "commModel": "รูปแบบค่าคอมมิชชัน",
  "inclusionSupplies": "วัสดุสิ้นเปลืองและอุปกรณ์ทางคลินิก",
  "inclusionSuppliesHint": "ถุงมือ เข็ม แผ่นกั้น หมึก น้ำยาเตรียมผิว น้ำยาทำความสะอาดผิว",
  "inclusionLaundry": "การซักรีด การฆ่าเชื้อ และขยะ",
  "inclusionLaundryHint": "ซองนึ่งฆ่าเชื้อ ตัวบ่งชี้ทางชีวภาพ การทิ้งของมีคม ผ้าสะอาด",
  "inclusionCardFees": "ค่าธรรมเนียมการรูดบัตร",
  "inclusionCardFeesHint": "อัตราเครื่องรูดบัตร (โดยทั่วไป 1.5% - 2.0% ของรายได้)",
  "inclusionUtilities": "สาธารณูปโภค ใบอนุญาต และสิ่งอำนวยความสะดวก",
  "inclusionUtilitiesHint": "ใบอนุญาตจากเทศบาล ไฟฟ้า น้ำ Wi-Fi ความเร็วสูง การทำความสะอาด",
  "payerArtist": "ศิลปินจ่าย 100%",
  "payerOwner": "เจ้าของจ่าย 100%",
  "payerSplit": "แบ่ง 50 / 50",
  "breakEvenMonthly": "รายได้รายเดือนที่จุดคุ้มทุน",
  "breakEvenWeekly": "รายได้รายสัปดาห์ที่จุดคุ้มทุน",
  "breakEvenExplanation": "ที่ {rev} ต่อเดือน ({weeklyRev} ต่อสัปดาห์) ทั้งค่าเช่าบูธและค่าคอมมิชชันให้รายได้สุทธิของศิลปินและเจ้าของสตูดิโอเท่ากันพอดี",
  "breakEvenUndefined": "ไม่สามารถถึงจุดคุ้มทุนได้ด้วยอัตราค่าคอมมิชชัน 0% ในปัจจุบัน",
  "errRevenuePositive": "รายได้ต้องเป็นตัวเลขบวกที่มากกว่าศูนย์",
  "warnRentExceedsRev": "ค่าเช่าบูธคงที่สูงกว่ารายได้รายเดือนจากลูกค้าในสถานการณ์นี้",
  "warnComm100": "ค่าคอมมิชชันตั้งไว้ที่ 100% โปรดทบทวนข้อตกลงนี้",
  "warnHighNoShow": "อัตราการไม่มาตามนัดตั้งไว้สูงกว่า 35% โปรดตรวจสอบโครงสร้างการจองนัดหมาย",
  "warnHighRevenue": "รายได้สูงมากสำหรับพื้นที่ทำงานของศิลปินหนึ่งคน โปรดตรวจสอบตัวเลข",
  "printTitle": "สรุปการคำนวณค่าเช่าบูธเทียบกับค่าคอมมิชชัน",
  "printSubtitle": "การประมาณการทางคณิตศาสตร์อย่างเป็นกลางสำหรับการทบทวนของศิลปินอิสระและเจ้าของสตูดิโอ",
  "printDisclaimer": "ประกาศและข้อจำกัดความรับผิดชอบ: เอกสารนี้เป็นสรุปการคำนวณทางคณิตศาสตร์ที่จัดทำขึ้นเพื่อการทบทวนอย่างเป็นกลางและการประมาณการทางการเงินเท่านั้น เอกสารนี้ไม่ถือเป็นสัญญาทางกฎหมาย สัญญาเช่า ข้อตกลงการจ้างงาน หรือความร่วมมือทางธุรกิจที่มีผลผูกพัน กฎเกณฑ์เกี่ยวกับการจัดประเภทการจ้างงาน การเช่าบูธ และภาระภาษีแตกต่างกันตามเขตอำนาจศาล ทั้ง Poli International และเครื่องมือนี้ไม่ได้ให้คำแนะนำทางกฎหมายหรือทางภาษี คู่สัญญาควรปรึกษาที่ปรึกษากฎหมายและนักบัญชีที่มีคุณสมบัติเหมาะสมเสมอ",
  "printGeneratedOn": "สร้างการคำนวณเมื่อ {date}",
  "printSignArtist": "การทบทวนและรับทราบของศิลปินอิสระ",
  "printSignOwner": "การทบทวนและรับทราบของเจ้าของสตูดิโอ / ตัวแทน",
  "printNameLabel": "ชื่อที่พิมพ์:",
  "printSignLabel": "ลายเซ็น:",
  "printDateLabel": "วันที่:",
  "printSignStatement": "ข้าพเจ้ารับทราบว่าได้ตรวจสอบการคำนวณทางคณิตศาสตร์และรายการที่รวมอยู่ในข้อเสนอตามที่ระบุไว้ข้างต้นแล้ว ข้าพเจ้าเข้าใจว่าเอกสารนี้เป็นเพียงการประมาณการทางคณิตศาสตร์เท่านั้น ไม่ใช่สัญญาทางกฎหมาย",
  "standardsTitle": "Poli International Pro Suite และมาตรฐานการเจาะร่างกายระดับมืออาชีพ",
  "standardsToggleHide": "ซ่อนตารางข้อมูลทางคลินิก",
  "standardsToggleShow": "ดูตารางข้อมูลทางคลินิกและวัสดุ",
  "standardsIntro": "จัดทำขึ้นสำหรับศิลปินอิสระ ช่างสัก สตูดิโอเจาะร่างกาย และช่างเจาะมืออาชีพที่มีคุณสมบัติ เมื่อจัดทำงบประมาณค่าใช้จ่ายส่วนกลางและตารางวัสดุสิ้นเปลือง โปรดตรวจสอบว่าเครื่องนึ่งฆ่าเชื้อ เข็ม และเครื่องประดับร่างกายทั้งหมดของสตูดิโอเป็นไปตามมาตรฐานการเจาะร่างกายระดับมืออาชีพ",
  "matTitaniumTitle": "ไทเทเนียม ASTM F-136",
  "matTitaniumDesc": "Ti-6Al-4V ELI เกรดการแพทย์/ฝังในร่างกาย มีความเข้ากันได้ทางชีวภาพสูง ต้านทานการกัดกร่อน และเป็นไปตามมาตรฐานการเจาะร่างกายระดับมืออาชีพ",
  "matSteelTitle": "สแตนเลส ASTM F-138",
  "matSteelDesc": "สแตนเลสเกรดศัลยกรรม 316LVM สำหรับฝังในร่างกาย หลอมด้วยสุญญากาศเพื่อความปลอดภัยทางคลินิกและการปลดปล่อยนิกเกิลต่ำ",
  "matGaugesTitle": "เกจลวดและค่าความคลาดเคลื่อน",
  "matGaugesDesc": "ตารางมาตรฐาน AWG/เมตริก พร้อมเกลียวภายในหรือรูปทรงแบบประกอบโดยไม่มีเกลียวสำหรับช่างเจาะมืออาชีพที่มีคุณสมบัติ",
  "relatedToolsTitle": "เครื่องมือเศรษฐศาสตร์สตูดิโอที่เกี่ยวข้อง",
  "linkBenchmark": "Studio Pricing Benchmark Tool",
  "linkBenchmarkDesc": "เปรียบเทียบอัตราค่าบริการและราคาต่อชั่วโมงของสตูดิโอในแต่ละภูมิภาค",
  "linkTax": "Tax & Deduction Tracker",
  "linkTaxDesc": "คำนวณค่าใช้จ่ายทางธุรกิจที่หักได้ ภาษีมูลค่าเพิ่ม และค่าลดหย่อนภาษีสำหรับผู้ประกอบอาชีพอิสระ",
  "linkRoi": "Equipment ROI Calculator",
  "linkRoiDesc": "คำนวณระยะเวลาคืนทุนและผลตอบแทนจากการลงทุนในเครื่องนึ่งฆ่าเชื้อและอุปกรณ์เลเซอร์",
  "perMonth": "/ เดือน",
  "perWeek": "/ สัปดาห์",
  "perYear": "/ ปี",
  "monthAbbr": "ด.",
  "weekAbbr": "สป."
};

export type TranslationKey = keyof typeof translations;

export const locales: Record<string, Record<string, string>> = {
  en: translations,
  fr: fr,
  de: de,
  it: it,
  es: es,
  nl: nl,
  pt: pt,
  th: th,
};

export const supportedLanguages = ['en', 'fr', 'de', 'it', 'es', 'nl', 'pt', 'th'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

let currentLanguage: SupportedLanguage = 'en';

export function getLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function setLanguage(lang: SupportedLanguage): void {
  if (locales[lang]) {
    currentLanguage = lang;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang);
    }
  }
}

/**
 * Single translate function for Booth Rent vs Commission Calculator.
 * Resolves keys from the active dictionary with optional parameter substitution and English fallback.
 */
export function t(key: string, params?: Record<string, string | number>, langOverride?: SupportedLanguage): string {
  const activeLang = langOverride || currentLanguage;
  const dict = locales[activeLang] || translations;
  let str = dict[key];

  // Fallback to English if key missing in current language
  if (str === undefined && activeLang !== 'en') {
    str = translations[key];
  }
  if (str === undefined) {
    str = key;
  }
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return str;
}

