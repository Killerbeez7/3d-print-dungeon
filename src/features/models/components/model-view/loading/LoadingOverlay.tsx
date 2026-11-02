import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import { buttonClassName } from "@/components";

export type ViewerLoadPhase = "download" | "prepare" | "ready" | "error";

interface LoadingOverlayProps {
    phase: ViewerLoadPhase;
    /** Download progress, 0 to 1. */
    progress: number;
    /** File size in bytes, 0 when unknown. */
    totalBytes: number;
    onRetry: () => void;
}

const SHOW_DELAY_MS = 150; // a cached model shouldn't flash the overlay
const FADE_MS = 300;

const formatMB = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;

/**
 * Covers the 3D viewer until the model is on screen: download (real
 * percentage), then preparing (the viewer builds the model), then fades out.
 */
export const LoadingOverlay = ({ phase: currentPhase, progress, totalBytes, onRetry }: LoadingOverlayProps) => {
    const active = currentPhase !== "ready";
    // Keep showing the last step while the overlay fades out.
    const lastPhase = useRef<Exclude<ViewerLoadPhase, "ready">>("download");
    if (currentPhase !== "ready") lastPhase.current = currentPhase;
    const phase = lastPhase.current;
    const [mounted, setMounted] = useState(active);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        if (active) {
            setMounted(true);
            const timer = setTimeout(() => setShown(true), phase === "error" ? 0 : SHOW_DELAY_MS);
            return () => clearTimeout(timer);
        }
        setShown(false);
        const timer = setTimeout(() => setMounted(false), FADE_MS);
        return () => clearTimeout(timer);
    }, [active, phase]);


    if (!mounted) return null;

    const percent = Math.round(progress * 100);
    const label =
        phase === "download" ? "Downloading preview" : phase === "prepare" ? "Preparing 3D view" : "";

    return (
        <div
            className={`absolute inset-0 z-40 flex items-center justify-center bg-scrim/35 transition-opacity duration-300 ${
                shown ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            {phase === "error" ? (
                <div
                    role="alert"
                    className="mx-4 max-w-xs rounded-xl border border-on-scrim/10 bg-scrim/75 p-5 text-center backdrop-blur-md"
                >
                    <p className="text-sm font-semibold text-on-scrim">The 3D preview didn&apos;t load</p>
                    <p className="mt-1 text-xs text-on-scrim/70">
                        Check your connection and try again. The images still work.
                    </p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className={buttonClassName({ variant: "secondary", size: "sm", className: "mt-4" })}
                    >
                        <RotateCcw className="size-4" aria-hidden="true" />
                        Try again
                    </button>
                </div>
            ) : (
                <div className="w-64 max-w-[calc(100%-2rem)] rounded-xl border border-on-scrim/10 bg-scrim/70 p-4 backdrop-blur-md">
                    <p className="label-mono flex items-baseline justify-between gap-4 text-on-scrim/80" aria-live="polite">
                        <span>{label}</span>
                        {phase === "download" && <span className="tabular-nums text-on-scrim">{percent}%</span>}
                    </p>

                    <div
                        className="mt-3 h-1.5 overflow-hidden rounded-full bg-on-scrim/15"
                        role="progressbar"
                        aria-label={label}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={phase === "download" ? percent : undefined}
                    >
                        {phase === "download" ? (
                            <div
                                className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-ember-fill transition-transform duration-200 ease-linear"
                                style={{ transform: `scaleX(${Math.max(progress, 0.02)})` }}
                            />
                        ) : (
                            <div className="progress-indeterminate h-full rounded-full bg-gradient-to-r from-accent to-ember-fill" />
                        )}
                    </div>

                    <p className="mt-2 h-4 text-xs tabular-nums text-on-scrim/60">
                        {phase === "download" && totalBytes > 0
                            ? `${formatMB(progress * totalBytes)} of ${formatMB(totalBytes)}`
                            : phase === "prepare"
                              ? "Almost there"
                              : ""}
                    </p>
                </div>
            )}
        </div>
    );
};
