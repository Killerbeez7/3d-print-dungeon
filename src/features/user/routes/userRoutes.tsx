import { lazy, Suspense } from "react";
import { withMaintenance, withProtectedMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const PublicProfilePage = lazy(() =>
    import("../profile/pages/PublicProfilePage").then((module) => ({
        default: module.PublicProfilePage,
    }))
);

const SettingsPage = lazy(() =>
    import("@/features/user/settings/pages/SettingsPage").then((m) => ({
        default: m.SettingsPage,
    }))
);

const SettingsPageSkeleton = lazy(() =>
    import("@/features/user/settings/components/SettingsPageSkeleton").then((m) => ({
        default: m.SettingsPageSkeleton,
    }))
);

export const userRoutes: RouteObject[] = [
    {
        path: ROUTES.USER_PROFILE,
        element: withMaintenance(
            <Suspense>
                <PublicProfilePage />
            </Suspense>
        ),
    },
    {
        path: ROUTES.USER_SETTINGS,
        element: withProtectedMaintenance(
            <Suspense fallback={<SettingsPageSkeleton />}>
                <SettingsPage />
            </Suspense>
        ),
    },
];
