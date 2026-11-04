import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

import { useCookies } from "@/features/cookies/hooks/useCookies";

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    // The cookie banner has its own buttons in this corner; wait until it is answered.
    const { consent } = useCookies();
    const isShown = isVisible && consent.accepted;

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = window.innerHeight * 0.2;
            const minPageHeight = 1000;

            if (document.body.scrollHeight > minPageHeight) {
                setIsVisible(window.scrollY > scrollThreshold);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`btn btn-primary fixed bottom-5 right-5 max-md:hidden z-[101] size-12 p-0 transition-[opacity,transform,visibility] duration-300 ease-forge ${
                isShown ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"
            }`}
            aria-label="Scroll to top"
        >
            <ArrowUp className="size-5" aria-hidden="true" />
        </button>
    );
};
