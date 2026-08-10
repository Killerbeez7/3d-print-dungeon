import { useState, type FormEvent } from "react";

import { changePassword } from "@/features/auth/services/authService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  validateConfirmPassword,
  validatePassword,
} from "@/features/auth/utils/authUtils";
import { useSystemAlert } from "@/features/system-alerts";

type PasswordErrorField = "currentPassword" | "newPassword" | "confirmPassword" | "";

interface AuthErrorLike {
  code?: string;
  message?: string;
}

export const SecuritySettings = () => {
  const { currentUser } = useAuth();

  const { success, error: showError } = useSystemAlert();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const [errorField, setErrorField] = useState<PasswordErrorField>("");

  const [isLoading, setIsLoading] = useState(false);

  const usesPasswordProvider =
    currentUser?.providerData.some((provider) => provider.providerId === "password") ??
    false;

  const clearError = () => {
    setError("");
    setErrorField("");
  };

  const setPasswordError = (field: PasswordErrorField, message: string) => {
    setError(message);
    setErrorField(field);
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser) {
      const message = "You must be logged in to change your password.";

      setPasswordError("", message);

      showError("Authentication Error", message);

      return;
    }

    if (!usesPasswordProvider) {
      const message =
        "Password changes are only available for accounts using email and password sign-in.";

      setPasswordError("", message);

      showError("Password Change Unavailable", message);

      return;
    }

    const passwordValidation = validatePassword(newPassword);

    if (!passwordValidation.isValid) {
      const message = passwordValidation.error ?? "Please enter a valid password.";

      setPasswordError("newPassword", message);

      showError("Invalid Password", message);

      return;
    }

    const confirmValidation = validateConfirmPassword(confirmPassword, newPassword);

    if (!confirmValidation.isValid) {
      const message = confirmValidation.error ?? "Passwords do not match.";

      setPasswordError("confirmPassword", message);

      showError("Password Mismatch", message);

      return;
    }

    clearError();
    setIsLoading(true);

    try {
      await changePassword(currentUser, currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      success("Password Updated", "Your password has been successfully updated.");
    } catch (caughtError) {
      const authError = caughtError as AuthErrorLike;

      const code = authError.code ?? "";

      const isInvalidCredential =
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials";

      if (isInvalidCredential) {
        const message = "The current password is incorrect.";

        setPasswordError("currentPassword", message);

        showError("Invalid Password", message);

        return;
      }

      const message = authError.message || "Failed to update your password.";

      setPasswordError("", message);

      showError("Password Update Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!usesPasswordProvider) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary mb-2">Security Settings</h2>

          <p className="text-txt-secondary text-sm">
            Manage your account security and authentication
          </p>
        </div>

        <div className="bg-bg-surface rounded-lg border border-br-secondary p-6">
          <h3 className="text-lg font-semibold text-txt-primary mb-2">Password</h3>

          <p className="text-sm text-txt-secondary">
            Your account uses an external sign-in provider. Password changes are managed
            through that provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-txt-primary mb-2">Security Settings</h2>

        <p className="text-txt-secondary text-sm">
          Manage your account security and authentication
        </p>
      </div>

      <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-txt-primary mb-4">Change Password</h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  Current Password
                </label>

                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className={`w-full px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent border ${
                    errorField === "currentPassword"
                      ? "border-error"
                      : "border-br-secondary"
                  }`}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  New Password
                </label>

                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={`w-full px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent border ${
                    errorField === "newPassword" ? "border-error" : "border-br-secondary"
                  }`}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-txt-secondary mb-1"
              >
                Confirm New Password
              </label>

              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`w-full px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent border ${
                  errorField === "confirmPassword"
                    ? "border-error"
                    : "border-br-secondary"
                }`}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <p className="text-error text-sm transition-opacity duration-300">
                {error}
              </p>
            )}

            <div className="flex justify-start">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 cta-button ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
