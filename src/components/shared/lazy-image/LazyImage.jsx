import { useRef, useState, useEffect } from "react";

/**
 * LazyImage:
 * - Takes { src, alt, className, ...props }
 * - Renders a placeholder, then loads the real image when in view
 */
export default function LazyImage({ src, alt = "", className = "", ...props }) {
  const imgRef = useRef(null);
  const [inView, setInView] = useState(false);    // is element in viewport?
  const [loaded, setLoaded] = useState(false);    // did the real img fully load?

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,        // viewport
        rootMargin: "0px",
        threshold: 0.1,    // trigger when 10% is in view
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
    setLoaded(true); // real image loaded
  };

  // We'll do a fade-in style. 
  // If the real image isn't in view yet, we do `src=""`. 
  // Once in view, we do `src={src}`. 
  // We also do a small CSS transition for the loaded image.

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: "50px" }} // or your desired fallback size 
      {...props}
    >
      {/* Optionally: You can place a placeholder or skeleton below */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ transition: "opacity 0.5s ease" }}
        ></div>
      )}

      {/* The real image (only sets real src if inView) */}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          className={`w-full h-auto transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ display: "block" }}
        />
      )}
    </div>
  );
}
