import { useRoutes, Navigate } from "react-router-dom";
import { ROUTES } from "./constants/routeConstants";

import { publicRoutes } from "./routes/publicRoutes";
import { exploreRoutes } from "./routes/exploreRoutes";
import { communityRoutes } from "./routes/communityRoutes";
import { storeRoutes } from "./routes/storeRoutes";
import { businessRoutes } from "./routes/businessRoutes";
import { forumRoutes } from "./routes/forumRoutes";
import { eventsRoutes } from "./routes/eventsRoutes";
import { modelsRoutes } from "./routes/modelsRoutes";
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
                ...exploreRoutes,
                ...communityRoutes,
                ...storeRoutes,
                ...businessRoutes,
                ...forumRoutes,
                ...eventsRoutes,
                ...modelsRoutes,
                ...userRoutes,
                ...adminRoutes,
                { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
            ],
        },
    ]);
    return routes;
};
