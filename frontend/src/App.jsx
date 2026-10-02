import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Quotes } from "@/pages/Quotes";
import { QuoteBuilder } from "@/pages/QuoteBuilder";
import { QuoteView } from "@/pages/QuoteView";
import { Customers } from "@/pages/Customers";
import { Catalog } from "@/pages/Catalog";
import { Invoices } from "@/pages/Invoices";
import { InvoiceView } from "@/pages/InvoiceView";
import { Settings } from "@/pages/Settings";
import { PublicQuote } from "@/pages/PublicQuote";
import { NotFound } from "@/pages/NotFound";
import { CalculatorAppShell } from "@/features/calculator-suite/components/layout/CalculatorAppShell";
import { PageHeader as CalcPageHeader } from "@/features/calculator-suite/components/layout/PageHeader";
import { CalculatorPage } from "@/features/calculator-suite/calculator/CalculatorPage";
import { HourlyRateCalculator } from "@/features/calculator-suite/calculator/HourlyRateCalculator";
import { AIPricingAssistant } from "@/features/calculator-suite/ai/AIPricingAssistant";
import { ComparisonPage } from "@/features/calculator-suite/compare/ComparisonPage";
import { QuoteHistoryPage } from "@/features/calculator-suite/quotes/QuoteHistoryPage";
import { ClientQuotePage } from "@/features/calculator-suite/quotes/ClientQuotePage";
import { SettingsPage as CalculatorSettingsPage } from "@/features/calculator-suite/settings/SettingsPage";
import { NotFoundPage as CalculatorNotFoundPage } from "@/features/calculator-suite/misc/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/quote/:token" element={<PublicQuote />} />

        {/* Pricing calculator — public, no login required (ported from the
            standalone quote-rate app). "Send to QuoteForge" hands a draft
            quote to /quotes/new via sessionStorage once the user logs in. */}
        <Route path="/calculator" element={<CalculatorAppShell />}>
          <Route index element={<CalculatorPage />} />
          <Route
            path="hourly-rate"
            element={
              <>
                <CalcPageHeader
                  title="Hourly Rate Calculator"
                  description="A sustainable hourly rate from your income target, costs, and realistic billable hours."
                />
                <HourlyRateCalculator />
              </>
            }
          />
          <Route
            path="ai"
            element={
              <>
                <CalcPageHeader
                  title="AI Pricing Assistant"
                  description="Turn a plain-language project description into a structured starting point."
                />
                <AIPricingAssistant />
              </>
            }
          />
          <Route
            path="compare"
            element={
              <>
                <CalcPageHeader
                  title="Basic / Standard / Premium"
                  description="Three ready-to-present scope tiers for a client conversation."
                />
                <ComparisonPage />
              </>
            }
          />
          <Route path="quotes" element={<QuoteHistoryPage />} />
          <Route path="quotes/:id" element={<ClientQuotePage />} />
          <Route
            path="settings"
            element={
              <>
                <CalcPageHeader
                  title="Settings"
                  description="Your business profile, branding, currency, and quote defaults — all editable."
                />
                <CalculatorSettingsPage />
              </>
            }
          />
          <Route path="*" element={<CalculatorNotFoundPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/new" element={<QuoteBuilder />} />
            <Route path="/quotes/:id/edit" element={<QuoteBuilder />} />
            <Route path="/quotes/:id" element={<QuoteView />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceView />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
