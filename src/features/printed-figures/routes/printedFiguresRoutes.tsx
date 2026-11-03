import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { PageLoader } from "@/features/shared/components/Die";

const PrintedFiguresPage = lazy(() =>
  import("../pages/PrintedFiguresPage").then((m) => ({ default: m.PrintedFiguresPage }))
);

export const printedFiguresRoutes: RouteObject[] = [
  {
    path: ROUTES.PRINTED_FIGURES,
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrintedFiguresPage />
      </Suspense>
    ),
  },
];
