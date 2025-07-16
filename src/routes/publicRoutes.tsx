import { MaintenancePage } from "../components/shared/MaintenancePage";

import { ROUTES } from "../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const publicRoutes: RouteObject[] = [
    { path: ROUTES.MAINTENANCE, element: <MaintenancePage /> },
];
