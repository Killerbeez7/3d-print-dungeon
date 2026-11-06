import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { OPEN_BEFORE_LAUNCH, PRELAUNCH_GATE } from "@/config/siteLaunch";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { readSessionHint } from "@/features/auth/utils/sessionHint";
import { ComingSoonPage } from "../pages/ComingSoonPage";

/**
 * Before launch, only admins and testers see the site; everyone else gets the coming-soon page
 * at whatever address they opened. This hides the site, it doesn't protect data: Firestore and
 * Storage rules still decide what can be read.
 */
export function PrelaunchGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { currentUser, authReady, loading, isAdmin, roles } = useAuth();

  if (!PRELAUNCH_GATE || OPEN_BEFORE_LAUNCH.some((path) => pathname.startsWith(path))) {
    return children;
  }

  if (isAdmin || roles.includes("tester")) {
    return children;
  }

  // Someone was signed in on this browser and their roles aren't known yet: wait a moment
  // rather than flash the coming-soon page at an admin or tester.
  const rolesPending = authReady ? currentUser !== null && loading : readSessionHint() !== null;
  if (rolesPending) {
    return <div className="min-h-dvh bg-page" aria-busy="true" />;
  }

  return <ComingSoonPage />;
}
