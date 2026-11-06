import { useEffect, useState } from "react";

import { subscribeComingSoon } from "../services/launchSettings";

/** Whether the coming-soon page is switched on; loading until the setting has arrived. */
export function useComingSoon(enabled: boolean): { loading: boolean; comingSoon: boolean } {
  const [state, setState] = useState({ loading: enabled, comingSoon: true });
  useEffect(() => {
    if (!enabled) return;
    // If the setting can't be read, keep the page on: failing closed.
    return subscribeComingSoon(
      (comingSoon) => setState({ loading: false, comingSoon }),
      () => setState({ loading: false, comingSoon: true }),
    );
  }, [enabled]);
  return state;
}
