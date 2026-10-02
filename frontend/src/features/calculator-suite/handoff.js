// Bridges a calculated estimate (from the pricing-calculator suite, which
// needs no login) into a real QuoteForge quote (which does, since quotes
// are tied to a Supabase organization/customer). The payload is stashed in
// sessionStorage — surviving a redirect through /login — and consumed once
// by useQuoteBuilder when starting a brand-new quote.
const HANDOFF_KEY = "quoteforge-calculator-handoff";

export function stashCalculatorHandoff({ name, description, unitPrice, notes }) {
  try {
    sessionStorage.setItem(
      HANDOFF_KEY,
      JSON.stringify({ name, description, unitPrice, notes }),
    );
  } catch {
    // sessionStorage unavailable (private mode) — handoff degrades to a
    // manual copy-paste, not a crash.
  }
}

export function consumeCalculatorHandoff() {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
