import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";
import { withProtected } from "@/helpers/routeHelpers";
import { PageLoader } from "@/features/shared/components/Die";

const LazyAdmin = lazy(() =>
  import("../pages/AdminPage").then((m) => ({ default: m.AdminPage }))
);

const adminElement = withProtected(
  <Suspense fallback={<PageLoader />}>
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
