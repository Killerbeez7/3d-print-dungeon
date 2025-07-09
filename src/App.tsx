import { ModalProvider } from "@/providers/modalProvider";
import { AuthProvider } from "./providers/authProvider";
import { ModelsProvider } from "./providers/modelsProvider";
import { SearchProvider } from "./providers/searchProvider";
import { ForumProvider } from "./providers/forumProvider";
import { StripeProvider } from "./providers/stripeProvider";
import { Suspense } from "react";
import { Spinner } from "@/components/shared/Spinner";
import { AppRoutes } from "./AppRoutes";

export const App = () => {
    return (
        <StripeProvider>
            <ModalProvider>
                <AuthProvider>
                    <ModelsProvider>
                        <SearchProvider>
                            <ForumProvider>
                                <Suspense fallback={<Spinner />}>
                                    <AppRoutes />
                                </Suspense>
                            </ForumProvider>
                        </SearchProvider>
                    </ModelsProvider>
                </AuthProvider>
            </ModalProvider>
        </StripeProvider>
    );
};
