import "@google/model-viewer";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.jsx";
import { ScrollToTop } from "./utils/ScrollToTop.js";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// React-Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            suspense: true,
            staleTime: 60_000,
            retry: 1,
        },
    },
});
// ----------

console.log("Starting app initialization...");

const container = document.getElementById("root");
console.log("=========== Main.jsx ===========");
console.log("Root element:", container ? "✅ Found" : "❌ Missing");
// Initialize Stripe with your publishable key

try {
    const root = createRoot(container);
    console.log("Root created: ✅ True");

    root.render(
        <ErrorBoundary>
            {/* inject query client here */}
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ScrollToTop />
                    <App />
                </BrowserRouter>

                {/* Devtools overlay - remove in production */}
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </QueryClientProvider>
        </ErrorBoundary>
    );
    console.log("Initial render called");
} catch (error) {
    console.error("Error during app initialization:", error);
    document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Application Error</h1>
      <pre>${error.message}</pre>
    </div>
  `;
}
