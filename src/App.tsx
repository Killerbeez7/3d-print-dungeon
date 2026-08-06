import { ModalProvider } from "@/providers/modalProvider";
import { AuthProvider } from "./features/auth/providers/authProvider";
import { CookiesProvider } from "./features/policies/providers/CookiesProvider";
import { SystemAlertProvider, SystemAlertContainer } from "./features/system-alerts";
import { UserNotificationProvider } from "./features/user/notifications";
import { Suspense } from "react";
import { AppRoutes } from "./AppRoutes";
import { useRouteProgress } from "@/hooks/useRouteProgress";

export const App = () => {
  useRouteProgress();

  return (
    <AuthProvider>
      <CookiesProvider>
        <SystemAlertProvider>
          <UserNotificationProvider>
            <ModalProvider>
              <Suspense>
                <AppRoutes />
              </Suspense>
              <SystemAlertContainer />
            </ModalProvider>
          </UserNotificationProvider>
        </SystemAlertProvider>
      </CookiesProvider>
    </AuthProvider>
  );
};
