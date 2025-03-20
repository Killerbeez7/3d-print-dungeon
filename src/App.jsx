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
import { ModelView } from "./components/model-view/ModelView";
import { UploadModel } from "./components/upload-model/UploadModel";
import { ModelDetails } from "./components/model-details/ModelDetails";
// auth
import { AuthProvider } from "./contexts/authContext";
import { ModelsProvider } from "./contexts/modelsContext";
import { AuthModal } from "./components/auth-modal/AuthModal";
import { ProfileSettings } from "./components/user/profile-settings/ProfileSettings";
import { Profile } from "./components/user/profile/Profile";

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
                            {/* models */}
                            <Route path="/upload" element={<UploadModel />} />
                            <Route path="/model/:id" element={<ModelView />} />
                            {/* Temporary Directory */}
                            <Route path="/models/:id" element={<ModelDetails />} />
                            {/* common */}
                            <Route path="/" element={<Gallery />} />
                            <Route path="/3dstore" element={<Store />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/business" element={<Business />} />
                            <Route path="/profile" element={<Profile/>} />
                            <Route path="/profile-settings" element={<ProfileSettings />} />
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
