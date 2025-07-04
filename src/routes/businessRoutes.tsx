import { BulkOrders } from "../components/business/BulkOrders";
import { CustomSolutions } from "../components/business/CustomSolutions";
import { Enterprise } from "../components/business/Enterprise";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const businessRoutes: RouteObject[] = [
    { path: ROUTES.BUSINESS_BULK_ORDERS, element: withMaintenance(<BulkOrders />) },
    {
        path: ROUTES.BUSINESS_CUSTOM_SOLUTIONS,
        element: withMaintenance(<CustomSolutions />),
    },
    { path: ROUTES.BUSINESS_ENTERPRISE_SUITE, element: withMaintenance(<Enterprise />) },
];
