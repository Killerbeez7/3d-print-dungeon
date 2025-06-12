import { MaintenanceRoute } from "../routes/guards/MaintenanceRoute";
import { ProtectedRoute } from "../routes/guards/ProtectedRoute";

export const withMaintenance = (element, options = {}) => (
  <MaintenanceRoute 
    fallback={options.fallback}
    redirectTo={options.redirectTo}
  >
    {element}
  </MaintenanceRoute>
);

export const withProtected = (element, options = {}) => (
  <ProtectedRoute 
    requireAdmin={options.requireAdmin}
    redirectTo={options.redirectTo}
  >
    {element}
  </ProtectedRoute>
);

export const withProtectedMaintenance = (element, options = {}) => (
  <MaintenanceRoute
    fallback={options.fallback}
    redirectTo={options.maintenanceRedirect}
  >
    <ProtectedRoute
      requireAdmin={options.requireAdmin}
      allowedRoles={options.allowedRoles}
      redirectTo={options.authRedirect}
    >
      {element}
    </ProtectedRoute>
  </MaintenanceRoute>
);
