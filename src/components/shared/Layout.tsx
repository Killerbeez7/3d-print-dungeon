import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
// Component imports
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { AuthModal } from "./auth-modal/AuthModal";
import { ScrollToTopButton } from "./ScrollToTopButton";

const Layout: React.FC = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    const handleCloseAuthModal = () => setIsAuthModalOpen(false);
    const handleSwitchAuthMode = () => setIsSignUp((prev) => !prev);

    return (
        <div className="flex flex-col min-h-lvh text-txt-primary relative">
            <div className="background-blur" />

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

            <main className="flex-grow min-h-[100vh] mb-10 z-5">
                <Suspense
                    fallback={
                        <div className="min-h-[300px] flex items-center justify-center">
                            Loading...
                        </div>
                    }>
                    <Outlet context={{ openAuthModal: handleOpenAuthModal }} />
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
