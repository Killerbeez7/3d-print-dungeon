import { AdminPage } from "../pages/AdminPage";
import { withProtectedMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject[] = [
    {
        path: ROUTES.ADMIN_DASHBOARD,
        element: withProtectedMaintenance(<AdminPage />, {
            allowedRoles: ["admin"],
            authRedirect: "/login",
            maintenanceRedirect: "/maintenance",
            fallback: null,
        }),
    },
];
