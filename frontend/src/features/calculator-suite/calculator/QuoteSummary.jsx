import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/features/calculator-suite/components/ui/Card";
import { BREAKDOWN_CATEGORY_LABELS } from "@/features/calculator-suite/config/pricingConfig";
import { useExchangeRate } from "@/features/calculator-suite/hooks/useExchangeRate";
import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";
import { formatCurrency, formatNumber, formatPercent } from "@/features/calculator-suite/utils/format";
import {
  CADENCE_SUFFIX,
  computeOptionalServices,
} from "@/features/calculator-suite/utils/optionalServices";
import { calculatePricing } from "@/features/calculator-suite/utils/pricingEngine";
import { stashCalculatorHandoff } from "@/features/calculator-suite/handoff";
import { useAuthStore } from "@/store/auth";

const CONFIDENCE_STYLES = {
  high: "bg-(--color-success-soft) text-(--color-success)",
  medium: "bg-(--color-warning-soft) text-(--color-warning)",
  low: "bg-(--color-danger-soft) text-(--color-danger)",
};

export function QuoteSummary() {
  const draft = useCalculatorStore((s) => s.draft);
  const businessProfile = useBusinessStore((s) => s.profile);
  const currency = useBusinessStore((s) => s.currency);
  const [showDetail, setShowDetail] = useState(false);
  const { usdToPkr, isLive } = useExchangeRate();
  const navigate = useNavigate();
  const authStatus = useAuthStore((s) => s.status);

  const result = calculatePricing(draft, businessProfile);
  const optional = computeOptionalServices(draft, result.effectiveHourlyRate);
  const showPkr =
    currency.primaryCurrency === "PKR" || currency.secondaryCurrency === "PKR";
  const toPkr = (usd) => usd * usdToPkr;
  const hasOptionalServices =
    optional.maintenance || optional.hostingItems.length > 0;

  function handleSendToQuoteForge() {
    stashCalculatorHandoff({
      name: draft.projectTitle || "Project estimate",
      description: `Calculated via the pricing calculator — ${formatNumber(result.totalHours)} estimated hours, ${result.estimatedWeeksRange.min}–${result.estimatedWeeksRange.max} week timeline.`,
      unitPrice: Number(result.recommendedQuote.toFixed(2)),
      notes: `Estimate range: ${formatCurrency(result.minimumQuote, "USD", 0)} – ${formatCurrency(result.premiumQuote, "USD", 0)} (${result.confidence} confidence).`,
    });
    navigate(
      authStatus === "authenticated" ? "/quotes/new" : "/login?next=/quotes/new",
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-(--color-accent)/30 bg-(--color-accent-soft)">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-(--color-accent-strong)">
            Recommended Quote
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CONFIDENCE_STYLES[result.confidence]}`}
          >
            {result.confidence} confidence
          </span>
        </div>
        <p className="tabular mt-2 font-display text-3xl font-semibold text-(--color-ink)">
          {formatCurrency(result.recommendedQuote, "USD", 0)}
        </p>
        {showPkr && (
          <p className="tabular mt-1 text-sm text-(--color-ink-secondary)">
            ≈ {formatCurrency(toPkr(result.recommendedQuote), "PKR", 0)}{" "}
            <span className="text-xs text-(--color-ink-muted)">
              ({isLive ? "live rate" : "fallback rate"})
            </span>
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-(--color-border) pt-4 text-xs">
          <div>
            <p className="text-(--color-ink-muted)">Minimum</p>
            <p className="tabular mt-0.5 font-medium text-(--color-ink)">
              {formatCurrency(result.minimumQuote, "USD", 0)}
            </p>
          </div>
          <div>
            <p className="text-(--color-ink-muted)">Premium</p>
            <p className="tabular mt-0.5 font-medium text-(--color-ink)">
              {formatCurrency(result.premiumQuote, "USD", 0)}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-(--color-border) pt-4 text-xs text-(--color-ink-secondary)">
          <div className="flex justify-between">
            <span>Estimated hours</span>
            <span className="tabular font-medium text-(--color-ink)">
              {formatNumber(result.totalHours)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated timeline</span>
            <span className="tabular font-medium text-(--color-ink)">
              {result.estimatedWeeksRange.min}–{result.estimatedWeeksRange.max}{" "}
              weeks
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendToQuoteForge}
          className="mt-4 w-full rounded-(--radius-token-md) bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-(--color-accent-ink) transition-colors duration-(--duration-fast) hover:bg-(--color-accent-strong)"
        >
          Send to QuoteForge →
        </button>
        <p className="mt-1.5 text-center text-[11px] text-(--color-ink-muted)">
          Starts a real quote in QuoteForge with this estimate pre-filled
          {authStatus !== "authenticated" && " (you'll need to log in)"}.
        </p>
      </Card>

      {hasOptionalServices && (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-(--color-ink-muted)">
            Optional Services
          </p>
          <p className="mb-3 mt-1 text-xs text-(--color-ink-secondary)">
            Priced separately — not included in the quote above.
          </p>
          <ul className="space-y-1.5 text-sm">
            {optional.maintenance && (
              <li className="flex justify-between">
                <span className="text-(--color-ink-secondary)">
                  {optional.maintenance.label}
                </span>
                <span className="tabular font-medium text-(--color-ink)">
                  {formatCurrency(optional.maintenance.cost, "USD", 0)}/
                  {CADENCE_SUFFIX[optional.maintenance.cadence]}
                </span>
              </li>
            )}
            {optional.oneTimeTotal > 0 && (
              <li className="flex justify-between">
                <span className="text-(--color-ink-secondary)">
                  Hosting/domain (one-time)
                </span>
                <span className="tabular font-medium text-(--color-ink)">
                  {formatCurrency(optional.oneTimeTotal, "USD", 0)}
                </span>
              </li>
            )}
            {optional.monthlyTotal > 0 && (
              <li className="flex justify-between">
                <span className="text-(--color-ink-secondary)">
                  Hosting (monthly)
                </span>
                <span className="tabular font-medium text-(--color-ink)">
                  {formatCurrency(optional.monthlyTotal, "USD", 0)}/mo
                </span>
              </li>
            )}
            {optional.annualTotal > 0 && (
              <li className="flex justify-between">
                <span className="text-(--color-ink-secondary)">
                  Hosting/domain (annual)
                </span>
                <span className="tabular font-medium text-(--color-ink)">
                  {formatCurrency(optional.annualTotal, "USD", 0)}/yr
                </span>
              </li>
            )}
          </ul>
        </Card>
      )}

      <Card>
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="flex w-full items-center justify-between text-left text-sm font-medium text-(--color-ink)"
          aria-expanded={showDetail}
        >
          How was this calculated?
          <span className="text-(--color-ink-muted)">
            {showDetail ? "−" : "+"}
          </span>
        </button>

        {showDetail && (
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-(--color-ink-muted)">
                By category
              </p>
              <ul className="space-y-1.5">
                {result.breakdownLines.map((line) => (
                  <li
                    key={line.category}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-(--color-ink-secondary)">
                      {BREAKDOWN_CATEGORY_LABELS[line.category]}
                    </span>
                    <span className="tabular text-(--color-ink)">
                      {formatCurrency(line.cost, "USD", 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="space-y-1.5 border-t border-(--color-border) pt-3 text-xs">
              <li className="flex justify-between">
                <span className="text-(--color-ink-secondary)">
                  Effective hourly rate
                </span>
                <span className="tabular text-(--color-ink)">
                  {formatCurrency(result.effectiveHourlyRate, "USD", 2)}/hr
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-(--color-ink-secondary)">
                  Development subtotal
                </span>
                <span className="tabular text-(--color-ink)">
                  {formatCurrency(result.devCost, "USD", 0)}
                </span>
              </li>
              {result.urgencyAddOn > 0 && (
                <li className="flex justify-between">
                  <span className="text-(--color-ink-secondary)">
                    Urgency (+
                    {formatPercent((result.urgencyMultiplier - 1) * 100)})
                  </span>
                  <span className="tabular text-(--color-ink)">
                    +{formatCurrency(result.urgencyAddOn, "USD", 0)}
                  </span>
                </li>
              )}
              {result.revisionsCost > 0 && (
                <li className="flex justify-between">
                  <span className="text-(--color-ink-secondary)">
                    Extra revisions ({result.additionalRevisionHours} hrs)
                  </span>
                  <span className="tabular text-(--color-ink)">
                    +{formatCurrency(result.revisionsCost, "USD", 0)}
                  </span>
                </li>
              )}
              <li className="flex justify-between font-medium">
                <span className="text-(--color-ink)">Subtotal</span>
                <span className="tabular text-(--color-ink)">
                  {formatCurrency(result.subtotal, "USD", 0)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-(--color-ink-secondary)">
                  Contingency ({formatPercent(result.contingencyPercent)})
                </span>
                <span className="tabular text-(--color-ink)">
                  +{formatCurrency(result.contingencyAmount, "USD", 0)}
                </span>
              </li>
              <li className="flex justify-between border-t border-(--color-border) pt-1.5 text-sm font-semibold">
                <span className="text-(--color-ink)">Estimated Total</span>
                <span className="tabular text-(--color-ink)">
                  {formatCurrency(result.estimatedTotal, "USD", 0)}
                </span>
              </li>
            </ul>

            <p className="text-xs leading-relaxed text-(--color-ink-muted)">
              Nothing here is an external market benchmark — it's your own
              configured hours, rate, and multipliers, applied consistently.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
