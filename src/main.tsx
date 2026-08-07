import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Components
import { ErrorBoundary } from "@/features/shared/ErrorBoundary";
import { ScrollToTop } from "./utils/ScrollToTop";
// Styles
import "nprogress/nprogress.css";
import "@/styles.css";
import "@/styles/nprogress.css";
import "@/styles/animations.css";

// React-Query
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

function renderBootstrapError(error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));

  console.error("Error during app initialization:", err);

  document.body.textContent = "";

  const wrapper = document.createElement("div");
  wrapper.style.color = "red";
  wrapper.style.padding = "20px";

  const title = document.createElement("h1");
  title.textContent = "Application Error";

  const details = document.createElement("pre");
  details.textContent = err.message;

  wrapper.append(title, details);
  document.body.appendChild(wrapper);
}

async function bootstrap(): Promise<void> {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("Root container not found");
  }

  const root = createRoot(container);
  const { App } = await import("./App");

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
}

bootstrap().catch(renderBootstrapError);
