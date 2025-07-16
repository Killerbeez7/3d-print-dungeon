import React from "react";
import { useRoutes, Navigate, RouteObject } from "react-router-dom";
import { ROUTES } from "./constants/routeConstants";

import { collectionsRoutes } from "./features/collections/routes/collectionsRouter";
import { artistsRoutes } from "./features/artists/routes/artistsRoutes";
import { eventsRoutes } from "./features/events/routes/eventRoutes";
import { adminRoutes } from "./features/admin/routes/adminRoutes";
import { blogRoutes } from "./features/blog/routes/blogRoutes";
import { marketplaceRoutes } from "./features/marketplace/routes/marketplaceRoutes";
import { printedFiguresRoutes } from "./features/printed-figures/routes/printedFiguresRoutes";
import { searchRoutes } from "./features/search/routes/searchRoutes";
import { homeRoutes } from "./features/home/routes/homeRoutes";
import { maintenanceRoutes } from "./features/maintenance/routes/maintenanceRoutes";

import { businessRoutes } from "./features/business/routes/businessRoutes";
import { forumRoutes } from "./features/forum/routes/forumRoutes";
import { modelsRoutes } from "./features/models/routes/modelsRoutes";
import { settingsRoutes } from "./features/settings/routes/settingsRoutes";

import Layout from "./features/shared/Layout";

export const AppRoutes: React.FC = () => {
    // Aggregate all child routes into a single RouteObject array
    const childRoutes: RouteObject[] = [
        ...maintenanceRoutes,
        ...collectionsRoutes,
        ...artistsRoutes,
        ...eventsRoutes,
        ...blogRoutes,
        ...marketplaceRoutes,
        ...printedFiguresRoutes,
        ...searchRoutes,
        ...homeRoutes,
        ...modelsRoutes,
        ...eventsRoutes,
        ...businessRoutes,
        ...settingsRoutes,
        ...adminRoutes,
        ...forumRoutes,

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
