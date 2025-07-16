import { useState } from "react";
import { duplicateModels } from "../scripts/duplicateModels";
import { deleteAllModelsAndRelated } from "../scripts/deleteAllModels";
import { refreshIdToken } from "@/features/auth/utils/refreshIdToken";

interface ScriptDef {
    name: string;
    description: string;
    run: (onProgress: (progress: number) => void) => Promise<void>;
}

export const Scripts = () => {
    const scripts: ScriptDef[] = [
        {
            name: "Duplicate Models",
            description: "Duplicate all models in the database for testing.",
            run: duplicateModels,
        },
        {
            name: "Delete All Models",
            description:
                "Delete ALL models and all related data (comments, likes, views, favorites, user uploads, and files in storage). This action is IRREVERSIBLE!",
            run: deleteAllModelsAndRelated,
        },
    ];

    const [progress, setProgress] = useState<number[]>(Array(scripts.length).fill(0));
    const [running, setRunning] = useState<boolean[]>(Array(scripts.length).fill(false));
    const [complete, setComplete] = useState<boolean[]>(
        Array(scripts.length).fill(false)
    );
    const [claims, setClaims] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);

    const handleRun = async (idx: number) => {
        setRunning((r) => r.map((v, i) => (i === idx ? true : v)));
        setProgress((p) => p.map((v, i) => (i === idx ? 0 : v)));
        setComplete((c) => c.map((v, i) => (i === idx ? false : v)));
        try {
            await scripts[idx].run((prog) =>
                setProgress((p) => p.map((v, i) => (i === idx ? prog : v)))
            );
            setComplete((c) => c.map((v, i) => (i === idx ? true : v)));
            setTimeout(() => {
                setComplete((c) => c.map((v, i) => (i === idx ? false : v)));
            }, 3000);
        } catch (e) {
            alert("Script failed: " + (e instanceof Error ? e.message : String(e)));
        }
        setRunning((r) => r.map((v, i) => (i === idx ? false : v)));
    };

    const checkClaims = async () => {
        setLoading(true);
        try {
            const claims = await refreshIdToken();
            console.log("Current claims:", claims);
            setClaims(claims);
        } catch (err) {
            console.error("Error checking claims:", err);
        }
        setLoading(false);
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
                        {complete[idx] && (
                            <span className="ml-4 text-green-600 font-bold text-xs">
                                Complete
                            </span>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-4 items-center">
                <button
                    onClick={checkClaims}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover"
                    disabled={loading}
                >
                    {loading ? "Checking..." : "Check Current Claims"}
                </button>
            </div>

            {claims != null && (
                <pre className="p-4 bg-bg-secondary rounded-lg overflow-auto">
                    {typeof claims === "string"
                        ? claims
                        : JSON.stringify(claims, null, 2)}
                </pre>
            )}
        </div>
    );
};
