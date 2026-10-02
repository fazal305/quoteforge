import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { RadioCardGroup } from "@/features/calculator-suite/components/ui/RadioCardGroup";
import { Stepper } from "@/features/calculator-suite/components/ui/Stepper";
import {
  complexityLevels,
  pageTypes,
  projectTypes,
} from "@/features/calculator-suite/config/pricingConfig";
import { FeatureCatalog } from "@/features/calculator-suite/calculator/FeatureCatalog";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";
import { formatNumber } from "@/features/calculator-suite/utils/format";
import { getScopeHoursSummary } from "@/features/calculator-suite/utils/scopeHours";

export function ProjectScopeCalculator() {
  const draft = useCalculatorStore((s) => s.draft);
  const setProjectType = useCalculatorStore((s) => s.setProjectType);
  const setComplexity = useCalculatorStore((s) => s.setComplexity);
  const setPageQuantity = useCalculatorStore((s) => s.setPageQuantity);
  const addCustomPage = useCalculatorStore((s) => s.addCustomPage);
  const updateCustomPage = useCalculatorStore((s) => s.updateCustomPage);
  const removeCustomPage = useCalculatorStore((s) => s.removeCustomPage);

  const scope = getScopeHoursSummary(draft);

  const pageQuantity = (pageTypeId) =>
    draft.selectedPages.find((p) => p.pageTypeId === pageTypeId)?.quantity ?? 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Project Type"
          description="Sets a sensible starting point — every value below is still yours to change."
        />
        <RadioCardGroup
          ariaLabel="Project type"
          columns={3}
          value={draft.projectTypeId}
          onChange={setProjectType}
          options={projectTypes.map((p) => ({
            id: p.id,
            label: p.label,
            description: p.description,
          }))}
        />
      </Card>

      <Card>
        <CardHeader
          title="Complexity"
          description="How many interacting systems and how much custom logic this project needs."
        />
        <RadioCardGroup
          ariaLabel="Complexity level"
          columns={2}
          value={draft.complexityId}
          onChange={(id) => setComplexity(id)}
          options={complexityLevels.map((c) => ({
            id: c.id,
            label: c.label,
            description: c.description,
            badge: `×${c.multiplier.toFixed(2)}`,
          }))}
        />
      </Card>

      <Card>
        <CardHeader
          title="Pages"
          description="Standard pages this project will include."
        />
        <ul className="divide-y divide-(--color-border)">
          {pageTypes.map((page) => (
            <li
              key={page.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-(--color-ink)">
                  {page.label}
                </p>
                <p className="tabular text-xs text-(--color-ink-muted)">
                  {page.hours} hrs each
                </p>
              </div>
              <Stepper
                label={page.label}
                value={pageQuantity(page.id)}
                onChange={(q) => setPageQuantity(page.id, q)}
                max={10}
              />
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-(--color-border) pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-(--color-ink)">
              Custom pages
            </p>
            <button
              type="button"
              onClick={addCustomPage}
              className="rounded-(--radius-token-sm) border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-ink-secondary) transition-colors hover:border-(--color-border-strong) hover:text-(--color-ink)"
            >
              + Add custom page
            </button>
          </div>

          {draft.customPages.length === 0 ? (
            <p className="text-xs text-(--color-ink-muted)">
              For anything not in the standard list — e.g. "Case Studies",
              "Careers".
            </p>
          ) : (
            <ul className="space-y-3">
              {draft.customPages.map((page) => (
                <li
                  key={page.id}
                  className="grid grid-cols-1 items-end gap-3 rounded-(--radius-token-md) border border-(--color-border) p-3 sm:grid-cols-[1fr_auto_auto_auto]"
                >
                  <div>
                    <label
                      className="block text-xs text-(--color-ink-muted)"
                      htmlFor={`cp-name-${page.id}`}
                    >
                      Page name
                    </label>
                    <input
                      id={`cp-name-${page.id}`}
                      type="text"
                      value={page.name}
                      placeholder="e.g. Case Studies"
                      onChange={(e) =>
                        updateCustomPage(page.id, { name: e.target.value })
                      }
                      className="mt-1 w-full rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs text-(--color-ink-muted)"
                      htmlFor={`cp-hours-${page.id}`}
                    >
                      Hours each
                    </label>
                    <input
                      id={`cp-hours-${page.id}`}
                      type="number"
                      min={0}
                      value={page.hoursEach}
                      onChange={(e) =>
                        updateCustomPage(page.id, {
                          hoursEach: Number(e.target.value) || 0,
                        })
                      }
                      className="tabular mt-1 w-20 rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
                    />
                  </div>
                  <Stepper
                    label={`${page.name || "custom page"} quantity`}
                    value={page.quantity}
                    onChange={(q) => updateCustomPage(page.id, { quantity: q })}
                    min={1}
                    max={20}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomPage(page.id)}
                    aria-label={`Remove ${page.name || "custom page"}`}
                    className="justify-self-start rounded-(--radius-token-sm) px-2 py-1.5 text-xs font-medium text-(--color-danger) hover:bg-(--color-danger-soft)"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <FeatureCatalog />

      <Card className="bg-(--color-surface-sunken)">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-(--color-ink)">
            Scope so far{" "}
            <span className="font-normal text-(--color-ink-muted)">
              (before QA &amp; positioning)
            </span>
          </p>
          <p className="tabular text-sm text-(--color-ink-secondary)">
            {formatNumber(scope.baseHours)} base +{" "}
            {formatNumber(scope.pagesHours + scope.customPagesHours)} pages
            {scope.featuresHours > 0 &&
              ` + ${formatNumber(scope.featuresHours)} features`}
            {" × "}
            {scope.complexityMultiplier.toFixed(2)} complexity ={" "}
            <span className="font-semibold text-(--color-ink)">
              {formatNumber(scope.totalHours)} hrs
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
