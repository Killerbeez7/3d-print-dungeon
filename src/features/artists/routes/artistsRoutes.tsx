import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const ArtistsListPage = lazy(() =>
    import("../pages/ArtistsListPage").then((m) => ({ default: m.ArtistsListPage }))
);
const ArtistProfilePage = lazy(() =>
    import("../pages/ArtistProfilePage").then((m) => ({ default: m.ArtistProfilePage }))
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
    {
        path: ROUTES.ARTIST_PROFILE,
        element: withMaintenance(
            <Suspense>
                <ArtistProfilePage />
            </Suspense>
        ),
    },
];
