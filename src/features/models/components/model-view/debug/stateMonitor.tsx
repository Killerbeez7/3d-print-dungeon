/**
 * State Monitor - Always visible in top-left corner
 * example: usage
 *
 * <StateMonitor
 * modelGlobalStatus={modelGlobalStatus}
 * modelLoadProgress={modelLoadProgress}
 * modelViewerProgress={modelViewerProgress}
 * isLoadButtonClicked={isLoadButtonClicked}
 * isModelCached={isModelCached}
 * threeImported={threeImported}
 * />
 **/

interface StateMonitorProps {
    modelGlobalStatus: string;
    modelLoadProgress: number;
    modelViewerProgress: number;
    isLoadButtonClicked: boolean;
    isModelCached: boolean;
    threeImported: boolean;
}

export const StateMonitor = ({
    modelGlobalStatus,
    modelLoadProgress,
    modelViewerProgress,
    isLoadButtonClicked,
    isModelCached,
    threeImported,
}: StateMonitorProps) => (
    <>
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm z-50 font-mono">
            <div className="font-bold mb-1">State Monitor</div>
            <div>
                Status:{" "}
                <span
                    className={`${
                        modelGlobalStatus === "loaded"
                            ? "text-green-400"
                            : modelGlobalStatus === "loading"
                            ? "text-yellow-400"
                            : "text-gray-400"
                    }`}
                >
                    {modelGlobalStatus}
                </span>
            </div>
            <div>
                Download:{" "}
                <span className="text-cyan-400">
                    {Math.round(modelLoadProgress * 100)}%
                </span>
            </div>
            <div>
                Viewer:{" "}
                <span className="text-blue-400">
                    {Math.round(modelViewerProgress * 100)}%
                </span>
            </div>
            <div>
                Requested:{" "}
                <span className={isLoadButtonClicked ? "text-green-400" : "text-red-400"}>
                    {isLoadButtonClicked ? "Yes" : "No"}
                </span>
            </div>
            <div>
                Cached:{" "}
                <span className={isModelCached ? "text-green-400" : "text-gray-400"}>
                    {isModelCached ? "Yes" : "No"}
                </span>
            </div>
            <div>
                Three.js:{" "}
                <span className={threeImported ? "text-green-400" : "text-red-400"}>
                    {threeImported ? "Loaded" : "Loading"}
                </span>
            </div>
        </div>
    </>
);
