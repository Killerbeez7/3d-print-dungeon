import PropTypes from "prop-types";
import { useState } from "react";
import { VscSettings } from "react-icons/vsc";

export const ModelControls = ({
    offset,
    setOffset,
    shadowIntensity,
    setShadowIntensity,
    exposure,
    setExposure,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50`}>
            {/* Controls Panel */}
            <div
                className={`relative bg-bg-surface rounded-l-lg shadow-lg p-6 space-y-6 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Toggle Button - Now inside the panel */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -left-12 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white p-2 rounded-l-lg shadow-lg transition-colors duration-200"
                >
                    <VscSettings className="w-6 h-6" />
                </button>

                <h3 className="text-lg font-semibold text-txt-primary mb-4">
                    Model Controls
                </h3>

                {/* Y Offset Control */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label
                            htmlFor="yOffsetSlider"
                            className="text-sm font-medium text-txt-primary"
                        >
                            Y Offset
                        </label>
                        <span className="text-sm text-txt-secondary">
                            {offset.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="yOffsetSlider"
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={offset}
                        onChange={(e) => setOffset(parseFloat(e.target.value))}
                        className="w-full accent-accent"
                    />
                </div>

                {/* Shadow Intensity Control */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label
                            htmlFor="shadowSlider"
                            className="text-sm font-medium text-txt-primary"
                        >
                            Shadow Intensity
                        </label>
                        <span className="text-sm text-txt-secondary">
                            {shadowIntensity.toFixed(2)}
                        </span>
                    </div>
                    <input
                        id="shadowSlider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={shadowIntensity}
                        onChange={(e) => setShadowIntensity(parseFloat(e.target.value))}
                        className="w-full accent-accent"
                    />
                </div>

                {/* Exposure Control */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label
                            htmlFor="exposureSlider"
                            className="text-sm font-medium text-txt-primary"
                        >
                            Exposure
                        </label>
                        <span className="text-sm text-txt-secondary">
                            {exposure.toFixed(1)}
                        </span>
                    </div>
                    <input
                        id="exposureSlider"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={exposure}
                        onChange={(e) => setExposure(parseFloat(e.target.value))}
                        className="w-full accent-accent"
                    />
                </div>
            </div>
        </div>
    );
};

ModelControls.propTypes = {
    offset: PropTypes.number.isRequired,
    setOffset: PropTypes.func.isRequired,
    shadowIntensity: PropTypes.number.isRequired,
    setShadowIntensity: PropTypes.func.isRequired,
    exposure: PropTypes.number.isRequired,
    setExposure: PropTypes.func.isRequired,
};
