/**
 * DEVELOPMENT DEFAULTS — your business economics.
 *
 * These are starting values only, based on what you told the assistant
 * during setup (beginner/junior frontend developer, Karachi, Pakistan,
 * targeting mostly international clients, $20/hr desired rate). Every
 * field is editable on the Settings screen and persists to your browser's
 * local storage — nothing here is sent anywhere.
 */

export const defaultBusinessProfile = {
  freelancerName: "Fazal Abbas",
  location: "Karachi, Pakistan",
  experienceLevelId: "junior",
  desiredMonthlyIncomeUsd: 600,
  monthlyExpensesUsd: 30,
  taxRatePercent: 5,
  equipmentMonthlyUsd: 50,
  workspaceMonthlyUsd: 40,
  profitMarginPercent: 20,
  workingHoursPerMonth: 160,
  billableHoursPerMonth: 100,
  desiredHourlyRateUsd: 20,
  primaryCountryId: "pakistan",
  targetMarketCountryId: "other",
};

export const defaultCurrencyPreferences = {
  primaryCurrency: "USD",
  secondaryCurrency: "PKR",
  // Rough fallback only — replaced by a live rate when available. Update
  // this periodically if you keep live rates turned off.
  fallbackUsdToPkr: 280,
  useLiveRates: true,
};

export const defaultPricingPhilosophy = "market_average";

export const defaultBrandingProfile = {
  companyOrFreelancerName: "Fazal Abbas",
  tagline: "Frontend Web Developer",
  email: "fazalabbas2002@gmail.com",
  phone: "",
  website: "https://fazal.is-a.dev/",
  address: "Karachi, Pakistan",
  paymentDetails: "Bank transfer details to be added in Settings.",
  defaultTermsAndConditions:
    "This quotation is valid for the period stated below. Work begins upon receipt of the agreed deposit. " +
    "The price covers the scope described in this document; work outside that scope will be quoted separately. " +
    "Revisions beyond the included rounds are billed at the standard hourly rate.",
  defaultValidityDays: 14,
  defaultRevisionPolicy:
    "2 rounds of revisions included. Additional rounds billed hourly.",
  logoDataUrl: null,
};
