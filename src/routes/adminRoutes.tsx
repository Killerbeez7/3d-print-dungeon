import { AdminPanel } from "../components/admin/AdminPanel";
import { withProtectedMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject[] = [
    {
        path: ROUTES.ADMIN_PANEL,
        element: withProtectedMaintenance(<AdminPanel />, {
            allowedRoles: ["admin"],
            authRedirect: "/login",
            maintenanceRedirect: "/maintenance",
            fallback: null,
        }),
    },
];
