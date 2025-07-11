import { ROUTES } from "@/constants/routeConstants";
import { withMaintenance } from "@/helpers/routeHelpers";
import { CollectionsPage } from "@/features/collections/pages/CollectionsPage";

import type { RouteObject } from "react-router-dom";

export const collectionsRoutes: RouteObject[] = [
    { path: ROUTES.COLLECTIONS, element: withMaintenance(<CollectionsPage />) },
];
