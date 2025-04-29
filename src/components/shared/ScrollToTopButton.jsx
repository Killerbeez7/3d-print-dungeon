import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = window.innerHeight * 0.2; // Show after 20% of viewport height
            const minPageHeight = 1000; // Only show if the page is at least 10 00px tall

            if (document.body.scrollHeight > minPageHeight) {
                setIsVisible(window.scrollY > scrollThreshold);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 w-[50px] h-[50px] bg-[var(--badge-bg,#4F46E5)] text-[var(--primary-text-color,#FFFFFF)] rounded-full text-2xl z-5 cursor-pointer transition-all duration-300 ease-in-out shadow-[0_4px_6px_var(--box-shadow-color,#00000029)] flex items-center justify-center ${
                isVisible ? "opacity-100 visible" : "opacity-0 invisible"
            } hover:bg-[var(--hover-text-color,#4338CA)] hover:scale-110 z-1000000000`}
        >
            <FaArrowUp />
        </button>
    );
};
