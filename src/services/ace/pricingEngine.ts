/**
 * A.C.E Dynamic Pricing & Yield Engine
 * Grounded in HydraDB Context & Concession Policies
 */

import { DealConfiguration, PricingAnalysisResult } from './types';
import { HydraDBEngine } from '../hydradb/engine';

export function calculateCommercialPricing(config: DealConfiguration): PricingAnalysisResult {
  const hydra = HydraDBEngine.getInstance();
  
  // Base tier seat rates ($/seat/year)
  const tierSeatRates: Record<DealConfiguration['planTier'], number> = {
    'Starter': 650,
    'Growth': 1100,
    'Enterprise': 1650,
    'Sovereign-Dedicated': 2400,
  };

  const baseSeatPrice = tierSeatRates[config.planTier] || 1500;
  let rawAnnualBase = config.seatCount * baseSeatPrice;

  // Add-on calculations
  let addOnAnnual = 0;
  if (config.addOns.dedicatedHydraCluster) addOnAnnual += 45000;
  if (config.addOns.realtimeVectorIndexing) addOnAnnual += 18000;
  if (config.addOns.sla24x7Support) addOnAnnual += 24000;
  if (config.addOns.complianceBAAPack) addOnAnnual += 30000;
  if (config.addOns.customAIInferenceUnits > 0) {
    addOnAnnual += config.addOns.customAIInferenceUnits * 3200; // $3.2k per million units
  }

  const listArr = rawAnnualBase + addOnAnnual;

  // Contract duration multiplier
  let termDiscountBonus = 0;
  if (config.contractTermMonths === 24) termDiscountBonus = 4.0;
  if (config.contractTermMonths >= 36) termDiscountBonus = 8.5;

  // Payment term adjustment
  let paymentTermModifier = 1.0;
  if (config.paymentTerms === 'Multi-Year Upfront') paymentTermModifier = 0.95;
  if (config.paymentTerms === 'Quarterly') paymentTermModifier = 1.04;
  if (config.paymentTerms === 'Monthly') paymentTermModifier = 1.08;

  // Discount application
  const effectiveDiscountPct = Math.max(0, Math.min(40, config.requestedDiscountPct));
  const effectiveArr = Math.round(listArr * (1 - effectiveDiscountPct / 100) * paymentTermModifier);

  // Gross Margin & Cost of Goods calculation
  const fixedCostBase = 22000 + (config.addOns.dedicatedHydraCluster ? 12000 : 3000);
  const variableCostPerSeat = config.planTier === 'Sovereign-Dedicated' ? 180 : 110;
  const totalAnnualCost = fixedCostBase + (config.seatCount * variableCostPerSeat) + (config.addOns.customAIInferenceUnits * 750);
  const grossProfit = effectiveArr - totalAnnualCost;
  const grossMarginPct = Math.max(10, Math.min(96, Math.round((grossProfit / effectiveArr) * 1000) / 10));

  // Customer Lifetime Value (LTV) Projection
  const estimatedRetentionYears = config.contractTermMonths >= 36 ? 4.5 : config.contractTermMonths >= 24 ? 3.8 : 2.5;
  const projectedLtv = Math.round(effectiveArr * estimatedRetentionYears * (grossMarginPct / 100));

  // Payback period
  const cacEstimate = 35000 + (config.seatCount * 65);
  const monthlyContributionMargin = (effectiveArr * (grossMarginPct / 100)) / 12;
  const paybackMonths = Math.max(1, Math.round((cacEstimate / (monthlyContributionMargin || 1)) * 10) / 10);

  // Query HydraDB for Context Traces & Concession Rules
  const hydraResults = hydra.query({
    queryText: `${config.accountName} pricing margin discount competitor concession`,
    limit: 6,
    includeNeighborhood: true,
  });

  const hydraContextTraces = hydraResults.map((res) => ({
    entityId: res.node.id,
    label: res.node.label,
    relevanceReason: `Semantic similarity ${(res.semanticScore || 0.8 * 100).toFixed(0)}% with graph link to ${res.node.type}`,
    temporalStatus: res.node.validTo ? 'Historical' : 'Active Active Context',
  }));

  // Determine win probability
  let baseWinProb = 65;
  if (config.contractTermMonths >= 36) baseWinProb += 10;
  if (effectiveDiscountPct >= 10 && effectiveDiscountPct <= 18) baseWinProb += 12;
  if (effectiveDiscountPct > 25) baseWinProb -= 8; // Perceived as desperate / high friction
  if (config.addOns.dedicatedHydraCluster) baseWinProb += 6;
  const winProbabilityPct = Math.min(96, Math.max(25, baseWinProb));

  // Elasticity score
  const elasticityIndex = parseFloat((0.85 + (config.seatCount > 300 ? 0.4 : 0.15) - (termDiscountBonus / 20)).toFixed(2));
  
  // Health score
  let priceHealthScore = 88;
  if (grossMarginPct < 75) priceHealthScore -= 25;
  if (effectiveDiscountPct > 20) priceHealthScore -= 18;
  if (config.paymentTerms === 'Multi-Year Upfront') priceHealthScore += 10;
  priceHealthScore = Math.max(20, Math.min(100, priceHealthScore));

  // Concession Give-Get Matrix
  const concessionGiveGets = [
    {
      requestedDiscount: 10,
      approved: true,
      give: '10% Standard Volume Optimization',
      getReqs: ['Annual advance electronic payment (Net 30)', 'Standard mutual non-disclosure'],
      marginDeltaPct: -2.1,
    },
    {
      requestedDiscount: 15,
      approved: config.contractTermMonths >= 24,
      give: '15% Strategic Partner Concession',
      getReqs: [
        'Minimum 24-Month Binding Agreement',
        'Customer Logo & Written Case Study rights within 90 days',
        'Semi-Annual Executive Steering Committee sponsorship',
      ],
      marginDeltaPct: -4.8,
    },
    {
      requestedDiscount: 20,
      approved: config.contractTermMonths >= 36 && config.paymentTerms === 'Multi-Year Upfront',
      give: '20% Executive Sovereign Concession',
      getReqs: [
        '36-Month Upfront Cash Settlement',
        'Co-Innovation keynote at Annual Commercial Summit',
        'Exclusive vendor lock-in for enterprise temporal graph workloads',
      ],
      marginDeltaPct: -7.9,
    },
  ];

  const marginAlert: 'SAFE' | 'WARNING' | 'CRITICAL_LEAK' =
    grossMarginPct >= 80 ? 'SAFE' : grossMarginPct >= 72 ? 'WARNING' : 'CRITICAL_LEAK';

  const recommendedDiscountPct = config.contractTermMonths >= 36 ? 15 : config.contractTermMonths >= 24 ? 10 : 5;

  return {
    listArr,
    effectiveArr,
    grossMarginPct,
    projectedLtv,
    paybackMonths,
    winProbabilityPct,
    elasticityIndex,
    priceHealthScore,
    recommendedDiscountPct,
    concessionGiveGets,
    marginAlert,
    hydraContextTraces,
  };
}
