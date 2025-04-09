import { AdminPanel } from "../components/admin/AdminPanel";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";

export const adminRoutes = [
    {
        path: "/admin-panel",
        element: (
            <ProtectedRoute>
                <AdminPanel />
            </ProtectedRoute>
        ),
    },
];
