import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";
import { withProtected } from "@/helpers/routeHelpers";

const LazyAdmin = lazy(() =>
  import("../pages/AdminPage").then((m) => ({ default: m.AdminPage }))
);

export const adminRoutes: RouteObject[] = [
  {
    path: ROUTES.ADMIN_DASHBOARD,
    element: withProtected(
      <Suspense>
        <LazyAdmin />
      </Suspense>,
      {
        allowedRoles: ["admin"],
      }
    ),
  },
];
