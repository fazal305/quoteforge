import { useCallback, useEffect, useState } from "react";

import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { fetchUsdToPkrRate } from "@/features/calculator-suite/services/currencyRate";

const STALE_AFTER_MS = 6 * 60 * 60 * 1000; // 6 hours

function isStale(liveRate) {
  if (!liveRate?.fetchedAt) return true;
  return Date.now() - new Date(liveRate.fetchedAt).getTime() > STALE_AFTER_MS;
}

/**
 * Resolves the USD->PKR rate actually used across the app. Prefers a live
 * rate (fetched from a free public API, cached, refreshed when stale) when
 * the user has live rates enabled; always falls back to their configured
 * static rate if the fetch fails or is disabled — the app never blocks or
 * breaks on a network problem here.
 */
export function useExchangeRate() {
  const currency = useBusinessStore((s) => s.currency);
  const liveRate = useBusinessStore((s) => s.liveRate);
  const setLiveRate = useBusinessStore((s) => s.setLiveRate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchUsdToPkrRate();
      setLiveRate(result);
    } catch {
      setError(
        "Could not reach the exchange-rate service. Using your saved fallback rate instead.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [setLiveRate]);

  useEffect(() => {
    if (currency.useLiveRates && isStale(liveRate)) {
      refresh();
    }
    // Only re-check on mount and when the user toggles live rates on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency.useLiveRates]);

  const useLive = currency.useLiveRates && Boolean(liveRate?.rate);
  const usdToPkr = useLive ? liveRate.rate : currency.fallbackUsdToPkr;

  return {
    usdToPkr,
    isLive: useLive,
    liveRate,
    isLoading,
    error,
    refresh,
  };
}
