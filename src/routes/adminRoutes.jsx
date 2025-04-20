import { AdminPanel } from "../components/admin/AdminPanel";
import { withProtectedMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../config/routeConstants";

export const adminRoutes = [
    {
        path: ROUTES.ADMIN_PANEL,
        element: withProtectedMaintenance(<AdminPanel />, {
            requireAdmin: true,
            authRedirect: "/login",
            maintenanceRedirect: "/maintenance",
            fallback: null,
        }),
    },
];
