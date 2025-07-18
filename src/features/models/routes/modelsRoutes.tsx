import { lazy, Suspense } from "react";
import { withMaintenance, withProtectedMaintenance } from "../../../helpers/routeHelpers";
import { ROUTES } from "../../../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

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
        element: withProtectedMaintenance(
            <Suspense>
                <ModelUpload />
            </Suspense>
        ),
    },
    {
        path: ROUTES.MODEL_VIEW,
        element: withMaintenance(
            <Suspense>
                <ModelPage />
            </Suspense>
        ),
    },
    {
        path: ROUTES.MODEL_EDIT,
        element: withProtectedMaintenance(
            <Suspense>
                <ModelEdit />
            </Suspense>,
            { allowedRoles: ["admin", "artist"] }
        ),
    },
];
