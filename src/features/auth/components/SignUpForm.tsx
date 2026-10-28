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
import { Button } from "@/components";

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export const SignUpForm = ({ onSwitchToSignIn }: SignUpFormProps) => {
  const { handleEmailSignUp, handleGoogleSignIn } = useAuth();

  const { fields, handleFieldChange, handleFieldBlur, validateAllFields, getFieldError } =
    useProgressiveValidation({
      initialValues: {
        email: "",
        password: "",
        confirmPassword: "",
      },
      mode: "signup",
    });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

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

    // Validate on submit so a problem is always explained, never a silent no-op.
    const results = await validateAllFields();
    if (Object.values(results).some((result) => !result.isValid)) {
      setError("Please fix the highlighted fields.");
      return;
    }

    // Check if passwords match
    if (fields.password.value !== fields.confirmPassword.value) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await handleEmailSignUp(fields.email.value, fields.password.value);
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

        <AuthField
          name="password"
          label="Password"
          type="password"
          icon={Lock}
          field={fields.password}
          error={getFieldError("password")}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClear={() => handleClearField("password")}
          isVisible={showPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
        />

        <AuthField
          name="confirmPassword"
          label="Confirm password"
          type="password"
          icon={Lock}
          field={fields.confirmPassword}
          error={getFieldError("confirmPassword")}
          autoComplete="new-password"
          placeholder="Repeat your password"
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClear={() => handleClearField("confirmPassword")}
          isVisible={showConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        {error && <AuthAlert message={error} />}

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={loading}
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-txt-secondary">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-link transition-colors hover:text-link-hover hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};
