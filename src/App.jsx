import { AuthProvider } from "./contexts/authContext";
import { ModelsProvider } from "./contexts/modelsContext";
import { SearchProvider } from "./contexts/searchContext";
import { ForumProvider } from "./contexts/forumContext";

import { AppRoutes } from "./AppRoutes";

export const App = () => {
    return (
        <AuthProvider>
            <ModelsProvider>
                <SearchProvider>
                    <ForumProvider>
                        <AppRoutes />
                    </ForumProvider>
                </SearchProvider>
            </ModelsProvider>
        </AuthProvider>
    );
};
