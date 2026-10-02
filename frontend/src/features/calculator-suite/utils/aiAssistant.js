import {
  featureKeywords,
  genericPaymentKeywords,
  projectTypeKeywords,
} from "@/features/calculator-suite/config/aiKeywords";
import {
  complexityLevels,
  features,
  projectTypes,
} from "@/features/calculator-suite/config/pricingConfig";

/**
 * Fully local, offline keyword matcher — no network call, no external
 * model. Turns a free-text project description into a structured, EDITABLE
 * suggestion (project type + feature ids + a complexity guess). Nothing
 * here writes to app state; the caller decides whether to apply it.
 */
export function parseRequirements(text) {
  const normalized = text.toLowerCase();

  let matchedProjectTypeId = null;
  for (const [projectTypeId, keywords] of Object.entries(projectTypeKeywords)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      matchedProjectTypeId = projectTypeId;
      break;
    }
  }
  if (!matchedProjectTypeId) {
    matchedProjectTypeId = "custom_web_application";
  }

  const matchedFeatureIds = new Set();
  for (const [featureId, keywords] of Object.entries(featureKeywords)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      matchedFeatureIds.add(featureId);
    }
  }
  if (
    genericPaymentKeywords.some((kw) => normalized.includes(kw)) &&
    !matchedFeatureIds.has("stripe")
  ) {
    matchedFeatureIds.add("stripe");
  }

  const featureCount = matchedFeatureIds.size;
  const projectType = projectTypes.find((p) => p.id === matchedProjectTypeId);
  const baseComplexityIndex = complexityLevels.findIndex(
    (c) => c.id === projectType.defaultComplexity,
  );
  const bump = featureCount >= 9 ? 2 : featureCount >= 5 ? 1 : 0;
  const complexityIndex = Math.min(
    baseComplexityIndex + bump,
    complexityLevels.length - 1,
  );
  const complexityId = complexityLevels[complexityIndex].id;

  return {
    projectTypeId: matchedProjectTypeId,
    featureIds: [...matchedFeatureIds],
    complexityId,
    matchedFeatures: [...matchedFeatureIds]
      .map((id) => features.find((f) => f.id === id))
      .filter(Boolean),
    hasAnyMatch:
      matchedProjectTypeId !== "custom_web_application" || featureCount > 0,
  };
}
