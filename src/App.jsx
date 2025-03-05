import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

// common
import { Home } from "./components/home/Home";
import { Navbar } from "./components/shared/navbar/Navbar";
import { Footer } from "./components/shared/footer/Footer";
// features
import { Store } from "./components/store/Store";
import { Explore } from "./components/explore/Explore";
import { Business } from "./components/business/Business";
import { Upload3DModelPage } from "./components/Upload3DModelPage/Upload3DModelPage";
// auth
import { AuthModal } from "./components/auth/auth-modal/AuthModal";

export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleCloseModal = () => setIsModalOpen(false);

    // switch between signUp/signIn
    const handleSwitchMode = () => setIsSignUp((prev) => !prev);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar
                onLoginClick={() => {
                    setIsSignUp(false); // set sign-in mode
                    setIsModalOpen(true);
                }}
                onSignUpClick={() => {
                    setIsSignUp(true); // set sign-up mode
                    setIsModalOpen(true);
                }}
            />

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/3dstore" element={<Store />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/business" element={<Business />} />
                    <Route path="/upload" element={<Upload3DModelPage />} />
                </Routes>
            </main>

            <Footer />

            <AuthModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isSignUp={isSignUp}
                onSwitchMode={handleSwitchMode}
            />
        </div>
    );
}
