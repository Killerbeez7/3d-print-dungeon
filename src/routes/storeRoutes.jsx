import { Store } from "../components/store/Store";
import { MaintenanceRoute } from "../routes/MaintenanceRoute";

export const storeRoutes = {
    path: "/store",
    element: (
        <MaintenanceRoute>
            <Store />
        </MaintenanceRoute>
    ),
    children: [
        {
            path: "",
            element: <Store />,
        },
        {
            path: "featured",
            element: <Store />,
        },
        {
            path: "new",
            element: <Store />,
        },
    ],
};
