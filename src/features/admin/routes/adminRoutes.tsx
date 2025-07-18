import { lazy, Suspense } from "react";
import { withProtectedMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const LazyAdmin = lazy(() =>
    import("../pages/AdminPage").then((m) => ({ default: m.AdminPage }))
);

export const adminRoutes: RouteObject[] = [
    {
        path: ROUTES.ADMIN_DASHBOARD,
        element: withProtectedMaintenance(
            <Suspense>
                <LazyAdmin />
            </Suspense>,
            {
                allowedRoles: ["admin"],
                authRedirect: "/login",
                maintenanceRedirect: "/maintenance",
                fallback: null,
            }
        ),
    },
];
