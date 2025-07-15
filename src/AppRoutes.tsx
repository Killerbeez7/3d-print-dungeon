import React from "react";
import { useRoutes, Navigate, RouteObject } from "react-router-dom";
import { ROUTES } from "./constants/routeConstants";

import { publicRoutes } from "./routes/publicRoutes";
import { collectionsRoutes } from "./features/collections/routes/collectionsRouter";
import { artistsRoutes } from "./features/artists/routes/artistsRoutes";

import { eventsRoutes } from "./features/events/routes/eventRoutes";


import { communityRoutes } from "./routes/communityRoutes";
import { storeRoutes } from "./features/store/routes/storeRoutes";
import { businessRoutes } from "./features/business/routes/businessRoutes";
import { forumRoutes } from "./routes/forumRoutes";
import { modelsRoutes } from "./routes/modelsRoutes";
import { settingsRoutes } from "./features/settings/routes/settingsRoutes";
import { adminRoutes } from "./routes/adminRoutes";

import Layout from "./components/shared/Layout";

export const AppRoutes: React.FC = () => {
    // Aggregate all child routes into a single RouteObject array
    const childRoutes: RouteObject[] = [
        ...publicRoutes,
        ...collectionsRoutes,
        ...artistsRoutes,
        ...eventsRoutes,

        
        ...storeRoutes, // del when done with separating routes
        ...businessRoutes,
        ...forumRoutes,
        ...eventsRoutes,
        ...modelsRoutes,
        ...settingsRoutes,
        ...adminRoutes,
        // fallback for unknown routes
        {
            path: "*",
            element: <Navigate to={ROUTES.HOME} replace />,
        },
    ];

    // Define the top-level route
    const routesConfig: RouteObject[] = [
        {
            path: ROUTES.HOME,
            element: <Layout />,
            children: childRoutes,
        },
    ];

    const routing = useRoutes(routesConfig);

    return routing;
};
