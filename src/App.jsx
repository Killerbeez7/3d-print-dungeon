import { Routes, Route } from "react-router-dom";

// components
import { Navbar } from "./components/shared/navbar/Navbar";
import { Footer } from "./components/shared/footer/Footer";
import { Home } from "./components/home/Home";

export default function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow px-4 py-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
                <h1>hello</h1>
            </main>

            <Footer />
        </div>
    );
}
