import { Suspense } from "react";
import { Outlet } from "react-router-dom";

//components
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { AuthModal } from "../auth/components/AuthModal";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { ScrollToTopButton } from "@/features/shared/ScrollToTopButton";
import { LayoutProvider, useLayout } from "./context/layoutContext";
import { CookieBanner } from "../policies/components/CookieBanner";

const AppLayout = () => {
    const { isFooterHidden } = useLayout();
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 min-h-screen">
                <Suspense
                    fallback={
                        <div className="h-full flex items-center justify-center">
                            <Spinner size={48} />
                        </div>
                    }
                >
                    <Outlet />
                    <ScrollToTopButton />
                </Suspense>
            </main>
            <AuthModal />
            <CookieBanner />

            {!isFooterHidden && <Footer />}
        </div>
    );
};

export const Layout = () => {
    return (
        <LayoutProvider>
            <AppLayout />
        </LayoutProvider>
    );
};

export default Layout;
