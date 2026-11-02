import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";
import { withProtected } from "@/helpers/routeHelpers";

const LazyAdmin = lazy(() =>
  import("../pages/AdminPage").then((m) => ({ default: m.AdminPage }))
);

const adminElement = withProtected(
  <Suspense>
    <LazyAdmin />
  </Suspense>,
  {
    allowedRoles: ["admin"],
  }
);

export const adminRoutes: RouteObject[] = [
  { path: ROUTES.ADMIN_DASHBOARD, element: adminElement },
  { path: `${ROUTES.ADMIN_DASHBOARD}/:section`, element: adminElement },
];
