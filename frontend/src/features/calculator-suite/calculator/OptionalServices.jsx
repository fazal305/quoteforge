import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { RadioCardGroup } from "@/features/calculator-suite/components/ui/RadioCardGroup";
import { hostingItems, maintenancePlans } from "@/features/calculator-suite/config/pricingConfig";
import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";
import { formatCurrency } from "@/features/calculator-suite/utils/format";
import { CADENCE_SUFFIX } from "@/features/calculator-suite/utils/optionalServices";
import { calculatePricing } from "@/features/calculator-suite/utils/pricingEngine";

export function OptionalServices() {
  const draft = useCalculatorStore((s) => s.draft);
  const businessProfile = useBusinessStore((s) => s.profile);
  const setMaintenancePlan = useCalculatorStore((s) => s.setMaintenancePlan);
  const toggleHostingItem = useCalculatorStore((s) => s.toggleHostingItem);

  const { effectiveHourlyRate } = calculatePricing(draft, businessProfile);

  const maintenanceOptions = [
    {
      id: "none",
      label: "None",
      description: "No ongoing maintenance retainer.",
    },
    ...maintenancePlans.map((plan) => ({
      id: plan.id,
      label: plan.label,
      description: plan.description,
      badge: `${formatCurrency(plan.hoursPerCycle * effectiveHourlyRate, "USD", 0)}/${CADENCE_SUFFIX[plan.cadence]}`,
    })),
  ];

  return (
    <Card>
      <CardHeader
        title="Optional Services"
        description="Priced separately from the project quote — shown to the client as add-ons, not folded into the core price."
      />

      <p className="mb-2 text-sm font-medium text-(--color-ink)">Maintenance</p>
      <RadioCardGroup
        ariaLabel="Maintenance plan"
        columns={2}
        value={draft.maintenancePlanId ?? "none"}
        onChange={(id) => setMaintenancePlan(id === "none" ? null : id)}
        options={maintenanceOptions}
      />

      <div className="mt-6 border-t border-(--color-border) pt-5">
        <p className="mb-2 text-sm font-medium text-(--color-ink)">
          Hosting &amp; Domain
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {hostingItems.map((item) => {
            const checked = draft.hostingItemIds.includes(item.id);
            return (
              <label
                key={item.id}
                htmlFor={`hosting-${item.id}`}
                className={`flex cursor-pointer items-start gap-3 rounded-(--radius-token-md) border p-3 transition-colors ${
                  checked
                    ? "border-(--color-accent) bg-(--color-accent-soft)"
                    : "border-(--color-border) bg-(--color-surface) hover:border-(--color-border-strong)"
                }`}
              >
                <input
                  id={`hosting-${item.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleHostingItem(item.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-(--color-accent)"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span
                      className={`text-sm font-medium ${checked ? "text-(--color-accent-strong)" : "text-(--color-ink)"}`}
                    >
                      {item.label}
                    </span>
                    <span className="tabular text-xs text-(--color-ink-muted)">
                      {formatCurrency(item.price, item.currency, 0)}
                      {item.type === "recurring"
                        ? `/${CADENCE_SUFFIX[item.cadence]}`
                        : " one-time"}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-(--color-ink-secondary)">
                    {item.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
