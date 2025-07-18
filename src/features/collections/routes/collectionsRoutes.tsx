import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const CollectionsPage = lazy(() =>
    import("../pages/CollectionsPage").then((m) => ({ default: m.CollectionsPage }))
);

export const collectionsRoutes: RouteObject[] = [
    {
        path: ROUTES.COLLECTIONS,
        element: withMaintenance(
            <Suspense>
                <CollectionsPage />
            </Suspense>
        ),
    },
];
