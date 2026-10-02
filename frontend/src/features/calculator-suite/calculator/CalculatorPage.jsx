import { PageHeader } from "@/features/calculator-suite/components/layout/PageHeader";
import { OptionalServices } from "@/features/calculator-suite/calculator/OptionalServices";
import { PricingPositioning } from "@/features/calculator-suite/calculator/PricingPositioning";
import { ProjectScopeCalculator } from "@/features/calculator-suite/calculator/ProjectScopeCalculator";
import { QuoteSummary } from "@/features/calculator-suite/calculator/QuoteSummary";
import { QuoteBuilderPanel } from "@/features/calculator-suite/quotes/QuoteBuilderPanel";

export function CalculatorPage() {
  return (
    <>
      <PageHeader
        title="Project Calculator"
        description="Scope, features, and positioning — building a transparent, structured estimate."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ProjectScopeCalculator />
          <PricingPositioning />
          <OptionalServices />
          <QuoteBuilderPanel />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <QuoteSummary />
        </div>
      </div>
    </>
  );
}
