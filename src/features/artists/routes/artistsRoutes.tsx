import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const ArtistsListPage = lazy(() =>
    import("../pages/ArtistsListPage").then((m) => ({ default: m.ArtistsListPage }))
);

export const artistsRoutes: RouteObject[] = [
    {
        path: ROUTES.ARTISTS_LIST,
        element: withMaintenance(
            <Suspense>
                <ArtistsListPage />
            </Suspense>
        ),
    },
];
