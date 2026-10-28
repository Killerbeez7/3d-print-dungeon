import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProgressiveValidation } from "@/features/auth/hooks/useProgressiveValidation";
import {
  handleAuthError,
  formatErrorForDisplay,
  isAuthPopupCancellation,
} from "@/features/auth/utils/errorHandling";
import { Lock, Mail } from "lucide-react";
import { AuthField } from "./AuthField";
import { AuthAlert, AuthDivider, GoogleButton } from "./AuthExtras";
import { PasswordResetModal } from "./PasswordResetModal";
import { Button } from "@/components";

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

export const SignInForm = ({ onSwitchToSignUp }: SignInFormProps) => {
  const { handleEmailSignIn, handleGoogleSignIn } = useAuth();

  const { fields, handleFieldChange, handleFieldBlur, isFormValid, getFieldError } =
    useProgressiveValidation({
      initialValues: {
        email: "",
        password: "",
      },
      mode: "signin",
    });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
  };

  const handleInputBlur = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    await handleFieldBlur(name, value);
  };

  const handleClearField = (fieldName: string) => {
    handleFieldChange(fieldName, "");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await handleEmailSignIn(fields.email.value, fields.password.value);
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(formatErrorForDisplay(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (): Promise<void> => {
    setError(null);

    try {
      await handleGoogleSignIn();
    } catch (err) {
      if (isAuthPopupCancellation(err)) return;

      const errorMessage = handleAuthError(err);
      setError(formatErrorForDisplay(errorMessage));
    }
  };

  return (
    <div className="space-y-5">
      <GoogleButton onClick={() => void handleGoogle()} disabled={loading} />

      <AuthDivider label="or with email" />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          name="email"
          label="Email"
          type="email"
          icon={Mail}
          field={fields.email}
          error={getFieldError("email")}
          autoComplete="email"
          placeholder="you@example.com"
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClear={() => handleClearField("email")}
        />

        <div>
          <AuthField
            name="password"
            label="Password"
            type="password"
            icon={Lock}
            field={fields.password}
            error={getFieldError("password")}
            autoComplete="current-password"
            placeholder="Your password"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onClear={() => handleClearField("password")}
            isVisible={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="text-sm font-medium text-link transition-colors hover:text-link-hover hover:underline"
              onClick={() => setShowPasswordReset(true)}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {error && <AuthAlert message={error} />}

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={loading}
          disabled={!isFormValid() || loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-txt-secondary">
        New here?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-link transition-colors hover:text-link-hover hover:underline"
        >
          Create an account
        </button>
      </p>

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </div>
  );
};
