import "@google/model-viewer";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
// common
import { Home } from "./components/home/Home";
import { Store } from "./components/store/Store";
import { Explore } from "./components/explore/Explore";
import { Business } from "./components/business/Business";
import { BulkOrders } from "./components/business/BulkOrders";
import { CustomSolutions } from "./components/business/CustomSolutions";
import { Enterprise } from "./components/business/Enterprise";
import { Navbar } from "./components/shared/navbar/Navbar";
import { Footer } from "./components/shared/footer/Footer";
// models
import { ModelView } from "./components/models/model-view/ModelView";
import { ModelEdit } from "./components/models/model-edit/ModelEdit";
import { ModelUpload } from "./components/models/model-upload/ModelUpload";
// contexts
import { AuthProvider } from "./contexts/authContext";
import { ModelsProvider } from "./contexts/modelsContext";
import { SearchProvider } from "./contexts/searchContext";
// profiles
import { AuthModal } from "./components/shared/auth-modal/AuthModal";
import { Artists } from "./components/artists/artists/Artists";
import { ProfileSettings } from "./components/settings/ProfileSettings";
import { ArtistProfile } from "./components/artists/artist-profile/ArtistProfile";
// utils
import { DynamicSearch } from "./components/search/DynamicSearch";
import { ScrollToTopButton } from "./components/shared/ScrollToTopButton";
// admin
import { AdminPanel } from "./components/admin/AdminPanel";
// maintenance components
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { MaintenancePage } from "./components/shared/MaintenancePage";

const MainApp = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleCloseModal = () => setIsModalOpen(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleSwitchMode = () => setIsSignUp((prev) => !prev);

    return (
        <div className="flex flex-col min-h-screen bg-bg-primary text-txt-primary">
            <Navbar
                onLoginClick={() => {
                    // set sign-in mode
                    setIsSignUp(false);
                    handleOpenModal();
                }}
                onSignUpClick={() => {
                    // set sign-up mode
                    setIsSignUp(true);
                    handleOpenModal();
                }}
            />
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/maintenance" element={<MaintenancePage />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/store"
                        element={
                            <ProtectedRoute>
                                <Store />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/explore"
                        element={
                            <ProtectedRoute>
                                <Explore />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/business"
                        element={
                            <ProtectedRoute>
                                <Business />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/bulk-orders"
                        element={
                            <ProtectedRoute>
                                <BulkOrders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/custom-solutions"
                        element={
                            <ProtectedRoute>
                                <CustomSolutions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/enterprise"
                        element={
                            <ProtectedRoute>
                                <Enterprise />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/model/:id"
                        element={
                            <ProtectedRoute>
                                <ModelView />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/model/:id/edit"
                        element={
                            <ProtectedRoute>
                                <ModelEdit />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/upload"
                        element={
                            <ProtectedRoute>
                                <ModelUpload />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <ProfileSettings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/artists"
                        element={
                            <ProtectedRoute>
                                <Artists />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/artist/:id"
                        element={
                            // <ProtectedRoute>
                                <ArtistProfile />
                            // {/* </ProtectedRoute> */}
                        }
                    />

                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <DynamicSearch />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin-panel"
                        element={
                            <ProtectedRoute>
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
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

// Root App component
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
