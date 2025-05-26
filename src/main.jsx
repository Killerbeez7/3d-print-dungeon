import "@google/model-viewer";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.jsx";
import { ScrollToTop } from "./utils/ScrollToTop.js";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

console.log("Starting app initialization");

const container = document.getElementById("root");
console.log("Root element found:", !!container);

try {
    const root = createRoot(container);
    console.log("Root created");

    root.render(
        <ErrorBoundary>
            <BrowserRouter>
                <ScrollToTop />
                <App />
            </BrowserRouter>
        </ErrorBoundary>
    );
    console.log("Initial render called");
} catch (error) {
    console.error("Error during app initialization:", error);
    // Create a basic error display if the app fails to mount
    document.body.innerHTML = `
        <div style="color: red; padding: 20px;">
            <h1>Application Error</h1>
            <pre>${error.message}</pre>
        </div>
    `;
}
