import { ModalProvider } from "@/providers/modalProvider";
import { AuthProvider } from "./providers/authProvider";
import { ModelsProvider } from "./providers/modelsProvider";
import { SearchProvider } from "./features/search/provider/searchProvider";
import { ForumProvider } from "./providers/forumProvider";
import { StripeProvider } from "./providers/stripeProvider";
import { Suspense } from "react";
import { Spinner } from "@/components/shared/Spinner";
import { AppRoutes } from "./AppRoutes";

export const App = () => {
    return (
        <AuthProvider>
            <ModelsProvider>
                <SearchProvider>
                    <ForumProvider>
                        <StripeProvider>
                            <ModalProvider>
                                <Suspense fallback={<Spinner />}>
                                    <AppRoutes />
                                </Suspense>
                            </ModalProvider>
                        </StripeProvider>
                    </ForumProvider>
                </SearchProvider>
            </ModelsProvider>
        </AuthProvider>
    );
};
