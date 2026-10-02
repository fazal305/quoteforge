import { useState } from "react";

import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { RadioCardGroup } from "@/features/calculator-suite/components/ui/RadioCardGroup";
import { projectTypes } from "@/features/calculator-suite/config/pricingConfig";
import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";
import { buildComparisonTiers } from "@/features/calculator-suite/utils/comparisonTiers";
import { formatCurrency } from "@/features/calculator-suite/utils/format";

const TIER_HIGHLIGHT = {
  basic: "",
  standard: "border-(--color-accent) ring-1 ring-(--color-accent)",
  premium: "",
};

export function ComparisonPage() {
  const currentProjectTypeId = useCalculatorStore((s) => s.draft.projectTypeId);
  const businessProfile = useBusinessStore((s) => s.profile);
  const [projectTypeId, setProjectTypeId] = useState(currentProjectTypeId);

  const tiers = buildComparisonTiers(projectTypeId, businessProfile);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Project Type"
          description="Generates three ready-to-present scope tiers for this project type."
        />
        <RadioCardGroup
          ariaLabel="Project type for comparison"
          columns={3}
          value={projectTypeId}
          onChange={setProjectTypeId}
          options={projectTypes.map((p) => ({
            id: p.id,
            label: p.label,
            description: p.description,
          }))}
        />
      </Card>

      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={`flex flex-col ${TIER_HIGHLIGHT[tier.id]}`}
            >
              {tier.id === "standard" && (
                <span className="mb-3 inline-block w-fit rounded-full bg-(--color-accent-soft) px-2.5 py-0.5 text-[11px] font-medium text-(--color-accent-strong)">
                  Most Common
                </span>
              )}
              <p className="font-display text-lg font-semibold text-(--color-ink)">
                {tier.label}
              </p>
              <p className="tabular mt-2 font-display text-3xl font-semibold text-(--color-ink)">
                {formatCurrency(tier.pricing.recommendedQuote, "USD", 0)}
              </p>

              <dl className="mt-5 space-y-3 border-t border-(--color-border) pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-(--color-ink-secondary)">Pages</dt>
                  <dd className="tabular font-medium text-(--color-ink)">
                    {tier.pageCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-(--color-ink-secondary)">Features</dt>
                  <dd className="tabular font-medium text-(--color-ink)">
                    {tier.featureCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-(--color-ink-secondary)">Support</dt>
                  <dd className="font-medium text-(--color-ink)">
                    {tier.supportDays} days
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-(--color-ink-secondary)">
                    Estimated hours
                  </dt>
                  <dd className="tabular font-medium text-(--color-ink)">
                    {Math.round(tier.pricing.totalHours)}
                  </dd>
                </div>
              </dl>

              {tier.featureLabels.length > 0 && (
                <ul className="mt-5 flex-1 space-y-1.5 border-t border-(--color-border) pt-4 text-xs">
                  {tier.featureLabels.slice(0, 6).map((label) => (
                    <li
                      key={label}
                      className="flex gap-1.5 text-(--color-ink-secondary)"
                    >
                      <span className="text-(--color-accent)">✓</span>
                      {label}
                    </li>
                  ))}
                  {tier.featureLabels.length > 6 && (
                    <li className="text-(--color-ink-muted)">
                      + {tier.featureLabels.length - 6} more
                    </li>
                  )}
                </ul>
              )}
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-(--color-ink-muted)">
        Each tier is priced through the same calculation engine as the main
        calculator, at{" "}
        {tiers[1] &&
          formatCurrency(tiers[1].pricing.effectiveHourlyRate, "USD", 2)}
        /hr effective rate for Standard — not arbitrary numbers. Fine-tune any
        tier fully in the Calculator.
      </p>
    </div>
  );
}
