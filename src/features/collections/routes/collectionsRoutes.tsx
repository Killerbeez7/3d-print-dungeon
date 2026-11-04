import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";

import type { RouteObject } from "react-router-dom";
import { PageLoader } from "@/features/shared/components/Die";

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

const SavedPage = lazy(() =>
  import("../pages/SavedPage").then((module) => ({ default: module.SavedPage }))
);

const CollectionDetailsPage = lazy(() =>
  import("../pages/CollectionDetailsPage").then((module) => ({
    default: module.CollectionDetailsPage,
  }))
);

export const collectionsRoutes: RouteObject[] = [
  {
    path: ROUTES.COLLECTIONS,
    element: (
      <Suspense fallback={<PageLoader />}>
        <CollectionsPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.COLLECTIONS_RISING,
    element: (
      <Suspense fallback={<PageLoader />}>
        <RisingModelsPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.COLLECTIONS_SAVED,
    element: (
      <Suspense fallback={<PageLoader />}>
        <SavedPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.COLLECTION_DETAILS,
    element: (
      <Suspense fallback={<PageLoader />}>
        <CollectionDetailsPage />
      </Suspense>
    ),
  },
];
