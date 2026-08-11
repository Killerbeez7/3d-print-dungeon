import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const CollectionsPage = lazy(() =>
  import("../pages/CollectionsPage").then((m) => ({ default: m.CollectionsPage }))
);

export const collectionsRoutes: RouteObject[] = [
  {
    path: ROUTES.COLLECTIONS,
    element: (
      <Suspense>
        <CollectionsPage />
      </Suspense>
    ),
  },
];
