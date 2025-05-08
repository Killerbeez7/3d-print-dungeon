import { useState } from "react";
import { duplicateModels } from "../scripts/duplicateModels";

export const Scripts = () => {
    // List of scripts (expandable in the future)
    const scripts = [
        {
            name: "Duplicate Models",
            description: "Duplicate all models in the database for testing.",
            run: duplicateModels,
        },
    ];

    const [progress, setProgress] = useState(Array(scripts.length).fill(0));
    const [running, setRunning] = useState(Array(scripts.length).fill(false));

    const handleRun = async (idx) => {
        setRunning((r) => r.map((v, i) => (i === idx ? true : v)));
        setProgress((p) => p.map((v, i) => (i === idx ? 0 : v)));
        try {
            await scripts[idx].run((prog) =>
                setProgress((p) => p.map((v, i) => (i === idx ? prog : v)))
            );
        } catch (e) {
            alert("Script failed: " + e.message);
        }
        setRunning((r) => r.map((v, i) => (i === idx ? false : v)));
    };

    return (
        <div>
            <h2 className="text-lg font-bold mb-4">Scripts</h2>
            <div className="space-y-4">
                {scripts.map((script, idx) => (
                    <div
                        key={script.name}
                        className="flex items-center space-x-4 border p-2 rounded dark:bg-gray-800"
                    >
                        <div className="flex-1">
                            <div className="font-mono text-sm">{script.name}</div>
                            <div className="text-xs text-gray-500">
                                {script.description}
                            </div>
                        </div>
                        <button
                            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                            onClick={() => handleRun(idx)}
                            disabled={running[idx]}
                        >
                            {running[idx] ? "Running..." : "Run"}
                        </button>
                        <div className="w-32 h-2 bg-gray-200 rounded overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: progress[idx] + "%" }}
                            ></div>
                        </div>
                        <span className="ml-2 text-xs w-8 text-right tabular-nums">
                            {progress[idx]}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
