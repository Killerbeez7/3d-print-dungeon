import { Home } from "../components/home/Home";
import { MaintenancePage } from "../components/shared/MaintenancePage";
import { DynamicSearch } from "../components/search/DynamicSearch";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../config/routeConstants";

export const publicRoutes = [
    { path: ROUTES.HOME, element: withMaintenance(<Home />) },
    { path: ROUTES.SEARCH, element: withMaintenance(<DynamicSearch />) },
    { path: ROUTES.MAINTENANCE, element: <MaintenancePage /> },
];
