import { useState } from "react";
import { changePassword } from "@/services/authService"; // Import the changePassword function
import { useAuth } from "@/hooks/useAuth";
import AlertModal from "../shared/alert-modal/AlertModal.jsx";

export const SecuritySettings = () => {
    const { currentUser } = useAuth(); // Assuming you have the currentUser from context
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorField, setErrorField] = useState("");

    //Alert modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Basic validation
        if (newPassword !== confirmPassword) {
            setError("New password and confirm password must match.");
            setErrorField("confirmPassword");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            setErrorField("newPassword");
            return;
        }

        setError(""); // Clear any previous errors
        setErrorField("");
        setIsLoading(true);

        try {
            // Call the changePassword function from authService
            await changePassword(currentUser, currentPassword, newPassword);

            setModalTitle("Success");
            setModalMessage("Your password has been successfully updated.");
            setIsModalOpen(true);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const errorMessage = err.message || "";

            // Adjust this condition depending on how Firebase or your backend returns auth errors
            if (
                errorMessage.toLowerCase().includes("password is invalid") ||
                errorMessage.toLowerCase().includes("wrong password")
            ) {
                setError("The current password is incorrect.");
                setErrorField("currentPassword");
            } else {
                setError("Error updating password: " + errorMessage);
                setErrorField(""); // No specific field to highlight
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-txt-primary pb-2">
                Security Settings
            </h2>

            <form
                onSubmit={handlePasswordChange}
                className="pt-4 flex flex-col justify-between h-full space-y-4 divider-top-left">
                {/* Input Fields */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <label
                            className="block text-txt-secondary font-medium sm:w-1/3"
                            htmlFor="currentPassword">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={`w-full md:w-2/3 px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:border-accent-hover border ${
                                errorField === "currentPassword"
                                    ? "border-error"
                                    : "border-br-secondary"
                            }`}
                            placeholder="Enter current password"
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <label
                            className="block text-txt-secondary font-medium sm:w-1/3"
                            htmlFor="newPassword">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full md:w-2/3 px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:border-accent-hover border ${
                                errorField === "newPassword"
                                    ? "border-error"
                                    : "border-br-secondary"
                            }`}
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <label
                            className="block text-txt-secondary font-medium sm:w-1/3"
                            htmlFor="confirmPassword">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full md:w-2/3 px-3 py-2 rounded-md bg-bg-secondary text-txt-primary focus:outline-none focus:border-accent-hover border ${
                                errorField === "confirmPassword"
                                    ? "border-error"
                                    : "border-br-secondary"
                            }`}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                </div>

                {/* Reserved space for error/success message */}
                <div className="min-h-[1.5rem]">
                    {error && (
                        <p className="text-error text-sm transition-opacity duration-300">
                            {error}
                        </p>
                    )}
                    <AlertModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={modalTitle}
                        message={modalMessage}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex pt-2">
                    <button
                        type="submit"
                        className={`px-4 py-2 cta-button ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}>
                        {isLoading ? "Updating..." : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
};
