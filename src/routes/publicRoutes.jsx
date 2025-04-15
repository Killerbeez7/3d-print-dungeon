import { Home } from "../components/home/Home";
import { MaintenancePage } from "../components/shared/MaintenancePage";
import { DynamicSearch } from "../components/search/DynamicSearch";
import { withMaintenance } from "../helpers/routeHelpers";

export const publicRoutes = [
    {
        path: "/maintenance",
        element: <MaintenancePage />,
    },
    {
        path: "/",
        element: withMaintenance(<Home />),
    },
    {
        path: "/search",
        element: withMaintenance(<DynamicSearch />),
    },
];
