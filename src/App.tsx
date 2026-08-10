import { Suspense } from "react";
import { AppRoutes } from "./AppRoutes";

// Providers
import { AuthProvider } from "./features/auth";
import { CookiesProvider } from "./features/cookies";
import { MaintenanceProvider } from "./features/maintenance";
import { ModalProvider } from "./features/shared/modal";

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
