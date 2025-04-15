import { AuthProvider } from "./contexts/authContext";
import { ModelsProvider } from "./contexts/modelsContext";
import { SearchProvider } from "./contexts/searchContext";
import { AppRoutes } from "./AppRoutes";

export const App = () => {
    return (
        <AuthProvider>
            <ModelsProvider>
                <SearchProvider>
                    <AppRoutes />
                </SearchProvider>
            </ModelsProvider>
        </AuthProvider>
    );
};
