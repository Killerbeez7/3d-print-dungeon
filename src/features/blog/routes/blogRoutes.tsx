import { BlogPage } from "../pages/BlogPage";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const blogRoutes: RouteObject[] = [
    { path: ROUTES.BLOG, element: withMaintenance(<BlogPage />) },
];
