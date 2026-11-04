import { Suspense } from "react";
import { Outlet } from "react-router-dom";

//components
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { AuthModal } from "../auth/components/AuthModal";
import { PageLoader } from "@/features/shared/components/Die";
import { ScrollToTopButton } from "@/features/shared/ScrollToTopButton";
import { LayoutProvider } from "./context/layoutContext";
import { useLayout } from "./context/useLayout";
import { CookieBanner } from "../cookies/components/CookieBanner";

const AppLayout = () => {
  const { isFooterHidden } = useLayout();
  return (
    <div className="layout flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 min-h-screen">
        <Suspense
          fallback={<PageLoader />}
        >
          <Outlet />
          <ScrollToTopButton />
        </Suspense>
      </main>
      <AuthModal />
      <CookieBanner />

      {!isFooterHidden && <Footer />}
    </div>
  );
};

export const Layout = () => {
  return (
    <LayoutProvider>
      <AppLayout />
    </LayoutProvider>
  );
};

export default Layout;
