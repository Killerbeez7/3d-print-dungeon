import { useState } from "react";
import { changePassword } from "../../../services/authService"; // Import the changePassword function
import { useAuth } from "../../../contexts/authContext";

export const SecuritySettings = () => {
    const { currentUser } = useAuth(); // Assuming you have the currentUser from context
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Basic validation
        if (newPassword !== confirmPassword) {
            setError("New password and confirm password must match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        setError(""); // Clear any previous errors
        setIsLoading(true);

        try {
            // Call the changePassword function from authService
            await changePassword(currentUser, currentPassword, newPassword);

            setSuccessMessage("Password successfully updated!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError("Error updating password: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-txt-primary pb-2 border-b border-br-primary">Security Settings

            </h2>

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                {/* Current Password */}
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-txt-secondary font-medium" htmlFor="currentPassword">
                        Current Password
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="relative w-2/3 px-4 py-2 border border-br-primary rounded-md bg-bg-primary text-txt-primary"
                        placeholder="Enter current password"
                        required
                    />
                </div>

                {/* New Password */}
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-txt-secondary font-medium" htmlFor="newPassword">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="relative w-2/3 px-4 py-2 border border-br-primary rounded-md bg-bg-primary text-txt-primary"
                        placeholder="Enter new password"
                        required
                    />
                </div>

                {/* Confirm Password */}
                <div className="flex justify-between items-center mb-8">
                    <label className="block text-txt-secondary font-medium" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="relative w-2/3 px-4 py-2 border border-br-primary rounded-md bg-bg-primary text-txt-primary"
                        placeholder="Confirm new password"
                        required
                    />
                </div>

                {/* Error or Success Message */}
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        className={`px-4 py-2 bg-accent text-white rounded-md ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Updating..." : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
};
