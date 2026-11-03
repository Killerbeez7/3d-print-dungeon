import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { PageLoader } from "@/features/shared/components/Die";

const MarketplaceHome = lazy(() =>
  import("../pages/MarketplaceHome").then((m) => ({ default: m.MarketplaceHome }))
);
const Featured = lazy(() =>
  import("../components/Featured").then((m) => ({ default: m.Featured }))
);
const NewArrivals = lazy(() =>
  import("../components/NewArrivals").then((m) => ({ default: m.NewArrivals }))
);
const BestSellers = lazy(() =>
  import("../components/BestSellers").then((m) => ({ default: m.BestSellers }))
);

export const marketplaceRoutes: RouteObject[] = [
  {
    path: "/marketplace",
    element: (
      <Suspense fallback={<PageLoader />}>
        <MarketplaceHome />
      </Suspense>
    ),
  },
  {
    path: ROUTES.MARKETPLACE_FEATURED,
    element: (
      <Suspense fallback={<PageLoader />}>
        <Featured />
      </Suspense>
    ),
  },
  {
    path: ROUTES.MARKETPLACE_NEW_ARRIVALS,
    element: (
      <Suspense fallback={<PageLoader />}>
        <NewArrivals />
      </Suspense>
    ),
  },
  {
    path: ROUTES.MARKETPLACE_BEST_SELLERS,
    element: (
      <Suspense fallback={<PageLoader />}>
        <BestSellers />
      </Suspense>
    ),
  },
];
