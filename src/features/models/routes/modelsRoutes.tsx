import { ModelUpload } from "../pages/ModelUpload";
import { ModelPage } from "../pages/ModelPage";
import { ModelEdit } from "../pages/ModelEdit";
import { withMaintenance, withProtectedMaintenance } from "../../../helpers/routeHelpers";
import { ROUTES } from "../../../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const modelsRoutes: RouteObject[] = [
    { path: ROUTES.MODEL_UPLOAD, element: withProtectedMaintenance(<ModelUpload />) },
    { path: ROUTES.MODEL_VIEW, element: withMaintenance(<ModelPage />) },
    { path: ROUTES.MODEL_EDIT, element: withProtectedMaintenance(<ModelEdit />, { allowedRoles: ["admin", "artist"] }) },
];
