import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { PageLoader } from "@/features/shared/components/Die";

const ArtistsListPage = lazy(() =>
  import("../pages/ArtistsListPage").then((m) => ({ default: m.ArtistsListPage }))
);

export const artistsRoutes: RouteObject[] = [
  {
    path: ROUTES.ARTISTS_LIST,
    element: (
      <Suspense fallback={<PageLoader />}>
        <ArtistsListPage />
      </Suspense>
    ),
  },
];
