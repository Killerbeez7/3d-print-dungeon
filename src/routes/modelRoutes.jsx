import { ModelView } from "../components/models/model-view/ModelView";
import { ModelEdit } from "../components/models/model-edit/ModelEdit";
import { ModelUpload } from "../components/models/model-upload/ModelUpload";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";

export const modelRoutes = [
    {
        path: "/model/upload",
        element: (
            <ProtectedRoute>
                <ModelUpload />
            </ProtectedRoute>
        ),
    },
    {
        path: "/model/:id",
        element: <ModelView />,
    },
    {
        path: "/model/:id/edit",
        element: (
            <ProtectedRoute>
                <ModelEdit />
            </ProtectedRoute>
        ),
    },
];
