import { useNavigate } from "react-router-dom";

import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { RadioCardGroup } from "@/features/calculator-suite/components/ui/RadioCardGroup";
import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";
import { useQuoteHistoryStore } from "@/features/calculator-suite/store/quoteHistoryStore";
import { formatCurrency } from "@/features/calculator-suite/utils/format";
import {
  getPaymentMilestones,
  PAYMENT_STRUCTURE_LABELS,
} from "@/features/calculator-suite/utils/paymentStructure";
import { calculatePricing } from "@/features/calculator-suite/utils/pricingEngine";

const PAYMENT_OPTIONS = [
  {
    id: "100_upfront",
    description: "Full payment before work begins. Lowest risk to you.",
  },
  {
    id: "50_50",
    description:
      "Half upfront, half on delivery. Common for small-to-mid projects.",
  },
  {
    id: "30_40_30",
    description:
      "Deposit, midpoint milestone, final payment. Good for longer builds.",
  },
  {
    id: "custom",
    description:
      "Define your own milestones when you generate the client's quote.",
  },
];

export function QuoteBuilderPanel() {
  const navigate = useNavigate();
  const draft = useCalculatorStore((s) => s.draft);
  const setProjectTitle = useCalculatorStore((s) => s.setProjectTitle);
  const setClientName = useCalculatorStore((s) => s.setClientName);
  const setPaymentStructure = useCalculatorStore((s) => s.setPaymentStructure);
  const businessProfile = useBusinessStore((s) => s.profile);
  const saveQuote = useQuoteHistoryStore((s) => s.saveQuote);

  const pricing = calculatePricing(draft, businessProfile);
  const milestones = getPaymentMilestones(
    draft.paymentStructure,
    pricing.recommendedQuote,
  );

  const handleSave = () => {
    saveQuote({
      projectTitle: draft.projectTitle,
      clientName: draft.clientName,
      draft,
      pricing: {
        recommendedQuote: pricing.recommendedQuote,
        minimumQuote: pricing.minimumQuote,
        premiumQuote: pricing.premiumQuote,
        totalHours: pricing.totalHours,
        estimatedWeeksRange: pricing.estimatedWeeksRange,
        effectiveHourlyRate: pricing.effectiveHourlyRate,
        currency: "USD",
      },
    });
    navigate("/quotes");
  };

  return (
    <Card>
      <CardHeader
        title="Quote Details"
        description="Who this is for, and how you'll get paid."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="project-title"
            className="block text-sm font-medium text-(--color-ink)"
          >
            Project title
          </label>
          <input
            id="project-title"
            type="text"
            value={draft.projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. Restaurant Website with Online Ordering"
            className="mt-1.5 w-full rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
        </div>
        <div>
          <label
            htmlFor="client-name"
            className="block text-sm font-medium text-(--color-ink)"
          >
            Client name
          </label>
          <input
            id="client-name"
            type="text"
            value={draft.clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Al-Madina Restaurant"
            className="mt-1.5 w-full rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-(--color-ink)">
          Payment structure
        </p>
        <RadioCardGroup
          ariaLabel="Payment structure"
          columns={2}
          value={draft.paymentStructure}
          onChange={(id) => setPaymentStructure(id)}
          options={PAYMENT_OPTIONS.map((o) => ({
            id: o.id,
            label: PAYMENT_STRUCTURE_LABELS[o.id],
            description: o.description,
          }))}
        />
      </div>

      <div className="mt-4 rounded-(--radius-token-md) bg-(--color-surface-sunken) p-4">
        <ul className="space-y-1.5 text-sm">
          {milestones.map((m) => (
            <li key={m.label} className="flex justify-between gap-4">
              <span className="text-(--color-ink-secondary)">
                {m.label}{" "}
                <span className="tabular text-(--color-ink-muted)">
                  ({m.percent}%)
                </span>
              </span>
              <span className="tabular font-medium text-(--color-ink)">
                {formatCurrency(m.amount, "USD", 0)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-(--radius-token-sm) bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent-ink) transition-opacity hover:opacity-90"
        >
          Save Quote
        </button>
      </div>
    </Card>
  );
}
