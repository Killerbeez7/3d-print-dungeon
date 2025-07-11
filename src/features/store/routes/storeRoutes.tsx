import { Featured } from "@/features/store/pages/Featured";
import { NewArrivals } from "@/features/store/pages/NewArrivals";
import { BestSellers } from "@/features/store/pages/BestSellers";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const storeRoutes: RouteObject[] = [
    { path: ROUTES.MARKETPLACE_FEATURED, element: withMaintenance(<Featured />) },
    { path: ROUTES.MARKETPLACE_NEW_ARRIVALS, element: withMaintenance(<NewArrivals />) },
    { path: ROUTES.MARKETPLACE_BEST_SELLERS, element: withMaintenance(<BestSellers />) },
];
