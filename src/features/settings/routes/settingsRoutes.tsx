import { lazy, Suspense } from "react";
import { withProtectedMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { SettingsPageSkeleton } from "../components/SettingsPageSkeleton";

const SettingsPage = lazy(() =>
    import("../pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

export const settingsRoutes: RouteObject[] = [
    {
        path: ROUTES.SETTINGS,
        element: withProtectedMaintenance(
            <Suspense fallback={<SettingsPageSkeleton />}>
                <SettingsPage />
            </Suspense>
        ),
    },
];
