import { ModalProvider } from "@/providers/modalProvider";
import { AuthProvider } from "./features/auth/providers/authProvider";
import { ModelsProvider } from "./features/models/providers/modelsProvider";
import { SearchProvider } from "./features/search/provider/searchProvider";
import { ForumProvider } from "./features/forum/providers/forumProvider";
import { StripeProvider } from "./features/payment/provider/stripeProvider";
import { Suspense } from "react";
import { Spinner } from "@/features/shared/reusable/Spinner";
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
