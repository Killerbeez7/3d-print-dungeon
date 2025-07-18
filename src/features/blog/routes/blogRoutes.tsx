import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const BlogPage = lazy(() =>
    import("../pages/BlogPage").then((m) => ({ default: m.BlogPage }))
);

export const blogRoutes: RouteObject[] = [
    {
        path: ROUTES.BLOG,
        element: withMaintenance(
            <Suspense>
                <BlogPage />
            </Suspense>
        ),
    },
];
