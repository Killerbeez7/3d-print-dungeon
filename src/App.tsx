import { Suspense } from "react";
import { AppRoutes } from "./AppRoutes";

// Providers
import { AuthProvider } from "@/features/auth/providers/authProvider";
import { CookiesProvider } from "@/features/policies/providers/CookiesProvider";
import { MaintenanceProvider } from "@/features/maintenance/providers/MaintenanceProvider";
import { ModalProvider } from "@/features/shared/modal/providers/modalProvider";

// Components
import { SystemAlertContainer, SystemAlertProvider } from "@/features/system-alerts";
import { UserNotificationProvider } from "@/features/user/notifications";

export const App = () => {
  return (
    <AuthProvider>
      <MaintenanceProvider>
        <CookiesProvider>
          <SystemAlertProvider>
            <UserNotificationProvider>
              <ModalProvider>
                <Suspense fallback={null}>
                  <AppRoutes />
                </Suspense>

                <SystemAlertContainer />
              </ModalProvider>
            </UserNotificationProvider>
          </SystemAlertProvider>
        </CookiesProvider>
      </MaintenanceProvider>
    </AuthProvider>
  );
};
