import { useRoutes, Navigate } from "react-router-dom";
import { ROUTES } from "./config/routeConstants";

// route imports
import { publicRoutes } from "./routes/publicRoutes";
import { businessRoutes } from "./routes/businessRoutes";
import { storeRoutes } from "./routes/storeRoutes";
import { exploreRoutes } from "./routes/exploreRoutes";
import { forumRoutes } from "./routes/forumRoutes";
import { modelsRoutes } from "./routes/modelsRoutes";        // NEW
import { userRoutes } from "./routes/userRoutes";
import { adminRoutes } from "./routes/adminRoutes";

import Layout from "./components/shared/Layout";

export const AppRoutes = () => {
    const routes = useRoutes([
        {
            path: ROUTES.HOME,
            element: <Layout />,
            children: [
                ...publicRoutes,
                ...businessRoutes,
                ...storeRoutes,
                ...exploreRoutes,
                ...forumRoutes,
                ...modelsRoutes,
                ...userRoutes,
                ...adminRoutes,
                { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
            ],
        },
    ]);

    return routes;
};