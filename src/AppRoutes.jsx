import { useRoutes, Navigate } from "react-router-dom";
import { ROUTES } from "./config/routeConstants";

//routes imports
import { publicRoutes } from "./routes/publicRoutes";
import { businessRoutes } from "./routes/businessRoutes";
import { storeRoutes } from "./routes/storeRoutes";
import { exploreRoutes } from "./routes/exploreRoutes";
import { forumRoutes } from "./routes/forumRoutes";
import { modelRoutes } from "./routes/modelRoutes";
import { userRoutes } from "./routes/userRoutes";
import { adminRoutes } from "./routes/adminRoutes";

import Layout from "./components/shared/Layout";

// Route metadata
const routeMetadata = {
    public: {
        name: "Public Routes",
        description: "Routes accessible to all users",
        routes: publicRoutes,
    },
    business: {
        name: "Business Routes",
        description: "Routes for business-related features",
        routes: businessRoutes,
    },
    store: {
        name: "Store Routes",
        description: "Routes for the online store",
        routes: storeRoutes,
    },
    explore: {
        name: "Explore Routes",
        description: "Routes for exploring content",
        routes: exploreRoutes,
    },
    forum: {
        name: "Forum Routes",
        description: "Routes for community discussions",
        routes: forumRoutes,
    },
    model: {
        name: "Model Routes",
        description: "Routes for 3D model management",
        routes: modelRoutes,
    },
    user: {
        name: "User Routes",
        description: "Routes for user-specific features",
        routes: userRoutes,
    },
    admin: {
        name: "Admin Routes",
        description: "Routes for administrative features",
        routes: adminRoutes,
    },
};

export const AppRoutes = () => {
    const routes = useRoutes([
        {
            path: ROUTES.HOME,
            element: <Layout />,
            children: [
                ...Object.values(routeMetadata).flatMap((group) => group.routes),
                { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
            ],
        },
    ]);

    return routes;
};
