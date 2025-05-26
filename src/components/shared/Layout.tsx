import { Suspense } from "react";
import { Outlet } from "react-router-dom";

//components
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { AuthModal } from "./auth-modal/AuthModal";
import { Spinner } from "@/components/shared/Spinner";

export const Layout: React.FC = () => (
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
            </Suspense>
        </main>

        <AuthModal />
        <Footer />
    </div>
);

export default Layout;
