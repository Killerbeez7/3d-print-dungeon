import { Suspense } from "react";
import { Outlet } from "react-router-dom";


//components
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { AuthModal } from "../auth/components/AuthModal";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { ScrollToTopButton } from "@/features/shared/ScrollToTopButton";

export const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
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
            <Footer />
        </div>
    );
};

export default Layout;
