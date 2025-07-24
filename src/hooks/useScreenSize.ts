// useScreenSize.ts
import { useEffect, useState } from "react";

export function useScreenSize() {
    const [width, setWidth] = useState(() => window.innerWidth);
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return { width, isMobile, isTablet, isDesktop };
}
