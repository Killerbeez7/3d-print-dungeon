import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ScrollToTop } from "./utils/ScrollToTop";
import { ErrorBoundary } from "@/features/shared/ErrorBoundary";

// React-Query
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

try {
    if (!container) throw new Error("Root container not found");
    const root = createRoot(container as HTMLElement);

    // Dynamically import App (and all Firebase-heavy providers) AFTER
    // the first paint so it lands in a separate, non-blocking chunk.
    import("./App").then(({ App }) => {
        root.render(
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <ScrollToTop />
                        <App />
                    </BrowserRouter>
                </QueryClientProvider>
            </ErrorBoundary>
        );
    });
} catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error during app initialization:", err);
    document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Application Error</h1>
      <pre>${err.message}</pre>
    </div>
  `;
}
