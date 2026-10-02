import {
  complexityLevels,
  features as featureCatalog,
  pageTypes,
  projectTypes,
} from "@/features/calculator-suite/config/pricingConfig";
import { calculatePricing } from "@/features/calculator-suite/utils/pricingEngine";

const PREMIUM_ADD_ON_FEATURE_IDS = ["analytics_dashboard", "search"];

function shiftComplexity(complexityId, steps) {
  const index = complexityLevels.findIndex((c) => c.id === complexityId);
  const nextIndex = Math.min(
    Math.max(index + steps, 0),
    complexityLevels.length - 1,
  );
  return complexityLevels[nextIndex].id;
}

function toSelectedPages(pageIds) {
  return pageIds.map((pageTypeId) => ({ pageTypeId, quantity: 1 }));
}

function baseDraftFields() {
  const now = new Date().toISOString();
  return {
    id: "comparison",
    projectTitle: "",
    clientName: "",
    customPages: [],
    specializationIds: [],
    urgencyId: "normal",
    contingencyPercent: 15,
    additionalRevisionRounds: 0,
    maintenancePlanId: null,
    hostingItemIds: [],
    paymentStructure: "50_50",
    experienceLevelId: "junior",
    createdAt: now,
    updatedAt: now,
  };
}

function buildTierDraft(projectType, tierDef) {
  return {
    ...baseDraftFields(),
    projectTypeId: projectType.id,
    isComplexityManual: true,
    complexityId: tierDef.getComplexity(projectType),
    marketPositioningId: tierDef.positioningId,
    selectedPages: toSelectedPages(tierDef.getPageIds(projectType)),
    selectedFeatureIds: tierDef.getFeatureIds(projectType),
  };
}

const TIER_DEFS = [
  {
    id: "basic",
    label: "Basic",
    supportDays: 30,
    positioningId: "local",
    getComplexity: () => "simple",
    getPageIds: (projectType) => {
      const essential = projectType.suggestedPageIds.filter(
        (id) => id === "home" || id === "contact",
      );
      return essential.length > 0
        ? essential
        : projectType.suggestedPageIds.slice(0, 1);
    },
    getFeatureIds: (projectType) =>
      projectType.suggestedFeatureIds.filter(
        (id) => featureCatalog.find((f) => f.id === id)?.complexity === "low",
      ),
  },
  {
    id: "standard",
    label: "Standard",
    supportDays: 90,
    positioningId: "international",
    getComplexity: (projectType) => projectType.defaultComplexity,
    getPageIds: (projectType) => projectType.suggestedPageIds,
    getFeatureIds: (projectType) => projectType.suggestedFeatureIds,
  },
  {
    id: "premium",
    label: "Premium",
    supportDays: 180,
    positioningId: "premium",
    getComplexity: (projectType) =>
      shiftComplexity(projectType.defaultComplexity, 1),
    getPageIds: (projectType) => {
      const extra = pageTypes.find(
        (p) => !projectType.suggestedPageIds.includes(p.id),
      );
      return extra
        ? [...projectType.suggestedPageIds, extra.id]
        : projectType.suggestedPageIds;
    },
    getFeatureIds: (projectType) =>
      Array.from(
        new Set([
          ...projectType.suggestedFeatureIds,
          ...PREMIUM_ADD_ON_FEATURE_IDS,
        ]),
      ),
  },
];

/**
 * Builds three scope tiers (Basic/Standard/Premium) for a given project
 * type so a freelancer can show a client options side by side, instead of
 * presenting a single take-it-or-leave-it number. Each tier is priced
 * through the same calculation engine as the main calculator — nothing
 * here invents a different pricing model.
 */
export function buildComparisonTiers(projectTypeId, businessProfile) {
  const projectType =
    projectTypes.find((p) => p.id === projectTypeId) ?? projectTypes[0];

  return TIER_DEFS.map((tierDef) => {
    const draft = buildTierDraft(projectType, tierDef);
    const pricing = calculatePricing(draft, businessProfile);
    return {
      id: tierDef.id,
      label: tierDef.label,
      supportDays: tierDef.supportDays,
      pageCount: draft.selectedPages.length,
      featureCount: draft.selectedFeatureIds.length,
      featureLabels: draft.selectedFeatureIds
        .map((id) => featureCatalog.find((f) => f.id === id)?.label)
        .filter(Boolean),
      pricing,
    };
  });
}
