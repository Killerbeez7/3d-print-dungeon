import React from "react";
import { Camera, ChevronUp, Focus, Maximize, Minimize, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ModelControlsProps {
    controlsVisible: boolean;
    autoRotate: boolean;
    isIOS: boolean;
    customFullscreen: boolean;
    isFullscreen: boolean;
    renderExtraUrls: string[];
    onToggleMenu: () => void;
    onToggleRotation: () => void;
    onResetView: () => void;
    onToggleFullscreen: () => void;
    onTakeScreenshot: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const ControlButton = ({
    icon: Icon,
    label,
    shortcut,
    onClick,
    disabled,
    iconClassName = "",
}: {
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onClick: () => void;
    disabled: boolean;
    iconClassName?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={shortcut ? `${label} (${shortcut})` : label}
        className="group relative flex size-10 items-center justify-center rounded-md text-on-scrim transition-colors hover:bg-on-scrim/15 disabled:opacity-50"
    >
        <Icon className={`size-5 ${iconClassName}`} aria-hidden="true" />
        <span
            role="tooltip"
            className="label-mono pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap bg-scrim/90 px-2 py-1 text-on-scrim opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
            {label}
            {shortcut && <span className="ml-1.5 text-on-scrim/60">{shortcut}</span>}
        </span>
    </button>
);

export const ModelControls: React.FC<ModelControlsProps> = ({
    controlsVisible,
    autoRotate,
    isIOS,
    customFullscreen,
    isFullscreen,
    renderExtraUrls,
    onToggleMenu,
    onToggleRotation,
    onResetView,
    onToggleFullscreen,
    onTakeScreenshot,
    onTouchStart,
    onTouchEnd,
    onMouseEnter,
    onMouseLeave,
}) => {
    if (renderExtraUrls.length === 0) return null;

    const position = (isIOS && customFullscreen) || isFullscreen ? "fixed" : "absolute";
    const hoverHandlers = { onMouseEnter, onMouseLeave, onTouchStart, onTouchEnd };

    return (
        <div>
            {/* Tab that slides the control bar up */}
            <div
                className={`${position} bottom-0 left-1/2 z-[999] -translate-x-1/2 cursor-pointer transition-transform duration-300 ease-forge ${
                    controlsVisible ? "pointer-events-none translate-y-full" : "translate-y-0"
                }`}
                onClick={controlsVisible ? undefined : onToggleMenu}
                {...hoverHandlers}
                role="button"
                tabIndex={0}
                aria-label="Toggle Menu (M)"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        onToggleMenu();
                    }
                }}
            >
                <div className="chamfer bg-scrim/50 px-5 py-1.5 text-on-scrim backdrop-blur-sm transition-colors [--cut:8px] hover:bg-scrim/70">
                    <ChevronUp
                        className={`size-5 transition-transform duration-300 ${controlsVisible ? "rotate-180 opacity-50" : ""}`}
                        aria-hidden="true"
                    />
                </div>
            </div>

            {/* Control bar */}
            <div
                className={`${position} bottom-0 left-0 right-0 z-[9999] transition-transform duration-300 ease-forge ${
                    controlsVisible ? "translate-y-0" : "pointer-events-none translate-y-full"
                }`}
                {...hoverHandlers}
            >
                <div className="flex items-center justify-center gap-1 bg-gradient-to-t from-scrim/70 to-scrim/30 px-4 py-2 backdrop-blur-sm">
                    <ControlButton
                        icon={RefreshCw}
                        label="Rotate"
                        shortcut="R"
                        onClick={onToggleRotation}
                        disabled={!controlsVisible}
                        iconClassName={autoRotate ? "animate-[spin_3s_linear_infinite] text-accent" : ""}
                    />
                    <ControlButton
                        icon={Focus}
                        label="Reset view"
                        shortcut="H"
                        onClick={onResetView}
                        disabled={!controlsVisible}
                    />
                    <span className="mx-2 h-5 w-px bg-on-scrim/20" aria-hidden="true" />
                    <ControlButton
                        icon={isFullscreen || customFullscreen ? Minimize : Maximize}
                        label="Fullscreen"
                        shortcut="F"
                        onClick={onToggleFullscreen}
                        disabled={!controlsVisible}
                    />
                    <ControlButton
                        icon={Camera}
                        label="Screenshot"
                        onClick={onTakeScreenshot}
                        disabled={!controlsVisible}
                    />
                </div>
            </div>
        </div>
    );
};
