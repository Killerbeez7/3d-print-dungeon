import { DynamicSearch } from "@/features/search/components/DynamicSearch";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const searchRoutes: RouteObject[] = [
    { path: ROUTES.SEARCH, element: withMaintenance(<DynamicSearch />) },
];
