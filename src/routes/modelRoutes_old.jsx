import { Home } from "../components/home/Home";
import { ModelView } from "../components/models/model-view/ModelView";
import { ModelEdit } from "../components/models/model-edit/ModelEdit";
import { ModelUpload } from "../components/models/model-upload/ModelUpload";
import { withMaintenance, withProtectedMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../config/routeConstants";

export const modelsRoutes = [
    {
        path: ROUTES.MODELS,
        element: withMaintenance(<Home />), // Home acts as landing page
        children: [
            { index: true, element: <Home /> }, // /models renders Home
            {
                path: ROUTES.MODELS_UPLOAD,
                element: withProtectedMaintenance(<ModelUpload />),
            },
            { path: ROUTES.MODELS_VIEW, element: withMaintenance(<ModelView />) },
            {
                path: ROUTES.MODELS_EDIT,
                element: withProtectedMaintenance(<ModelEdit />),
            },
        ],
    },
];
