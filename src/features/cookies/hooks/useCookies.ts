import { useContext } from "react";
import { CookiesContext } from "../context/CookiesContext";
import type { CookiesContextValue } from "../types/cookies";

export function useCookies(): CookiesContextValue {
  const context = useContext(CookiesContext);

  if (!context) {
    throw new Error("useCookies must be used within a CookiesProvider");
  }

  return context;
}
