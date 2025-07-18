import { ModalProvider } from "@/providers/modalProvider";
import { AuthProvider } from "./features/auth/providers/authProvider";
import { ModelsProvider } from "./features/models/providers/modelsProvider";
import { SearchProvider } from "./features/search/provider/searchProvider";
import { ForumProvider } from "./features/forum/providers/forumProvider";
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
                        <ModalProvider>
                            <Suspense>
                                <AppRoutes />
                            </Suspense>
                        </ModalProvider>
                    </ForumProvider>
                </SearchProvider>
            </ModelsProvider>
        </AuthProvider>
    );
};
