import { Home } from "@/features/home/components/Home";

import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const homeRoutes: RouteObject[] = [
    { path: ROUTES.HOME, element: withMaintenance(<Home />) },
];
