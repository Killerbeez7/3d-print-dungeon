import { Navigate, useRoutes, type RouteObject } from "react-router-dom";

import { ROUTES } from "./constants/routeConstants";

import { homeRoutes } from "./features/home/routes/homeRoutes";
import { userRoutes } from "./features/user/routes/userRoutes";
import { blogRoutes } from "./features/blog/routes/blogRoutes";
import { adminRoutes } from "./features/admin/routes/adminRoutes";
import { forumRoutes } from "./features/forum/routes/forumRoutes";
import { eventsRoutes } from "./features/events/routes/eventRoutes";
import { modelsRoutes } from "./features/models/routes/modelsRoutes";
import { searchRoutes } from "./features/search/routes/searchRoutes";
import { artistsRoutes } from "./features/artists/routes/artistsRoutes";
import { policiesRoutes } from "./features/cookies/routes/policiesRoutes";
import { businessRoutes } from "./features/business/routes/businessRoutes";
import { collectionsRoutes } from "./features/collections/routes/collectionsRoutes";
import { marketplaceRoutes } from "./features/marketplace/routes/marketplaceRoutes";
import { printedFiguresRoutes } from "./features/printed-figures/routes/printedFiguresRoutes";

import Layout from "@/features/shared/Layout";
import { MaintenancePage } from "@/features/maintenance/pages/MaintenancePage";
import { MaintenanceRoute } from "@/routes/guards/MaintenanceRoute";

const mainRoutes: RouteObject[] = [
  ...homeRoutes,
  ...userRoutes,
  ...blogRoutes,
  ...adminRoutes,
  ...forumRoutes,
  ...eventsRoutes,
  ...modelsRoutes,
  ...searchRoutes,
  ...artistsRoutes,
  ...policiesRoutes,
  ...businessRoutes,
  ...collectionsRoutes,
  ...marketplaceRoutes,
  ...printedFiguresRoutes,
  { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
];

const routesConfig: RouteObject[] = [
  {
    path: ROUTES.MAINTENANCE,
    element: <MaintenancePage />,
  },
  {
    element: (
      <MaintenanceRoute>
        <Layout />
      </MaintenanceRoute>
    ),
    children: mainRoutes,
  },
];

export const AppRoutes = () => {
  return useRoutes(routesConfig);
};
