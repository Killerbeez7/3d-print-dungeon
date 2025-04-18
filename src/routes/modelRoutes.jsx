import { ModelView } from "../components/models/model-view/ModelView";
import { ModelEdit } from "../components/models/model-edit/ModelEdit";
import { ModelUpload } from "../components/models/model-upload/ModelUpload";
import { withMaintenance, withProtectedMaintenance } from "../helpers/routeHelpers";

export const modelRoutes = [
    {
        path: "/model/upload",
        element: withProtectedMaintenance(<ModelUpload />),
    },
    {
        path: "/model/:id",
        element: withMaintenance(<ModelView />),
    },
    {
        path: "/model/:id/edit",
        element: withProtectedMaintenance(<ModelEdit />),
    },
];
