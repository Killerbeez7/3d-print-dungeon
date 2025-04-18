import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
//components imports
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { AuthModal } from "./auth-modal/AuthModal";
import { ScrollToTopButton } from "./ScrollToTopButton";

const Layout = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    const handleCloseAuthModal = () => setIsAuthModalOpen(false);
    const handleSwitchAuthMode = () => setIsSignUp((prev) => !prev);

    return (
        <div className="flex flex-col min-h-screen bg-bg-primary text-txt-primary">
            <Navbar
                onLoginClick={() => {
                    setIsSignUp(false);
                    handleOpenAuthModal();
                }}
                onSignUpClick={() => {
                    setIsSignUp(true);
                    handleOpenAuthModal();
                }}
            />
            <main className="flex-grow min-h-[calc(100vh-200px)]">
                <Suspense
                    fallback={
                        <div className="min-h-[300px] flex items-center justify-center">
                            Loading...
                        </div>
                    }
                >
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
            <ScrollToTopButton />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={handleCloseAuthModal}
                isSignUp={isSignUp}
                onSwitchMode={handleSwitchAuthMode}
            />
        </div>
    );
};

export default Layout;
