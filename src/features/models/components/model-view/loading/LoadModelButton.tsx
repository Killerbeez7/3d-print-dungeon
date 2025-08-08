interface LoadModelButtonProps {
    handleLoadModel: () => void;
}

export const LoadModelButton = ({ handleLoadModel }: LoadModelButtonProps) => {
    return (
        <>
            {/* Overlay for darkening */}
            <div className="absolute inset-0 bg-black/30" />
            {/* Center the load button */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                {/* Load Model Button */}
                <button
                    onClick={handleLoadModel}
                    className="group px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
                >
                    <div className="flex items-center gap-3">
                        <svg
                            className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                        <span>Load 3D Model</span>
                    </div>
                </button>
            </div>
        </>
    );
};
