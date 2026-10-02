import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { FeatureToggleRow } from "@/features/calculator-suite/components/ui/FeatureToggleRow";
import { FEATURE_CATEGORY_LABELS, features } from "@/features/calculator-suite/config/pricingConfig";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";
import { formatNumber } from "@/features/calculator-suite/utils/format";

const CATEGORY_ORDER = [
  "authentication",
  "database",
  "admin",
  "payments",
  "communication",
  "integrations",
  "advanced",
];

export function FeatureCatalog() {
  const selectedFeatureIds = useCalculatorStore(
    (s) => s.draft.selectedFeatureIds,
  );
  const toggleFeature = useCalculatorStore((s) => s.toggleFeature);

  const totalFeatureHours = selectedFeatureIds.reduce((sum, id) => {
    const f = features.find((feat) => feat.id === id);
    return f ? sum + f.hours : sum;
  }, 0);

  return (
    <Card>
      <CardHeader
        title="Features"
        description="Select what this project needs. Each one adds its own hours to the estimate."
      />
      <div className="space-y-2">
        {CATEGORY_ORDER.map((category) => {
          const categoryFeatures = features.filter(
            (f) => f.category === category,
          );
          const selectedInCategory = categoryFeatures.filter((f) =>
            selectedFeatureIds.includes(f.id),
          ).length;

          return (
            <details
              key={category}
              open={category === "authentication" || selectedInCategory > 0}
              className="group rounded-(--radius-token-md) border border-(--color-border)"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-(--color-ink) [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted) transition-transform group-open:rotate-90"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {FEATURE_CATEGORY_LABELS[category]}
                </span>
                {selectedInCategory > 0 && (
                  <span className="tabular rounded-full bg-(--color-accent-soft) px-2 py-0.5 text-[11px] font-medium text-(--color-accent-strong)">
                    {selectedInCategory} selected
                  </span>
                )}
              </summary>
              <div className="grid grid-cols-1 gap-2 border-t border-(--color-border) p-3 sm:grid-cols-2">
                {categoryFeatures.map((feature) => (
                  <FeatureToggleRow
                    key={feature.id}
                    id={`feature-${feature.id}`}
                    label={feature.label}
                    description={feature.description}
                    hours={feature.hours}
                    complexity={feature.complexity}
                    checked={selectedFeatureIds.includes(feature.id)}
                    onChange={() => toggleFeature(feature.id)}
                  />
                ))}
              </div>
            </details>
          );
        })}
      </div>

      {selectedFeatureIds.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-(--radius-token-md) bg-(--color-surface-sunken) px-4 py-3 text-sm">
          <span className="text-(--color-ink-secondary)">
            {selectedFeatureIds.length} feature
            {selectedFeatureIds.length === 1 ? "" : "s"} selected
          </span>
          <span className="tabular font-medium text-(--color-ink)">
            {formatNumber(totalFeatureHours)} hrs
          </span>
        </div>
      )}
    </Card>
  );
}
