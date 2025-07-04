import { Home } from "../components/home/Home";
import { MaintenancePage } from "../components/shared/MaintenancePage";
import { DynamicSearch } from "../components/search/DynamicSearch";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const publicRoutes: RouteObject[] = [
    { path: ROUTES.HOME, element: withMaintenance(<Home />) },
    { path: ROUTES.SEARCH, element: withMaintenance(<DynamicSearch />) },
    { path: ROUTES.MAINTENANCE, element: <MaintenancePage /> },
];
