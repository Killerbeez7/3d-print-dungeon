import { useState, useEffect } from "react";
import { Spinner } from "@/features/shared/reusable/Spinner";

interface LoadingOverlayProps {
    isVisible: boolean;
    isDownloading: boolean;
    downloadProgress: number;
}

export const LoadingOverlay = ({ isVisible, isDownloading, downloadProgress }: LoadingOverlayProps) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            setIsFading(false);
            setShowProgress(false);
            
            // Show progress bar after 1 second if still downloading
            const timer = setTimeout(() => {
                if (isDownloading) {
                    setShowProgress(true);
                }
            }, 300);
            
            return () => clearTimeout(timer);
        } else {
            setIsFading(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isVisible, isDownloading]);

    if (!shouldRender) return null;

    return (
        <div 
            className={`absolute inset-0 flex items-center justify-center z-40 transition-opacity duration-300 ${
                isFading ? 'opacity-0' : 'opacity-100'
            }`}
        >
            {isDownloading && showProgress ? (
                <div className="rounded-lg border border-white/10 bg-black/60 p-5 backdrop-blur-sm">
                    <p className="label-mono mb-3 flex justify-between gap-6 text-white/80">
                        <span>Loading model</span>
                        <span className="text-white">{Math.round(downloadProgress * 100)}%</span>
                    </p>
                    <div className="h-1.5 w-56 overflow-hidden bg-white/15">
                        <div
                            className="h-full bg-gradient-to-r from-accent to-ember-fill transition-[width] duration-300"
                            style={{ width: `${downloadProgress * 100}%` }}
                        />
                    </div>
                </div>
            ) : (
                <Spinner size={24} />
            )}
        </div>
    );
};
