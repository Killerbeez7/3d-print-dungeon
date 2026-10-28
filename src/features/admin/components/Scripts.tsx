import { useState } from "react";
import { Button } from "@/components";
import { duplicateModels } from "../scripts/duplicateModels";
import { deleteAllModelsAndRelated } from "../scripts/deleteAllModels";
import { refreshIdToken } from "@/features/auth/utils/refreshIdToken";
import { UsersRound } from "lucide-react";
import { SystemNotificationsTest } from "./SystemNotificationsTest";
import { CookieManagement } from "./CookieManagement";

interface ScriptDef {
  name: string;
  description: string;
  run: (onProgress: (progress: number) => void) => Promise<void>;
  destructive?: boolean;
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
      destructive: true,
    },
  ];

  const [progress, setProgress] = useState<number[]>(Array(scripts.length).fill(0));
  const [running, setRunning] = useState<boolean[]>(Array(scripts.length).fill(false));
  const [complete, setComplete] = useState<boolean[]>(Array(scripts.length).fill(false));
  const [claims, setClaims] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (idx: number) => {
    // Destructive scripts hit the shared production database: make the user type the name.
    if (scripts[idx].destructive) {
      const typed = window.prompt(
        `This permanently deletes data and cannot be undone.\nType "${scripts[idx].name}" to run it.`
      );
      if (typed !== scripts[idx].name) return;
    }
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
      <h2 className="text-lg font-bold mb-4 text-txt-primary">Scripts</h2>

      {/* System Alerts Testing */}
      <SystemNotificationsTest />

      {/* Cookie Management Section */}
      <CookieManagement />

      {/* Database Scripts Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <UsersRound className="size-4 mr-2 text-accent" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-txt-primary">Database Scripts</h3>
        </div>

        <div className="space-y-4">
          {scripts.map((script, idx) => (
            <div
              key={script.name}
              className={`flex items-center gap-4 rounded-lg border bg-surface-card p-3 ${
                script.destructive ? "border-error/50" : "border-br-subtle"
              }`}
            >
              <div className="flex-1">
                <div className="font-mono text-sm text-txt-primary">{script.name}</div>
                <div className="text-xs text-txt-secondary">{script.description}</div>
              </div>
              <Button
                size="sm"
                variant={script.destructive ? "danger" : "secondary"}
                onClick={() => handleRun(idx)}
                disabled={running[idx]}
              >
                {running[idx] ? "Running…" : "Run"}
              </Button>
              <div className="w-32 h-2 bg-muted rounded overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: progress[idx] + "%" }}
                ></div>
              </div>
              <span className="ml-2 text-xs w-8 text-right tabular-nums">
                {progress[idx]}%
              </span>
              {complete[idx] && (
                <span className="ml-4 text-success font-bold text-xs">Complete</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Claims Checker */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-txt-primary mb-4">
          User Claims Checker
        </h3>
        <div className="flex gap-4 items-center">
          <button
            onClick={checkClaims}
            className="px-4 py-2 bg-btn-primary text-btn-primary-text rounded-lg hover:bg-btn-primary-hover"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Current Claims"}
          </button>
        </div>

        {claims != null && (
          <pre className="p-4 bg-section rounded-lg overflow-auto mt-4">
            {typeof claims === "string" ? claims : JSON.stringify(claims, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
