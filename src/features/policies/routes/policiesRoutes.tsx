import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const PoliciesHome = lazy(() =>
  import("../pages/PoliciesHome").then((m) => ({
    default: m.PoliciesHome,
  }))
);

const PrivacyPolicyPage = lazy(() =>
  import("../pages/PrivacyPolicyPage").then((m) => ({
    default: m.PrivacyPolicyPage,
  }))
);

const TermsOfUsePage = lazy(() =>
  import("../pages/TermsOfUsePage").then((m) => ({
    default: m.TermsOfUsePage,
  }))
);

const CookiePolicyPage = lazy(() =>
  import("../pages/CookiePolicyPage").then((m) => ({
    default: m.CookiePolicyPage,
  }))
);

const RefundPolicyPage = lazy(() =>
  import("../pages/RefundPolicyPage").then((m) => ({
    default: m.RefundPolicyPage,
  }))
);

export const policiesRoutes: RouteObject[] = [
  {
    path: ROUTES.POLICIES,
    element: (
      <Suspense>
        <PoliciesHome />
      </Suspense>
    ),
  },
  {
    path: ROUTES.PRIVACY_POLICY,
    element: (
      <Suspense>
        <PrivacyPolicyPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.TERMS_OF_USE,
    element: (
      <Suspense>
        <TermsOfUsePage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.COOKIE_POLICY,
    element: (
      <Suspense>
        <CookiePolicyPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.REFUND_POLICY,
    element: (
      <Suspense>
        <RefundPolicyPage />
      </Suspense>
    ),
  },
];
