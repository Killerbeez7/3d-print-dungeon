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

    const ring = `${size}px`;
    const thickness = size / 8;

    return (
        <span
            className={`inline-block animate-spin ${className}`}
            style={{
                width: ring,
                height: ring,
                borderStyle: "solid",
                borderWidth: thickness,
                borderColor: "var(--bg-primary)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
            }}
            role="status"
            aria-label="Loading"
        />
    );
}
