import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BrandMark } from "@/features/shared/components/BrandMark";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { useMaintenance } from "../hooks/useMaintenance";

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
};

export const MaintenancePage = () => {
  const navigate = useNavigate();

  const { currentUser, isAdmin } = useAuth();
  const { open } = useModal("auth");
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

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-page px-4 py-16 text-center">
      <div className="bg-buildplate fade-radial absolute inset-0 -z-10" aria-hidden="true" />
      <div className="bg-layer-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      <BrandMark size="lg" />

      <p className="label-mono mt-12 text-accent">Maintenance · re-printing the dungeon</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
        We&apos;ll be right back
      </h1>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-txt-secondary sm:text-lg">
        {status.message ?? "We're currently performing some updates to improve your experience."}
      </p>

      {/* Print-progress bar: purely decorative */}
      <div className="skeleton-print mt-10 h-2 w-64 max-w-full" aria-hidden="true" />

      {timeLeft && (
        <div className="mt-10" role="timer" aria-live="off">
          <p className="label-mono text-txt-muted">Expected back in</p>
          <div className="mt-3 flex items-center justify-center gap-2 font-mono">
            {[
              { value: timeLeft.hours, label: "h" },
              { value: timeLeft.minutes, label: "m" },
              { value: timeLeft.seconds, label: "s" },
            ].map((unit) => (
              <span
                key={unit.label}
                className="chamfer flex min-w-16 items-baseline justify-center gap-0.5 bg-surface-card px-3 py-2 [--cut:8px]"
              >
                <span className="text-3xl font-semibold text-txt-primary">{pad(unit.value)}</span>
                <span className="text-sm text-txt-muted">{unit.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        {!currentUser ? (
          <Button onClick={() => open({ mode: "signin" })}>Administrator sign in</Button>
        ) : isAdmin ? (
          <Button
            onClick={() => {
              enableAdminBypass();
              navigate("/", { replace: true });
            }}
          >
            Enter the site
          </Button>
        ) : (
          <p className="text-sm text-txt-muted">You&apos;re signed in. We&apos;ll be back shortly.</p>
        )}
      </div>

      <AuthModal />
    </div>
  );
};
