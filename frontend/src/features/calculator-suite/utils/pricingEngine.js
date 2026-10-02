import {
  baseHoursSplit,
  experienceLevels,
  features,
  marketPositioning,
  pageTypes,
  quoteRange,
  specializations,
  testingPercentOfDevHours,
  urgencyLevels,
} from "@/features/calculator-suite/config/pricingConfig";
import { calculateHourlyRate } from "@/features/calculator-suite/utils/hourlyRate";
import {
  getComplexity,
  getCustomPagesHours,
  getProjectType,
} from "@/features/calculator-suite/utils/scopeHours";

const HOURS_PER_ADDITIONAL_REVISION = 4;

function getBreakdownHoursBeforeComplexity(draft) {
  const projectType = getProjectType(draft.projectTypeId);

  const lines = {
    design: projectType.baseHours * baseHoursSplit.design,
    frontend: projectType.baseHours * baseHoursSplit.frontend,
    backend: 0,
    database: 0,
    admin: 0,
    integrations: 0,
    testing: 0,
    deployment: projectType.baseHours * baseHoursSplit.deployment,
  };

  for (const sel of draft.selectedPages) {
    const pageType = pageTypes.find((p) => p.id === sel.pageTypeId);
    if (!pageType) continue;
    lines[pageType.category] += pageType.hours * sel.quantity;
  }

  const customPagesHours = getCustomPagesHours(draft);
  lines.frontend += customPagesHours;

  for (const featureId of draft.selectedFeatureIds) {
    const feature = features.find((f) => f.id === featureId);
    if (!feature) continue;
    lines[feature.breakdownCategory] += feature.hours;
  }

  const devHoursSoFar = Object.values(lines).reduce((a, b) => a + b, 0);
  lines.testing += devHoursSoFar * (testingPercentOfDevHours / 100);

  return lines;
}

/**
 * The full pipeline: scope hours -> effective hourly rate (experience x
 * market positioning x specializations) -> category cost breakdown ->
 * urgency -> revisions -> contingency -> final Minimum/Recommended/Premium
 * range. Every intermediate value is returned so the UI can explain itself.
 */
export function calculatePricing(draft, businessProfile) {
  const complexity = getComplexity(draft.complexityId);

  const recommendedHourlyRate =
    calculateHourlyRate(businessProfile).recommendedHourlyRate;

  const experienceMultiplier =
    experienceLevels.find((e) => e.id === draft.experienceLevelId)
      ?.rateMultiplier ?? 1;
  const marketMultiplier =
    marketPositioning.find((m) => m.id === draft.marketPositioningId)
      ?.rateMultiplier ?? 1;
  const specializationBonus = draft.specializationIds.reduce((sum, id) => {
    const spec = specializations.find((s) => s.id === id);
    return spec ? sum + spec.rateBonus : sum;
  }, 0);

  const effectiveHourlyRate =
    recommendedHourlyRate *
    experienceMultiplier *
    marketMultiplier *
    (1 + specializationBonus);

  const rawLines = getBreakdownHoursBeforeComplexity(draft);
  const breakdownLines = Object.entries(rawLines)
    .map(([category, hours]) => {
      const adjustedHours = hours * complexity.multiplier;
      return {
        category,
        hours: adjustedHours,
        cost: adjustedHours * effectiveHourlyRate,
      };
    })
    .filter((line) => line.hours > 0);

  const devCost = breakdownLines.reduce((sum, l) => sum + l.cost, 0);
  // Includes testing hours, unlike the pre-catalog scope total — this is the number actually priced.
  const totalHours = breakdownLines.reduce((sum, l) => sum + l.hours, 0);

  const urgency =
    urgencyLevels.find((u) => u.id === draft.urgencyId) ?? urgencyLevels[0];
  const urgencyAddOn = devCost * (urgency.multiplier - 1);

  const additionalRevisionHours =
    draft.additionalRevisionRounds * HOURS_PER_ADDITIONAL_REVISION;
  const revisionsCost = additionalRevisionHours * effectiveHourlyRate;

  const subtotal = devCost + urgencyAddOn + revisionsCost;

  const contingencyAmount = subtotal * (draft.contingencyPercent / 100);
  const estimatedTotal = subtotal + contingencyAmount;

  const minimumQuote = estimatedTotal * quoteRange.minimumFactor;
  const recommendedQuote = estimatedTotal;
  const premiumQuote = estimatedTotal * quoteRange.premiumFactor;

  const highComplexityFeatureCount = draft.selectedFeatureIds.filter(
    (id) => features.find((f) => f.id === id)?.complexity === "high",
  ).length;
  let confidence = "high";
  if (
    draft.complexityId === "very_complex" ||
    highComplexityFeatureCount >= 4
  ) {
    confidence = "low";
  } else if (
    draft.complexityId === "complex" ||
    highComplexityFeatureCount >= 2
  ) {
    confidence = "medium";
  }

  const billableHoursPerWeek = businessProfile.billableHoursPerMonth / 4.33;
  const midWeeks =
    billableHoursPerWeek > 0 ? totalHours / billableHoursPerWeek : 0;
  const estimatedWeeksRange = {
    min: Math.max(1, Math.round(midWeeks * 0.85)),
    max: Math.max(1, Math.round(midWeeks * 1.25)),
  };
  const estimatedWorkingDaysRange = {
    min: Math.round(estimatedWeeksRange.min * 5),
    max: Math.round(estimatedWeeksRange.max * 5),
  };

  return {
    totalHours,
    effectiveHourlyRate,
    recommendedHourlyRate,
    experienceMultiplier,
    marketMultiplier,
    specializationBonusPercent: specializationBonus * 100,

    breakdownLines,
    devCost,

    urgencyMultiplier: urgency.multiplier,
    urgencyAddOn,

    additionalRevisionHours,
    revisionsCost,

    subtotal,
    contingencyPercent: draft.contingencyPercent,
    contingencyAmount,

    estimatedTotal,
    minimumQuote,
    recommendedQuote,
    premiumQuote,

    confidence,
    estimatedWorkingDaysRange,
    estimatedWeeksRange,
  };
}
