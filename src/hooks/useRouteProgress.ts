import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";

/**
 * A custom hook that displays a progress bar during route transitions.
 * It leverages nprogress to provide immediate visual feedback when a
 * lazy-loaded page is being fetched.
 */
export function useRouteProgress() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Don't show the progress bar on the initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      NProgress.configure({ showSpinner: false });
      return;
    }

    NProgress.start();

    // A short delay helps make fast transitions feel less jarring.
    // If the page loads instantly, the bar might just flash, which can be distracting.
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]); // Only re-run on path change
} 