/**
 * Live USD -> PKR exchange rate via open.er-api.com — a free, no-API-key
 * exchange-rate service. If this fails for any reason (offline, service
 * down, CORS, timeout) the caller falls back to the user's configured
 * static rate. Nothing here is guessed or fabricated — a successful
 * result always carries its real source and timestamp so the UI can
 * show exactly where the number came from.
 */

const ENDPOINT = "https://open.er-api.com/v6/latest/USD";
const FETCH_TIMEOUT_MS = 6000;

export async function fetchUsdToPkrRate() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        `Exchange rate service responded with ${response.status}`,
      );
    }
    const data = await response.json();
    const rate = data?.rates?.PKR;
    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new Error(
        "Exchange rate service response did not include a PKR rate",
      );
    }
    return {
      rate,
      source: "open.er-api.com",
      fetchedAt: new Date().toISOString(),
      // The API's own "last updated" time for the underlying rate data, when present.
      rateDate: data?.time_last_update_utc ?? null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
