import { useState, useEffect } from "react";

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = window.innerHeight * 0.35; // Show after 35% of viewport height
            const minPageHeight = 1500; // Only show if the page is at least 1500px tall

            if (document.body.scrollHeight > minPageHeight) {
                setIsVisible(window.scrollY > scrollThreshold);
            } else {
                setIsVisible(false); // Hide if page is too short
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
            className={`fixed bottom-5 right-5 w-[50px] h-[50px] bg-[var(--badge-bg)] text-[var(--primary-text-color)] rounded-full text-2xl cursor-pointer opacity-0 invisible transition-all duration-300 ease-in-out shadow-[0_4px_6px_var(--box-shadow-color)] flex items-center justify-center ${
                isVisible ? "opacity-100 visible" : ""
            } hover:bg-[var(--hover-text-color)] hover:scale-110`}
        >
            <i className="fa-solid fa-arrow-up"></i>
        </button>
    );
};
