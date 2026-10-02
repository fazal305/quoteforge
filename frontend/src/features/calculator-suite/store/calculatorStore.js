import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { projectTypes } from "@/features/calculator-suite/config/pricingConfig";
import { createBlankQuoteDraft } from "@/features/calculator-suite/utils/createQuoteDraft";

const safeLocalStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Storage unavailable — the draft won't autosave this session.
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // no-op
    }
  },
};

function generateCustomPageId() {
  return `cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export const useCalculatorStore = create()(
  persist(
    (set) => ({
      draft: createBlankQuoteDraft(),

      setProjectTitle: (value) =>
        set((s) => ({
          draft: {
            ...s.draft,
            projectTitle: value,
            updatedAt: new Date().toISOString(),
          },
        })),

      setClientName: (value) =>
        set((s) => ({
          draft: {
            ...s.draft,
            clientName: value,
            updatedAt: new Date().toISOString(),
          },
        })),

      setProjectType: (projectTypeId) => {
        const projectType = projectTypes.find((p) => p.id === projectTypeId);
        if (!projectType) return;
        set((s) => ({
          draft: {
            ...s.draft,
            projectTypeId,
            complexityId: s.draft.isComplexityManual
              ? s.draft.complexityId
              : projectType.defaultComplexity,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      setComplexity: (complexityId) =>
        set((s) => ({
          draft: {
            ...s.draft,
            complexityId,
            isComplexityManual: true,
            updatedAt: new Date().toISOString(),
          },
        })),

      setPageQuantity: (pageTypeId, quantity) =>
        set((s) => {
          const existing = s.draft.selectedPages.find(
            (p) => p.pageTypeId === pageTypeId,
          );
          let selectedPages;
          if (quantity <= 0) {
            selectedPages = s.draft.selectedPages.filter(
              (p) => p.pageTypeId !== pageTypeId,
            );
          } else if (existing) {
            selectedPages = s.draft.selectedPages.map((p) =>
              p.pageTypeId === pageTypeId ? { ...p, quantity } : p,
            );
          } else {
            selectedPages = [
              ...s.draft.selectedPages,
              { pageTypeId, quantity },
            ];
          }
          return {
            draft: {
              ...s.draft,
              selectedPages,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addCustomPage: () =>
        set((s) => ({
          draft: {
            ...s.draft,
            customPages: [
              ...s.draft.customPages,
              {
                id: generateCustomPageId(),
                name: "",
                quantity: 1,
                hoursEach: 4,
              },
            ],
            updatedAt: new Date().toISOString(),
          },
        })),

      updateCustomPage: (id, patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            customPages: s.draft.customPages.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      removeCustomPage: (id) =>
        set((s) => ({
          draft: {
            ...s.draft,
            customPages: s.draft.customPages.filter((p) => p.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),

      toggleFeature: (featureId) =>
        set((s) => {
          const has = s.draft.selectedFeatureIds.includes(featureId);
          const selectedFeatureIds = has
            ? s.draft.selectedFeatureIds.filter((id) => id !== featureId)
            : [...s.draft.selectedFeatureIds, featureId];
          return {
            draft: {
              ...s.draft,
              selectedFeatureIds,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setExperienceLevel: (id) =>
        set((s) => ({
          draft: {
            ...s.draft,
            experienceLevelId: id,
            updatedAt: new Date().toISOString(),
          },
        })),

      toggleSpecialization: (id) =>
        set((s) => {
          const has = s.draft.specializationIds.includes(id);
          const specializationIds = has
            ? s.draft.specializationIds.filter((sid) => sid !== id)
            : [...s.draft.specializationIds, id];
          return {
            draft: {
              ...s.draft,
              specializationIds,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setMarketPositioning: (id) =>
        set((s) => ({
          draft: {
            ...s.draft,
            marketPositioningId: id,
            updatedAt: new Date().toISOString(),
          },
        })),

      setUrgency: (id) =>
        set((s) => ({
          draft: {
            ...s.draft,
            urgencyId: id,
            updatedAt: new Date().toISOString(),
          },
        })),

      setContingencyPercent: (percent) =>
        set((s) => ({
          draft: {
            ...s.draft,
            contingencyPercent: percent,
            updatedAt: new Date().toISOString(),
          },
        })),

      setAdditionalRevisionRounds: (rounds) =>
        set((s) => ({
          draft: {
            ...s.draft,
            additionalRevisionRounds: Math.max(rounds, 0),
            updatedAt: new Date().toISOString(),
          },
        })),

      setMaintenancePlan: (id) =>
        set((s) => ({
          draft: {
            ...s.draft,
            maintenancePlanId: id,
            updatedAt: new Date().toISOString(),
          },
        })),

      toggleHostingItem: (id) =>
        set((s) => {
          const has = s.draft.hostingItemIds.includes(id);
          const hostingItemIds = has
            ? s.draft.hostingItemIds.filter((hid) => hid !== id)
            : [...s.draft.hostingItemIds, id];
          return {
            draft: {
              ...s.draft,
              hostingItemIds,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setPaymentStructure: (value) =>
        set((s) => ({
          draft: {
            ...s.draft,
            paymentStructure: value,
            updatedAt: new Date().toISOString(),
          },
        })),

      loadDraft: (draft) => set({ draft }),

      startNewDraft: () => set({ draft: createBlankQuoteDraft() }),

      /**
       * Applies a reviewed AI Assistant suggestion in one atomic update.
       * Feature ids are merged (union) with whatever's already selected —
       * never silently replaced — and standard pages are only seeded if
       * none are selected yet, so this never discards manual edits.
       */
      applyAiSuggestion: ({ projectTypeId, complexityId, featureIds }) =>
        set((s) => {
          const projectType = projectTypes.find((p) => p.id === projectTypeId);
          const mergedFeatureIds = Array.from(
            new Set([...s.draft.selectedFeatureIds, ...featureIds]),
          );
          const selectedPages =
            s.draft.selectedPages.length > 0
              ? s.draft.selectedPages
              : (projectType?.suggestedPageIds ?? []).map((pageTypeId) => ({
                  pageTypeId,
                  quantity: 1,
                }));

          return {
            draft: {
              ...s.draft,
              projectTypeId,
              complexityId,
              isComplexityManual: true,
              selectedFeatureIds: mergedFeatureIds,
              selectedPages,
              updatedAt: new Date().toISOString(),
            },
          };
        }),
    }),
    {
      name: "quoterate.calculator.draft",
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
