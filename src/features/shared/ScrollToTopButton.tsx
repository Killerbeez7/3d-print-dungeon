import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

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
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-5 right-5 w-[50px] h-[50px] rounded-full text-2xl cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center ${
                isVisible ? "opacity-100 visible" : "opacity-0 invisible"
            } hover:scale-110 z-[101] bg-gradient-to-br from-accent-dark to-accent hover:from-accent hover:to-accent-hover text-white shadow-lg hover:shadow-xl`}
            aria-label="Scroll to top"
        >
            <FaArrowUp className="text-lg" />
        </button>
    );
};
