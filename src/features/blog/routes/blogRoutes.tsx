import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { PageLoader } from "@/features/shared/components/Die";

const BlogPage = lazy(() =>
  import("../pages/BlogPage").then((m) => ({ default: m.BlogPage }))
);

export const blogRoutes: RouteObject[] = [
  {
    path: ROUTES.BLOG,
    element: (
      <Suspense fallback={<PageLoader />}>
        <BlogPage />
      </Suspense>
    ),
  },
];
