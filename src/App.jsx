import { ModalProvider } from "@/providers/ModalProvider";
import { AuthProvider } from "./providers/authProvider";
import { ModelsProvider } from "./providers/modelsProvider";
import { SearchProvider } from "./providers/searchProvider";
import { ForumProvider } from "./providers/forumProvider";

import { AppRoutes } from "./AppRoutes";

export const App = () => {
    return (
        <ModalProvider>
            <AuthProvider>
                <ModelsProvider>
                    <SearchProvider>
                        <ForumProvider>
                            <AppRoutes />
                        </ForumProvider>
                    </SearchProvider>
                </ModelsProvider>
            </AuthProvider>
        </ModalProvider>
    );
};
