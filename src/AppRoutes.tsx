import React from "react";
import { useRoutes, Navigate, RouteObject } from "react-router-dom";
import { ROUTES } from "./constants/routeConstants";

import { collectionsRoutes } from "./features/collections/routes/collectionsRoutes";
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
import { policiesRoutes } from "./features/policies/routes/policiesRoutes";
import { userRoutes } from "./features/user/routes/userRoutes";

import Layout from "./features/shared/Layout";

export const AppRoutes: React.FC = () => {
    const mainRoutes: RouteObject[] = [
        ...homeRoutes,
        ...maintenanceRoutes,
        ...collectionsRoutes,
        ...artistsRoutes,
        ...eventsRoutes,
        ...blogRoutes,
        ...marketplaceRoutes,
        ...printedFiguresRoutes,
        ...userRoutes,
        ...searchRoutes,
        ...modelsRoutes,
        ...businessRoutes,
        ...adminRoutes,
        ...forumRoutes,
        ...policiesRoutes,
        { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
    ];

    const routesConfig: RouteObject[] = [
        {
            element: <Layout />,
            children: mainRoutes,
        },
    ];

    const routing = useRoutes(routesConfig);

    return routing;
};
