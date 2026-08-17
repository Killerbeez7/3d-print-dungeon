import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMaintenance } from "../hooks/useMaintenance";

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
};

export const MaintenancePage = () => {
  const navigate = useNavigate();

  const { currentUser, isAdmin } = useAuth();
  const { status, loading, enableAdminBypass } = useMaintenance();

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!loading && status && !status.inMaintenance) {
      navigate("/", { replace: true });
    }
  }, [loading, status, navigate]);

  // Update countdown timer.
  useEffect(() => {
    if (!status?.endTime) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const diff = status.endTime!.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
      });
    };

    updateTimer();

    const timer = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [status?.endTime]);

  if (loading || !status) {
    return null;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-br-secondary bg-surface-card p-8 text-center shadow-2xl">
        <div className="mb-8">
          <img
            src="/logo.png"
            alt="3D Print Dungeon"
            className="mx-auto mb-6 h-16 w-auto"
          />

          <h1 className="mb-4 text-4xl font-bold text-txt-primary">Under Maintenance</h1>

          <div className="mb-6 text-xl text-txt-secondary">
            {status.message ??
              "We're currently performing some updates to improve your experience."}
          </div>

          {timeLeft && (
            <div className="mb-6 text-lg font-medium text-accent">
              Expected completion in: {timeLeft.hours}h {timeLeft.minutes}m{" "}
              {timeLeft.seconds}s
            </div>
          )}

          {!currentUser ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 rounded-lg bg-accent px-6 py-3 text-white transition-colors hover:bg-accent-hover"
            >
              Sign in
            </button>
          ) : isAdmin ? (
            <button
              type="button"
              onClick={() => {
                enableAdminBypass();
                navigate("/", { replace: true });
              }}
              className="mt-6 rounded-lg bg-accent px-6 py-3 text-white transition-colors hover:bg-accent-hover"
            >
              Access Site
            </button>
          ) : null}
        </div>

        <div className="border-t border-br-secondary pt-6">
          <p className="text-sm text-txt-secondary">
            If you&apos;re an administrator, please sign in to access the site.
          </p>
        </div>
      </div>
    </div>
  );
};
