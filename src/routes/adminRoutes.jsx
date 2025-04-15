import { AdminPanel } from "../components/admin/AdminPanel";
import { withProtectedMaintenance } from "../helpers/routeHelpers";

export const adminRoutes = [
    {
        path: "/admin-panel",
        element: withProtectedMaintenance(<AdminPanel />, {
            requireAdmin: true,
            authRedirect: "/login",
            maintenanceRedirect: "/maintenance",
            fallback: null,
        }),
    },
];
