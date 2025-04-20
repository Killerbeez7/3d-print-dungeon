import { ModelUpload } from "../components/models/model-upload/ModelUpload";
import { ModelView } from "../components/models/model-view/ModelView";
import { ModelEdit } from "../components/models/model-edit/ModelEdit";
import { withMaintenance, withProtectedMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../config/routeConstants";

export const modelsRoutes = [
    { path: ROUTES.MODEL_UPLOAD, element: withProtectedMaintenance(<ModelUpload />) },
    { path: ROUTES.MODEL_VIEW, element: withMaintenance(<ModelView />) },
    { path: ROUTES.MODEL_EDIT, element: withProtectedMaintenance(<ModelEdit />) },
];
