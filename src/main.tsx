import "@google/model-viewer";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ScrollToTop } from "./utils/ScrollToTop";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// React-Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 1,
        },
    },
});

console.log("Starting app initialization...");

const container = document.getElementById("root");
console.log("=========== Main.tsx ===========");
console.log("Root element:", container ? "✅ Found" : "❌ Missing");
// Initialize Stripe with your publishable key

try {
    if (!container) throw new Error("Root container not found");
    const root = createRoot(container as HTMLElement);
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
    // TypeScript: error is unknown, so we need a type guard
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error during app initialization:", err);
    document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Application Error</h1>
      <pre>${err.message}</pre>
    </div>
  `;
}
