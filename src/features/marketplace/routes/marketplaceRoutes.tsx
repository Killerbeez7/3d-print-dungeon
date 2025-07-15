import { Featured } from "../components/Featured";
import { NewArrivals } from "../components/NewArrivals";
import { BestSellers } from "../components/BestSellers";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { MarketplaceHome } from "../pages/MarketplaceHome";

export const marketplaceRoutes: RouteObject[] = [
    { path: "/marketplace", element: withMaintenance(<MarketplaceHome />) },
    { path: ROUTES.MARKETPLACE_FEATURED, element: withMaintenance(<Featured />) },
    { path: ROUTES.MARKETPLACE_NEW_ARRIVALS, element: withMaintenance(<NewArrivals />) },
    { path: ROUTES.MARKETPLACE_BEST_SELLERS, element: withMaintenance(<BestSellers />) },
    // Optionally: { path: "/marketplace/product/:productId", element: <ProductPage /> }
];
