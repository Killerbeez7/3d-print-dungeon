import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

import { ROUTES } from "@/constants/routeConstants";
import { withProtected } from "@/helpers/routeHelpers";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";

const ModelUpload = lazy(() =>
  import("../pages/ModelUpload").then((m) => ({ default: m.ModelUpload }))
);

const ModelPage = lazy(() =>
  import("../pages/ModelPage").then((m) => ({ default: m.ModelPage }))
);

const ModelEdit = lazy(() =>
  import("../pages/ModelEdit").then((m) => ({ default: m.ModelEdit }))
);

export const modelsRoutes: RouteObject[] = [
  {
    path: ROUTES.MODEL_UPLOAD,
    element: withProtected(
      <Suspense fallback={<RouteLoadingIndicator />}>
        <ModelUpload />
      </Suspense>
    ),
  },
  {
    path: ROUTES.MODEL_VIEW,
    element: (
      <Suspense fallback={<RouteLoadingIndicator />}>
        <ModelPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.MODEL_EDIT,
    element: withProtected(
      <Suspense fallback={<RouteLoadingIndicator />}>
        <ModelEdit />
      </Suspense>,
      { allowedRoles: ["admin", "artist"] }
    ),
  },
];
