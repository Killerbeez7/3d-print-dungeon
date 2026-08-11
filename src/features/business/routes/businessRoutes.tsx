import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const BulkOrders = lazy(() =>
  import("../components/BulkOrders").then((m) => ({ default: m.BulkOrders }))
);
const CustomSolutions = lazy(() =>
  import("../components/CustomSolutions").then((m) => ({ default: m.CustomSolutions }))
);
const Enterprise = lazy(() =>
  import("../components/Enterprise").then((m) => ({ default: m.Enterprise }))
);

export const businessRoutes: RouteObject[] = [
  {
    path: ROUTES.BUSINESS_BULK_ORDERS,
    element: (
      <Suspense>
        <BulkOrders />
      </Suspense>
    ),
  },
  {
    path: ROUTES.BUSINESS_CUSTOM_SOLUTIONS,
    element: (
      <Suspense>
        <CustomSolutions />
      </Suspense>
    ),
  },
  {
    path: ROUTES.BUSINESS_ENTERPRISE_SUITE,
    element: (
      <Suspense>
        <Enterprise />
      </Suspense>
    ),
  },
];
