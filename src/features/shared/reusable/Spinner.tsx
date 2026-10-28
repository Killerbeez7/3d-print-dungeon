import { useState, useEffect } from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
  delay?: number;
}

export function Spinner({ size = 24, className = "", delay = 300 }: SpinnerProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      setShouldShow(false);
    };
  }, [delay]);

  if (!shouldShow) {
    return null;
  }

  // A tiny build plate that prints bottom-up (see .skeleton-print).
  return (
    <span
      className={`skeleton-print chamfer inline-block ${className}`}
      style={{ width: size, height: size, ["--cut" as string]: `${Math.round(size / 4)}px` }}
      role="status"
      aria-label="Loading"
    />
  );
}
