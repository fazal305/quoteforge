import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { NumberField } from "@/features/calculator-suite/components/ui/NumberField";
import { RadioCardGroup } from "@/features/calculator-suite/components/ui/RadioCardGroup";
import {
  contingencyOptions,
  experienceLevels,
  marketPositioning,
  specializations,
  urgencyLevels,
} from "@/features/calculator-suite/config/pricingConfig";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";

export function PricingPositioning() {
  const draft = useCalculatorStore((s) => s.draft);
  const setExperienceLevel = useCalculatorStore((s) => s.setExperienceLevel);
  const toggleSpecialization = useCalculatorStore(
    (s) => s.toggleSpecialization,
  );
  const setMarketPositioning = useCalculatorStore(
    (s) => s.setMarketPositioning,
  );
  const setUrgency = useCalculatorStore((s) => s.setUrgency);
  const setContingencyPercent = useCalculatorStore(
    (s) => s.setContingencyPercent,
  );
  const setAdditionalRevisionRounds = useCalculatorStore(
    (s) => s.setAdditionalRevisionRounds,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Experience & Specialization"
          description="Adjusts the effective hourly rate used for this specific quote."
        />
        <RadioCardGroup
          ariaLabel="Experience level"
          columns={3}
          value={draft.experienceLevelId}
          onChange={setExperienceLevel}
          options={experienceLevels.map((e) => ({
            id: e.id,
            label: e.label,
            description: e.description,
            badge: `×${e.rateMultiplier.toFixed(2)}`,
          }))}
        />

        <p className="mb-2 mt-5 text-sm font-medium text-(--color-ink)">
          Specializations{" "}
          <span className="font-normal text-(--color-ink-muted)">
            (optional, stack)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => {
            const active = draft.specializationIds.includes(spec.id);
            return (
              <button
                key={spec.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSpecialization(spec.id)}
                title={spec.description}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-(--color-accent) bg-(--color-accent-soft) text-(--color-accent-strong)"
                    : "border-(--color-border) text-(--color-ink-secondary) hover:border-(--color-border-strong)"
                }`}
              >
                {spec.label}{" "}
                <span className="tabular opacity-70">
                  +{Math.round(spec.rateBonus * 100)}%
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Market Positioning"
          description="Not a claim about 'the' market rate — a strategy you choose."
        />
        <RadioCardGroup
          ariaLabel="Market positioning"
          columns={3}
          value={draft.marketPositioningId}
          onChange={(id) => setMarketPositioning(id)}
          options={marketPositioning.map((m) => ({
            id: m.id,
            label: m.label,
            description: m.description,
            badge: `×${m.rateMultiplier.toFixed(2)}`,
          }))}
        />
      </Card>

      <Card>
        <CardHeader
          title="Urgency"
          description="Rush work costs more — it disrupts everything else you're doing."
        />
        <RadioCardGroup
          ariaLabel="Urgency"
          columns={3}
          value={draft.urgencyId}
          onChange={setUrgency}
          options={urgencyLevels.map((u) => ({
            id: u.id,
            label: u.label,
            description: `${u.description} ${u.timelineImpact}`,
            badge: `×${u.multiplier.toFixed(2)}`,
          }))}
        />
      </Card>

      <Card>
        <CardHeader
          title="Contingency & Revisions"
          description="Buffer for the unexpected — communication overhead, integration snags, scope uncertainty."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-(--color-ink)">
              Contingency buffer
            </p>
            <RadioCardGroup
              ariaLabel="Contingency percent"
              columns={3}
              value={
                contingencyOptions.find(
                  (o) => o.percent === draft.contingencyPercent,
                )?.id ?? "custom"
              }
              onChange={(id) => {
                const opt = contingencyOptions.find((o) => o.id === id);
                if (opt) setContingencyPercent(opt.percent);
              }}
              options={contingencyOptions.map((o) => ({
                id: o.id,
                label: o.label,
                description: o.description,
              }))}
            />
          </div>
          <NumberField
            label="Custom contingency"
            value={draft.contingencyPercent}
            onChange={setContingencyPercent}
            suffix="%"
            max={50}
            hint="Overrides the presets above."
          />
        </div>

        <div className="mt-5 border-t border-(--color-border) pt-5">
          <NumberField
            label="Additional revision rounds"
            value={draft.additionalRevisionRounds}
            onChange={setAdditionalRevisionRounds}
            hint="2 rounds are included by default; each extra round adds 4 hrs."
            max={10}
          />
        </div>
      </Card>
    </div>
  );
}
