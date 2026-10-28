import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import {
  handleAuthError,
  formatErrorForDisplay,
} from "@/features/auth/utils/errorHandling";
import { CircleCheck, Eye, EyeOff, KeyRound, Link2Off, Lock } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components";
import { BrandMark } from "@/features/shared/components/BrandMark";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { Spinner } from "@/features/shared/reusable/Spinner";

const STRENGTH = [
  { max: 2, label: "Weak", text: "text-error", bar: "bg-error" },
  { max: 3, label: "Fair", text: "text-warning", bar: "bg-warning" },
  { max: 4, label: "Good", text: "text-accent", bar: "bg-accent" },
  { max: 5, label: "Strong", text: "text-success", bar: "bg-success" },
];

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
  autoComplete,
  describedBy,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  visible: boolean;
  onToggle: () => void;
  disabled: boolean;
  autoComplete: string;
  describedBy?: string;
  invalid?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-txt-secondary">
      {label}
    </label>
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-txt-muted" aria-hidden="true" />
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="field h-12 pl-10 pr-12 text-base"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  </div>
);

const Shell = ({ children }: { children: ReactNode }) => (
  <div className="relative isolate flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
    <div className="bg-buildplate fade-radial absolute inset-0 -z-10" aria-hidden="true" />
    <BrandMark className="mb-8" />
    <div className="w-full max-w-md rounded-xl border border-br-subtle bg-surface-card p-6 sm:p-8">{children}</div>
  </div>
);

export const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { open } = useModal("auth");
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode || mode !== "resetPassword") {
        setError("Invalid or expired password reset link.");
        setLoading(false);
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setLoading(false);
      } catch (err) {
        const errorMessage = handleAuthError(err);
        setError(formatErrorForDisplay(errorMessage));
        setLoading(false);
      }
    };

    verifyCode();
  }, [oobCode, mode]);

  const checkPasswordStrength = (password: string) => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Include lowercase letters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Include uppercase letters");
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Include numbers");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Include special characters");
    }

    setPasswordStrength({ score, feedback });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!oobCode) {
      setError("Invalid reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(formatErrorForDisplay(errorMessage));
    } finally {
      setVerifying(false);
    }
  };

  const strength = STRENGTH.find((level) => passwordStrength.score <= level.max) ?? STRENGTH[3];

  const goToSignIn = () => {
    navigate("/");
    open({ mode: "signin" });
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
          <Spinner size={28} />
          <p className="text-sm text-txt-secondary">Checking your reset link…</p>
        </div>
      </Shell>
    );
  }

  if (error && !success && !email) {
    return (
      <StatePanel
        icon={Link2Off}
        title="This reset link doesn't work"
        actions={
          <>
            <Button onClick={goToSignIn}>Request a new link</Button>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Go to home
            </Button>
          </>
        }
      >
        {error} Use “Forgot password” in the sign-in dialog to get a new one.
      </StatePanel>
    );
  }

  if (success) {
    return (
      <StatePanel
        icon={CircleCheck}
        title="Password updated"
        actions={<Button onClick={goToSignIn}>Sign in</Button>}
      >
        You can now sign in with your new password.
      </StatePanel>
    );
  }

  const mismatch = Boolean(confirmPassword) && newPassword !== confirmPassword;

  return (
    <Shell>
      <span className="chamfer flex size-12 items-center justify-center bg-accent-soft text-accent [--cut:9px]">
        <KeyRound className="size-5" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">Choose a new password</h1>
      {email && (
        <p className="mt-1 text-sm text-txt-secondary">
          For <span className="font-medium text-txt-primary">{email}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <PasswordInput
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={handlePasswordChange}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            disabled={verifying}
            autoComplete="new-password"
            describedBy={newPassword ? "password-strength" : undefined}
          />
          {newPassword && (
            <div id="password-strength" className="mt-2.5" aria-live="polite">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    className={`h-1 flex-1 transition-colors ${level <= passwordStrength.score ? strength.bar : "bg-muted"}`}
                  />
                ))}
              </div>
              <p className="mt-1.5 flex justify-between font-mono text-xs">
                <span className="text-txt-muted">Strength</span>
                <span className={strength.text}>{strength.label}</span>
              </p>
              {passwordStrength.feedback.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-txt-muted">
                  {passwordStrength.feedback.map((item) => (
                    <li key={item}>– {item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <PasswordInput
            id="confirm-password"
            label="Repeat new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={verifying}
            autoComplete="new-password"
            describedBy={mismatch ? "confirm-error" : undefined}
            invalid={mismatch}
          />
          {mismatch && (
            <p id="confirm-error" className="mt-1.5 text-sm text-error">
              Passwords don&apos;t match.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-txt-primary">
            {error}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={verifying}
          disabled={!newPassword || !confirmPassword || mismatch || passwordStrength.score < 3}
        >
          {verifying ? "Updating…" : "Update password"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-5 w-full text-center text-sm text-txt-secondary transition-colors hover:text-txt-primary"
      >
        Cancel
      </button>
    </Shell>
  );
};
