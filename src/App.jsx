import "@google/model-viewer";

import { useState } from "react";
import { Routes, Route } from "react-router-dom";
// common
import { Navbar } from "./components/shared/navbar/Navbar";
import { Footer } from "./components/shared/footer/Footer";
// features
import { Store } from "./components/store/Store";
import { Gallery } from "./components/gallery/Gallery";
import { Explore } from "./components/explore/Explore";
import { Business } from "./components/business/Business";
// models
import { ModelUpload } from "./components/models/model-upload/ModelUpload";
import { ModelView } from "./components/models/model-view/ModelView";
import { ModelEdit } from "./components/models/model-edit/ModelEdit";
// contexts
import { AuthProvider } from "./contexts/authContext";
import { ModelsProvider } from "./contexts/modelsContext";
import { AuthModal } from "./components/auth-modal/AuthModal";
// profiles
import { ArtistProfile } from "./components/artists/artist-profile/ArtistProfile";
import { ProfileSettings } from "./components/settings/ProfileSettings";
import { Artists } from "./components/artists/artists/Artists";
// dev
import { AdminPanel } from "./components/admin-panel/AdminPanel";

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleCloseModal = () => setIsModalOpen(false);

    // switch between signUp/signIn
    const handleSwitchMode = () => setIsSignUp((prev) => !prev);

    return (
        <div className="flex flex-col min-h-screen bg-bg-primary">
            <AuthProvider>
                <Navbar
                    onLoginClick={() => {
                        // set sign-in mode
                        setIsSignUp(false);
                        setIsModalOpen(true);
                    }}
                    onSignUpClick={() => {
                        // set sign-up mode
                        setIsSignUp(true);
                        setIsModalOpen(true);
                    }}
                />

                <main className="flex-grow">
                    <ModelsProvider>
                        <Routes>
                            {/* admin */}
                            <Route path="/admin-panel" element={<AdminPanel />} />
                            {/* common */}
                            <Route path="/" element={<Gallery />} />
                            <Route path="/3dstore" element={<Store />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/business" element={<Business />} />
                            <Route path="/settings" element={<ProfileSettings />} />
                            {/* artists */}

                            <Route path="/artists" element={<Artists />} />
                            <Route path="/artist/:uid" element={<ArtistProfile />} />
                            {/* models */}
                            <Route path="/upload" element={<ModelUpload />} />
                            <Route path="/model/:id" element={<ModelView />} />
                            <Route path="/model/:id/edit" element={<ModelEdit />} />
                        </Routes>
                    </ModelsProvider>
                </main>

                <Footer />

                {/* Auth Modal for sign-in / sign-up */}
                <AuthModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    isSignUp={isSignUp}
                    onSwitchMode={handleSwitchMode}
                />
            </AuthProvider>
        </div>
    );
}
