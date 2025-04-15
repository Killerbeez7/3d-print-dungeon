import { ModelView } from "../components/models/model-view/ModelView";
import { ModelEdit } from "../components/models/model-edit/ModelEdit";
import { ModelUpload } from "../components/models/model-upload/ModelUpload";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import { MaintenanceRoute } from "../routes/MaintenanceRoute";

export const modelRoutes = [
    {
        path: "/model/upload",
        element: (
            <MaintenanceRoute>
                <ProtectedRoute>
                    <ModelUpload />
                </ProtectedRoute>
            </MaintenanceRoute>
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
