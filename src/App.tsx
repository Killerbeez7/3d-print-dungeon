import { ModalProvider } from "@/providers/modalProvider";
import { AuthProvider } from "./features/auth/providers/authProvider";
import { ModelsProvider } from "./features/models/providers/modelsProvider";
import { SearchProvider } from "./features/search/providers/searchProvider";
import { ForumProvider } from "./features/forum/providers/forumProvider";
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
            <ModelsProvider>
                <SearchProvider>
                    <ForumProvider>
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
                    </ForumProvider>
                </SearchProvider>
            </ModelsProvider>
        </AuthProvider>
    );
};
