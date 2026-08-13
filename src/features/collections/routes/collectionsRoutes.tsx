import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";

import type { RouteObject } from "react-router-dom";

const CollectionsPage = lazy(() =>
  import("../pages/CollectionsPage").then((module) => {
    return {
      default: module.CollectionsPage,
    };
  })
);

const RisingModelsPage = lazy(() =>
  import("@/features/rising-models/pages/RisingModelsPage").then((module) => {
    return {
      default: module.RisingModelsPage,
    };
  })
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
  {
    path: ROUTES.COLLECTIONS_RISING,
    element: (
      <Suspense>
        <RisingModelsPage />
      </Suspense>
    ),
  },
];
