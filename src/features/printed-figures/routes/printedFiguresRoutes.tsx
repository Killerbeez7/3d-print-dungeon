import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const PrintedFiguresPage = lazy(() =>
    import("../pages/PrintedFiguresPage").then((m) => ({ default: m.PrintedFiguresPage }))
);

export const printedFiguresRoutes: RouteObject[] = [
    {
        path: ROUTES.PRINTED_FIGURES,
        element: withMaintenance(
            <Suspense>
                <PrintedFiguresPage />
            </Suspense>
        ),
    },
];
