import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { NumberField } from "@/features/calculator-suite/components/ui/NumberField";
import { useExchangeRate } from "@/features/calculator-suite/hooks/useExchangeRate";
import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { formatCurrency, formatNumber, formatPercent } from "@/features/calculator-suite/utils/format";
import { calculateHourlyRate } from "@/features/calculator-suite/utils/hourlyRate";

export function HourlyRateCalculator() {
  const profile = useBusinessStore((s) => s.profile);
  const currency = useBusinessStore((s) => s.currency);
  const updateProfile = useBusinessStore((s) => s.updateProfile);
  const { usdToPkr, isLive } = useExchangeRate();

  const result = calculateHourlyRate(profile);
  const showPkr =
    currency.primaryCurrency === "PKR" || currency.secondaryCurrency === "PKR";
  const toPkr = (usd) => usd * usdToPkr;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Income & Costs"
            description="What you need to earn, and what it costs you to work."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberField
              label="Desired monthly income"
              value={profile.desiredMonthlyIncomeUsd}
              onChange={(v) => updateProfile({ desiredMonthlyIncomeUsd: v })}
              suffix="USD"
              hint="Your take-home target, after business costs."
            />
            <NumberField
              label="Monthly expenses"
              value={profile.monthlyExpensesUsd}
              onChange={(v) => updateProfile({ monthlyExpensesUsd: v })}
              suffix="USD"
              hint="Software, subscriptions, misc."
            />
            <NumberField
              label="Equipment (amortized)"
              value={profile.equipmentMonthlyUsd}
              onChange={(v) => updateProfile({ equipmentMonthlyUsd: v })}
              suffix="USD"
              hint="Laptop/hardware cost spread monthly."
            />
            <NumberField
              label="Workspace / internet"
              value={profile.workspaceMonthlyUsd}
              onChange={(v) => updateProfile({ workspaceMonthlyUsd: v })}
              suffix="USD"
            />
            <NumberField
              label="Estimated tax rate"
              value={profile.taxRatePercent}
              onChange={(v) => updateProfile({ taxRatePercent: v })}
              suffix="%"
              max={95}
              hint="A configurable estimate — not tax advice."
            />
            <NumberField
              label="Target profit margin"
              value={profile.profitMarginPercent}
              onChange={(v) => updateProfile({ profitMarginPercent: v })}
              suffix="%"
              hint="Buffer above your minimum sustainable rate."
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Time"
            description="Working hours are not the same as billable hours."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberField
              label="Working hours / month"
              value={profile.workingHoursPerMonth}
              onChange={(v) => updateProfile({ workingHoursPerMonth: v })}
              suffix="hrs"
              hint="Total hours realistically available."
            />
            <NumberField
              label="Billable hours / month"
              value={profile.billableHoursPerMonth}
              onChange={(v) => updateProfile({ billableHoursPerMonth: v })}
              suffix="hrs"
              hint="Hours you can actually invoice a client for."
            />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-(--radius-token-md) bg-(--color-surface-sunken) px-4 py-3 text-sm">
            <span className="text-(--color-ink-secondary)">
              {formatNumber(result.nonBillableHoursPerMonth)} hrs/month go to
              admin, sales, learning, and downtime
            </span>
            <span className="tabular font-medium text-(--color-ink)">
              {formatPercent(result.billableRatioPercent)} billable
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader title="How this was calculated" />
          <ol className="space-y-3">
            {result.steps.map((step, i) => (
              <li
                key={step.label}
                className="flex items-baseline justify-between gap-4 border-b border-(--color-border) pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-(--color-ink-secondary)">
                  <span className="tabular mr-2 text-(--color-ink-muted)">
                    {i + 1}.
                  </span>
                  {step.label}
                  {step.note && (
                    <span className="block pl-5 text-xs text-(--color-ink-muted)">
                      {step.note}
                    </span>
                  )}
                </span>
                <span className="tabular shrink-0 text-sm font-medium text-(--color-ink)">
                  {formatCurrency(step.value, "USD", 2)}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="border-(--color-accent)/30 bg-(--color-accent-soft)">
          <p className="text-xs font-medium uppercase tracking-wide text-(--color-accent-strong)">
            Recommended Hourly Rate
          </p>
          <p className="tabular mt-2 font-display text-4xl font-semibold text-(--color-ink)">
            {formatCurrency(result.recommendedHourlyRate, "USD", 2)}
          </p>
          {showPkr && (
            <p className="tabular mt-1 text-sm text-(--color-ink-secondary)">
              ≈ {formatCurrency(toPkr(result.recommendedHourlyRate), "PKR", 0)}{" "}
              <span className="text-xs text-(--color-ink-muted)">
                ({isLive ? "live rate" : "fallback rate"})
              </span>
            </p>
          )}

          <div className="mt-5 space-y-2 border-t border-(--color-border) pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-(--color-ink-secondary)">
                Minimum sustainable
              </span>
              <span className="tabular font-medium text-(--color-ink)">
                {formatCurrency(result.minimumHourlyRate, "USD", 2)}/hr
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-ink-secondary)">
                Your stated desired rate
              </span>
              <span className="tabular font-medium text-(--color-ink)">
                {formatCurrency(profile.desiredHourlyRateUsd, "USD", 2)}/hr
              </span>
            </div>
          </div>

          {result.recommendedHourlyRate > profile.desiredHourlyRateUsd && (
            <p className="mt-4 rounded-(--radius-token-sm) bg-(--color-warning-soft) px-3 py-2 text-xs text-(--color-warning)">
              Your desired rate is below what's needed to sustainably cover your
              income target, costs, tax, and margin at{" "}
              {profile.billableHoursPerMonth} billable hrs/month.
            </p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-(--color-ink-muted)">
            This is a planning estimate based on numbers you control — not tax
            or financial advice, and not a claim about market rates.
          </p>
        </Card>
      </div>
    </div>
  );
}
