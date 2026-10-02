import { hostingItems, maintenancePlans } from "@/features/calculator-suite/config/pricingConfig";

export const CADENCE_SUFFIX = {
  monthly: "month",
  quarterly: "quarter",
  annual: "year",
};

/**
 * Optional maintenance/hosting add-ons, priced separately from the core
 * project quote — per the project price + optional recurring services
 * model. Maintenance cost is derived from the same effective hourly rate
 * as the rest of the quote; hosting items carry their own flat prices.
 */
export function computeOptionalServices(draft, effectiveHourlyRate) {
  const maintenancePlan =
    maintenancePlans.find((p) => p.id === draft.maintenancePlanId) ?? null;
  const maintenance = maintenancePlan
    ? {
        ...maintenancePlan,
        cost: maintenancePlan.hoursPerCycle * effectiveHourlyRate,
      }
    : null;

  const selectedHostingItems = hostingItems.filter((h) =>
    draft.hostingItemIds.includes(h.id),
  );
  const oneTimeItems = selectedHostingItems.filter(
    (h) => h.type === "one_time",
  );
  const monthlyItems = selectedHostingItems.filter(
    (h) => h.type === "recurring" && h.cadence === "monthly",
  );
  const annualItems = selectedHostingItems.filter(
    (h) => h.type === "recurring" && h.cadence === "annual",
  );

  return {
    maintenance,
    hostingItems: selectedHostingItems,
    oneTimeItems,
    monthlyItems,
    annualItems,
    oneTimeTotal: oneTimeItems.reduce((sum, h) => sum + h.price, 0),
    monthlyTotal: monthlyItems.reduce((sum, h) => sum + h.price, 0),
    annualTotal: annualItems.reduce((sum, h) => sum + h.price, 0),
  };
}
