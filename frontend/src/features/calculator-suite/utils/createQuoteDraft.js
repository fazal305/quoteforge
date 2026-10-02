import { defaultBusinessProfile } from "@/features/calculator-suite/config/businessDefaults";
import { projectTypes, revisions } from "@/features/calculator-suite/config/pricingConfig";

function generateId() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlankQuoteDraft() {
  const defaultProjectType = projectTypes[0];
  const now = new Date().toISOString();

  return {
    id: generateId(),
    projectTitle: "",
    clientName: "",

    projectTypeId: defaultProjectType.id,
    complexityId: defaultProjectType.defaultComplexity,
    isComplexityManual: false,

    selectedPages: defaultProjectType.suggestedPageIds.map((pageTypeId) => ({
      pageTypeId,
      quantity: 1,
    })),
    customPages: [],

    selectedFeatureIds: [...defaultProjectType.suggestedFeatureIds],

    experienceLevelId: defaultBusinessProfile.experienceLevelId,
    specializationIds: [],
    marketPositioningId: "international",
    urgencyId: "normal",

    contingencyPercent: 15,
    additionalRevisionRounds: 0,

    maintenancePlanId: null,
    hostingItemIds: [],

    paymentStructure: "50_50",

    createdAt: now,
    updatedAt: now,
  };
}

export const DEFAULT_ADDITIONAL_REVISION_HOURS =
  revisions.hoursPerAdditionalRound;
