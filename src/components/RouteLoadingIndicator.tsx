import { useEffect } from "react";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
});

export const RouteLoadingIndicator = () => {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      NProgress.start();
    }, 150);

    return () => {
      window.clearTimeout(timer);
      NProgress.done();
    };
  }, []);

  return null;
};
