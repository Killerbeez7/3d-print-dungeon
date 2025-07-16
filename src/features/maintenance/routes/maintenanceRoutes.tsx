import { MaintenancePage } from "../pages/MaintenancePage";

import { ROUTES } from "../../../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const maintenanceRoutes: RouteObject[] = [
    { path: ROUTES.MAINTENANCE, element: <MaintenancePage /> },
];
