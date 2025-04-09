import { Business } from "../components/business/Business";
import { BulkOrders } from "../components/business/BulkOrders";
import { CustomSolutions } from "../components/business/CustomSolutions";
import { Enterprise } from "../components/business/Enterprise";

export const businessRoutes = {
    path: "/business",
    element: <Business />,
    children: [
        {
            path: "bulk-orders",
            element: <BulkOrders />,
        },
        {
            path: "custom-solutions",
            element: <CustomSolutions />,
        },
        {
            path: "enterprise",
            element: <Enterprise />,
        },
    ],
}; 