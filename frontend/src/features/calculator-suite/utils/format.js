const CURRENCY_LOCALE = {
  USD: "en-US",
  PKR: "en-PK",
};

export function formatCurrency(amount, currency, fractionDigits = 0) {
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    // Fallback if the environment lacks the currency's Intl data.
    return `${currency} ${amount.toFixed(fractionDigits)}`;
  }
}

export function formatNumber(value, fractionDigits = 0) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value, fractionDigits = 0) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(fractionDigits)}%`;
}

export function convertUsdToPkr(amountUsd, usdToPkrRate) {
  return amountUsd * usdToPkrRate;
}
