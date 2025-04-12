import "@google/model-viewer";
import { useState } from "react";
import { useRoutes, Navigate } from "react-router-dom";
// routes
import { publicRoutes } from "./routes/publicRoutes";
import { modelRoutes } from "./routes/modelRoutes";
import { userRoutes } from "./routes/userRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { storeRoutes } from "./routes/storeRoutes";
import { exploreRoutes } from "./routes/exploreRoutes";
import { businessRoutes } from "./routes/businessRoutes";
import { forumRoutes } from "./routes/forumRoutes";
// components
import { Navbar } from "./components/shared/navbar/Navbar";
import { Footer } from "./components/shared/footer/Footer";
// contexts
import { AuthProvider } from "./contexts/authContext";
import { ModelsProvider } from "./contexts/modelsContext";
import { SearchProvider } from "./contexts/searchContext";
// profiles
import { AuthModal } from "./components/shared/auth-modal/AuthModal";
// utils
import { ScrollToTopButton } from "./components/shared/ScrollToTopButton";

const MainApp = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleCloseModal = () => setIsModalOpen(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleSwitchMode = () => setIsSignUp((prev) => !prev);

    const routes = useRoutes([
        // Public Routes
        ...publicRoutes,
        // Feature Routes
        businessRoutes,
        storeRoutes,
        exploreRoutes,
        ...forumRoutes,
        // Model Routes
        ...modelRoutes,
        // User Routes
        ...userRoutes,
        // Admin Routes
        ...adminRoutes,
        // Catch all route
        {
            path: "*",
            element: <Navigate to="/" replace />,
        },
    ]);

    return (
        <div className="flex flex-col min-h-screen bg-bg-primary text-txt-primary">
            <Navbar
                onLoginClick={() => {
                    setIsSignUp(false);
                    handleOpenModal();
                }}
                onSignUpClick={() => {
                    setIsSignUp(true);
                    handleOpenModal();
                }}
            />
            <main className="flex-grow">{routes}</main>
            <Footer />
            <ScrollToTopButton />

            <AuthModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isSignUp={isSignUp}
                onSwitchMode={handleSwitchMode}
            />
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <ModelsProvider>
                <SearchProvider>
                    <MainApp />
                </SearchProvider>
            </ModelsProvider>
        </AuthProvider>
    );
};

export default App;
