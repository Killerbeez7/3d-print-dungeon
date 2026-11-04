import { useRef, useState, useEffect, ImgHTMLAttributes } from "react";

export interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  wrapperClassName?: string;
}

export const LazyImage = ({
  className = "",
  wrapperClassName = "",
  ...imgProps
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

    const img = imgRef.current;
    if (img) observer.observe(img);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden select-none ${wrapperClassName}`}
    >
      {!loaded && (
        <div
          className="skeleton-print absolute inset-0"
          style={{ transition: "opacity 0.5s ease" }}
        ></div>
      )}

      {inView && (
        <img
          {...imgProps}
          draggable={false}
          onLoad={handleLoad}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </div>
  );
};
