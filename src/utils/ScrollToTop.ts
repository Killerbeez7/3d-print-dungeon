import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scroll position of each history entry, so Back returns to the same spot.
const positions = new Map<string, number>();

/**
 * New pages open at the top; Back and Forward return to where the page was
 * left, waiting briefly for content (such as a cached gallery) to be tall
 * enough to scroll there.
 */
export const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const currentKey = useRef(key);
  const currentPath = useRef(pathname);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    // Scroll events belong to whichever entry is current when they fire.
    const save = () => positions.set(currentKey.current, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  useLayoutEffect(() => {
    currentKey.current = key;
    const samePage = currentPath.current === pathname;
    currentPath.current = pathname;
    // Query-only changes (filters, tabs) keep their position.
    if (samePage && navigationType !== "POP") return;

    const target = navigationType === "POP" ? positions.get(key) ?? 0 : 0;
    if (target === 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    let frame = 0;
    const started = performance.now();
    const restore = () => {
      const reachable = document.documentElement.scrollHeight - window.innerHeight >= target;
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
      if (!reachable && performance.now() - started < 1500) frame = requestAnimationFrame(restore);
    };
    restore();
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per navigation
  }, [pathname, key]);

  return null;
};
