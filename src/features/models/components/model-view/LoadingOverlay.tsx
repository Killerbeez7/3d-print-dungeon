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
                <div className="bg-black/50 p-6 rounded-lg backdrop-blur-sm">
                    <p className="text-lg text-white animate-pulse mb-3">
                        Downloading {Math.round(downloadProgress * 100)}%
                    </p>
                    <div className="w-52 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-300 transition-all duration-300"
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
