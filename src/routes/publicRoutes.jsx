import { Home } from "../components/home/Home";
import { MaintenancePage } from "../components/shared/MaintenancePage";
import { DynamicSearch } from "../components/search/DynamicSearch";
import { MaintenanceRoute } from "../routes/MaintenanceRoute";
export const publicRoutes = [
    {
        path: "/maintenance",
        element: <MaintenancePage />,
    },
    {
        path: "/",
        element: (
            <MaintenanceRoute>
                <Home />
            </MaintenanceRoute>
        ),
    },
    {
        path: "/search",
        element: (
            <MaintenanceRoute>
                <DynamicSearch />
            </MaintenanceRoute>
        ),
    },
];
