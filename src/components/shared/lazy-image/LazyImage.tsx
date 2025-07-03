import { useRef, useState, useEffect } from "react";

export interface LazyImageProps extends React.HTMLAttributes<HTMLDivElement> {
    src: string;
    alt?: string;
    className?: string;
}

export const LazyImage = ({
    src,
    alt = "",
    className = "",
    ...props
}: LazyImageProps) => {
    const imgRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const observer = new window.IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, []);

    const handleLoad = () => {
        setLoaded(true);
    };

    return (
        <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
            {!loaded && (
                <div
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    style={{ transition: "opacity 0.5s ease" }}
                ></div>
            )}

            {inView && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={handleLoad}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                        loaded ? "opacity-100" : "opacity-0"
                    }`}
                />
            )}
        </div>
    );
};
