import { Home } from "../components/home/Home";
import { MaintenancePage } from "../components/shared/MaintenancePage";
import { DynamicSearch } from "../components/search/DynamicSearch";

export const publicRoutes = [
    {
        path: "/maintenance",
        element: <MaintenancePage />,
    },
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/search",
        element: <DynamicSearch />,
    },
];
