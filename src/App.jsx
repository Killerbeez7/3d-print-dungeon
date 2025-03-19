import { useState } from "react";
import { Routes, Route } from "react-router-dom";
// common
import { Home } from "./components/home/Home";
import { Navbar } from "./components/shared/navbar/Navbar";
import { Footer } from "./components/shared/footer/Footer";
// features
import { Store } from "./components/store/Store";
import { Gallery } from "./components/gallery/Gallery";
import { Explore } from "./components/explore/Explore";
import { Business } from "./components/business/Business";
import { Upload3DModelPage } from "./components/Upload3DModelPage/Upload3DModelPage";
import { ModelDetails } from "./components/model-details/ModelDetails";
// auth
import { AuthProvider } from "./contexts/authContext";
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
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/3dstore" element={<Store />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/gallery" element={<Gallery />} />
                        {/* Temporary Directory */}
                        <Route path="/model/:id" element={<ModelDetails />} />

                        <Route path="/business" element={<Business />} />
                        <Route path="/upload" element={<Upload3DModelPage />} />
                        <Route path="/profile" element={<Profile/>} />
                        <Route path="/profile-settings" element={<ProfileSettings />} />
                    </Routes>
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
