import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  defaultBrandingProfile,
  defaultBusinessProfile,
  defaultCurrencyPreferences,
  defaultPricingPhilosophy,
} from "@/features/calculator-suite/config/businessDefaults";

/** Wraps localStorage so a disabled/full/private-mode store degrades to an in-memory no-op instead of crashing the app. */
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
      // Storage unavailable — settings simply won't persist this session.
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

export const useBusinessStore = create()(
  persist(
    (set) => ({
      profile: defaultBusinessProfile,
      currency: defaultCurrencyPreferences,
      branding: defaultBrandingProfile,
      pricingPhilosophy: defaultPricingPhilosophy,
      /** Cached live USD->PKR rate: { rate, source, fetchedAt, rateDate } | null. Persists as a fallback cache. */
      liveRate: null,
      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      updateCurrency: (patch) =>
        set((s) => ({ currency: { ...s.currency, ...patch } })),
      updateBranding: (patch) =>
        set((s) => ({ branding: { ...s.branding, ...patch } })),
      setPricingPhilosophy: (value) => set({ pricingPhilosophy: value }),
      setLiveRate: (liveRate) => set({ liveRate }),
      resetToDefaults: () =>
        set({
          profile: defaultBusinessProfile,
          currency: defaultCurrencyPreferences,
          branding: defaultBrandingProfile,
          pricingPhilosophy: defaultPricingPhilosophy,
        }),
    }),
    {
      name: "quoterate.business",
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);
