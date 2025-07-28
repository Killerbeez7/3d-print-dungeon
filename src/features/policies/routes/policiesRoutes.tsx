import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

// Lazy load policy pages
const PoliciesHome = lazy(() =>
    import("../pages/PoliciesHome").then((m) => ({ default: m.PoliciesHome }))
);
const PrivacyPolicyPage = lazy(() =>
    import("../pages/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsOfUsePage = lazy(() =>
    import("../pages/TermsOfUsePage").then((m) => ({ default: m.TermsOfUsePage }))
);
const CookiePolicyPage = lazy(() =>
    import("../pages/CookiePolicyPage").then((m) => ({ default: m.CookiePolicyPage }))
);
const RefundPolicyPage = lazy(() =>
    import("../pages/RefundPolicyPage").then((m) => ({ default: m.RefundPolicyPage }))
);

export const policiesRoutes: RouteObject[] = [
    {
        path: ROUTES.POLICIES,
        element: withMaintenance(
            <Suspense>
                <PoliciesHome />
            </Suspense>
        ),
    },
    {
        path: ROUTES.PRIVACY_POLICY,
        element: withMaintenance(
            <Suspense>
                <PrivacyPolicyPage />
            </Suspense>
        ),
    },
    {
        path: ROUTES.TERMS_OF_USE,
        element: withMaintenance(
            <Suspense>
                <TermsOfUsePage />
            </Suspense>
        ),
    },
    {
        path: ROUTES.COOKIE_POLICY,
        element: withMaintenance(
            <Suspense>
                <CookiePolicyPage />
            </Suspense>
        ),
    },
    {
        path: ROUTES.REFUND_POLICY,
        element: withMaintenance(
            <Suspense>
                <RefundPolicyPage />
            </Suspense>
        ),
    },
];
