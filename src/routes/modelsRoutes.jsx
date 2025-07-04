import { ModelUpload } from "../components/models/model-upload/ModelUpload";
import { ModelPage } from "../components/models/model-view/ModelPage";
import { ModelEdit } from "../components/models/model-edit/ModelEdit";
import { withMaintenance, withProtectedMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";

export const modelsRoutes = [
    { path: ROUTES.MODEL_UPLOAD, element: withProtectedMaintenance(<ModelUpload />) },
    { path: ROUTES.MODEL_VIEW, element: withMaintenance(<ModelPage />) },
    { path: ROUTES.MODEL_EDIT, element: withProtectedMaintenance(<ModelEdit />, { allowedRoles: ["admin", "artist"] }) },
];
