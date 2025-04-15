import { Store } from "../components/store/Store";
import { withMaintenance } from "../helpers/routeHelpers";

export const storeRoutes = [
    {
        path: "/store",
        element: withMaintenance(<Store />),
        children: [
            { path: "", element: <Store /> },
            { path: "featured", element: <Store /> },
            { path: "new", element: <Store /> },
        ],
    },
];
