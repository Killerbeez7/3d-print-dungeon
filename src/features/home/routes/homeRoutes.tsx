import { HomePage } from "@/features/home/pages/HomePage";

import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const homeRoutes: RouteObject[] = [{ path: ROUTES.HOME, element: <HomePage /> }];
