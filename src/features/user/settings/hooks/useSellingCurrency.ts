import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { DEFAULT_USER_SETTINGS, settingsService } from "../services/settingsService";
import type { SellingCurrency } from "../types/settings";

/** The signed-in seller's currency for new listings (Settings → Account); euro by default. */
export const useSellingCurrency = (): SellingCurrency => {
  const { currentUser } = useAuth();
  const [currency, setCurrency] = useState<SellingCurrency>(DEFAULT_USER_SETTINGS.currency);

  useEffect(() => {
    if (!currentUser?.uid) return;
    let cancelled = false;
    settingsService
      .getUserSettings(currentUser.uid)
      .then((settings) => {
        if (!cancelled) setCurrency(settings.currency);
      })
      .catch(() => {
        // Keep the default; the upload still works.
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid]);

  return currency;
};

export const CURRENCY_SYMBOL: Record<SellingCurrency, string> = { eur: "€", usd: "$" };
