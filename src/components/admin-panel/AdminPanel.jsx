import React, { useState } from "react";
import { useModels } from "../../contexts/modelsContext";
import { Link } from "react-router-dom";
// Example: import your "deleteAllButFirstModel" function
import { deleteAllButFirstModel } from "../../utils/modelsCleanup";

export const AdminPanel = () => {
    const { models, loading } = useModels();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    // Clears all models except the very first, as previously discussed
    const handleClearModels = async () => {
        if (
            !window.confirm(
                "This will permanently delete all models except the very first one. Continue?"
            )
        ) {
            return;
        }

        setError("");
        setSuccess(false);
        setIsClearing(true);

        try {
            await deleteAllButFirstModel();
            setSuccess(true);
        } catch (err) {
            console.error("Error clearing models:", err);
            setError("Failed to clear models. Check console for details.");
        } finally {
            setIsClearing(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading models...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

            {/* Button to delete all but first model */}
            <button
                onClick={handleClearModels}
                disabled={isClearing}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
                {isClearing ? "Clearing Models..." : "Clear Old Models (Keep First)"}
            </button>

            {/* Status messages */}
            {error && <p className="mt-4 text-red-500">{error}</p>}
            {success && (
                <p className="mt-4 text-green-600">Old models cleared successfully!</p>
            )}

            {/* Grid of all models */}
            <div className="grid grid-cols-6 gap-4 mt-6">
                {models.map((model) => (
                    <div
                        key={model.id}
                        className="border p-2 rounded bg-white shadow-sm text-center"
                    >
                        <Link to={`/model/${model.id}`}>
                            <img
                                // If you have a low-res field, fallback to the main field or a placeholder
                                src={
                                    model.primaryRenderLowResUrl ||
                                    model.primaryRenderUrl ||
                                    "/placeholder.jpg"
                                }
                                alt={model.name || "Untitled"}
                                className="mx-auto w-16 h-16 object-cover"
                                loading="lazy"
                            />
                            <p className="text-xs mt-2 truncate">
                                {model.name || "Untitled"}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
