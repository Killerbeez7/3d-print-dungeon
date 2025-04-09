import { Store } from "../components/store/Store";

export const storeRoutes = {
    path: "/store",
    element: <Store />,
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