import { useEffect, useState, ChangeEvent } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotification } from "@/features/notifications/hooks/useNotification";
//components
import { LikeButton } from "../likeButton";
import { FavoritesButton } from "../favoritesButton";
import { PurchaseButton } from "@/features/payment/components/PurchaseButton";
import { FollowButton } from "@/features/user/components/FollowButton";
import { H4, H5 } from "@/components/ResponsiveHeading";

//types
import type { CurrentUser } from "@/features/user/types/user";
import type { ModelData } from "@/features/models/types/model";

interface Uploader {
    username?: string;
    displayName?: string;
    photoURL?: string | null;
}

interface ModelSidebarProps {
    model: ModelData;
    uploader?: Uploader;
    viewCount: number;
    viewCountLoading?: boolean;
    currentUser: CurrentUser | null;
    openAuthModal: () => void;
}

export function ModelSidebar({
    model,
    uploader,
    viewCount,
    viewCountLoading,
    currentUser,
    openAuthModal,
}: ModelSidebarProps) {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const notification = useNotification();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: model.name || "",
        description: model.description || "",
        tags: model.tags ? model.tags.join(", ") : "",
    });
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

    // Keep formData in sync if model changes (e.g. after update)
    useEffect(() => {
        setFormData({
            name: model.name || "",
            description: model.description || "",
            tags: model.tags ? model.tags.join(", ") : "",
        });
    }, [model]);

    // Handle input changes
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Start editing
    const handleEdit = () => {
        setIsEditing(true);
        setError("");
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: model.name || "",
            description: model.description || "",
            tags: model.tags ? model.tags.join(", ") : "",
        });
        setError("");
    };

    // Save edited model info
    const handleSave = async () => {
        setIsUpdating(true);
        setError("");
        try {
            const docRef = doc(db, "models", model.id);
            await updateDoc(docRef, {
                name: formData.name,
                description: formData.description,
                tags: formData.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
            });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError("Failed to update model.");
        }
        setIsUpdating(false);
    };

    // Delete model using Cloud Function
    const handleDelete = async () => {
        setIsDeleting(true);
        setError("");
        try {
            // Import the delete function from the service
            const { deleteModel } = await import("../../services/modelsService");
            await deleteModel(model.id);
            
            // Show success notification
            notification.success("Model Deleted", "The model has been successfully deleted.");
            
            // Navigate to home page after successful deletion
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Failed to delete model.");
            setIsDeleting(false);
        }
    };

    return (
        <aside className="w-full lg:w-[400px] flex flex-col h-full rounded-lg overflow-y-auto">
            {/* Model Info Section */}
            <div className="p-4 pt-0 lg:p-6">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-br-primary rounded px-3 py-2 text-lg lg:text-2xl font-bold mb-3"
                            required
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-br-primary rounded px-3 py-2 mb-4 text-sm lg:text-base"
                            rows={3}
                        />
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full border border-br-primary rounded px-3 py-2 mb-4 text-sm lg:text-base"
                            placeholder="Tags (comma-separated)"
                        />
                        {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="bg-btn-primary text-white py-2 px-4 rounded text-sm lg:text-base flex-1"
                            >
                                {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="bg-bg-tertiary text-txt-primary py-2 px-4 rounded border border-br-primary text-sm lg:text-base flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <H4 className="text-base lg:text-lg font-bold text-txt-primary mb-3">
                            {formData.name}
                        </H4>
                        <p className="text-txt-secondary mb-4 text-sm lg:text-base leading-relaxed">
                            {formData.description}
                        </p>
                        {formData.tags && (
                            <div className="flex flex-wrap gap-1 lg:gap-2 mt-4">
                                {formData.tags.split(",").map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-full bg-bg-surface text-txt-secondary"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pricing Section */}
            {model.isPaid && model.price && model.price > 0 && (
                <div className="px-4 lg:px-6 pb-4">
                    <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-3 lg:p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div>
                                <p className="text-xs lg:text-sm text-txt-secondary">
                                    Price
                                </p>
                                <p className="text-xl lg:text-2xl font-bold text-accent">
                                    ${model.price}
                                </p>
                            </div>
                            <div className="text-left lg:text-right">
                                <p className="text-xs text-txt-muted">
                                    Platform fee (5%)
                                </p>
                                <p className="text-xs lg:text-sm text-txt-secondary">
                                    -${(model.price * 0.05).toFixed(2)}
                                </p>
                                <p className="text-xs lg:text-sm font-medium text-txt-primary">
                                    Seller earns: ${(model.price * 0.95).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons Section */}
            <div className="p-4 lg:p-6 divider-top">
                <div className="flex gap-3 lg:gap-4 mb-4">
                    <LikeButton
                        modelId={model.id}
                        initialLikes={model.likes}
                        currentUser={currentUser}
                        openAuthModal={openAuthModal}
                    />
                    <FavoritesButton
                        modelId={model.id}
                        currentUser={currentUser}
                        openAuthModal={openAuthModal}
                    />
                </div>

                {/* Purchase/Download Button */}
                <div className="mb-4 lg:mb-6">
                    <PurchaseButton
                        model={{
                            ...model,
                            price: model.price ?? 0,
                            uploaderId: model.uploaderId ?? "",
                        }}
                        className="w-full py-3 lg:py-4 text-sm lg:text-base font-medium"
                    />
                </div>

                {/* Edit and Delete Buttons for Owner or Admin */}
                {currentUser && (currentUser.uid === model.uploaderId || isAdmin) && !isEditing && (
                    <div className="mb-4 lg:mb-6 space-y-3">
                        <button
                            onClick={handleEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white w-full py-3 lg:py-4 text-sm lg:text-base font-medium transition-colors rounded-lg shadow-sm hover:shadow-md"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 lg:h-5 lg:w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                <span>Edit Model</span>
                            </span>
                        </button>
                        
                        {showDeleteConfirm ? (
                            <div className="space-y-2">
                                <p className="text-sm text-red-600 text-center">Are you sure? This action cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded text-sm lg:text-base font-medium flex-1 transition-colors"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isDeleting}
                                        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 px-4 rounded text-sm lg:text-base font-medium flex-1 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                                                         <button
                                 onClick={() => setShowDeleteConfirm(true)}
                                 className="bg-red-600 hover:bg-red-700 text-white w-full py-3 lg:py-4 text-sm lg:text-base font-medium transition-colors rounded-lg shadow-sm hover:shadow-md"
                             >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 lg:h-5 lg:w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>Delete Model</span>
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Creator Info Section */}
            <div className="p-4 lg:p-6 divider-top">
                <div className="flex items-center gap-3 lg:gap-4">
                    <img
                        src={uploader?.photoURL || "/assets/images/user.png"}
                        alt={uploader?.displayName || "Unknown User"}
                        className="w-14 h-14 lg:w-20 lg:h-20 rounded-lg lg:rounded-[10px] object-cover border-2 border-br-primary"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/assets/images/user.png";
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <H5 className="text-base lg:text-lg font-semibold text-txt-primary">
                            <span className="block truncate" title={uploader?.displayName || "Anonymous"}>
                                {uploader?.displayName || "Anonymous"}
                            </span>
                        </H5>
                        <p className="text-xs lg:text-sm text-txt-secondary mt-1">
                            Senior 3D Artist
                        </p>
                        <div className="flex items-center gap-2 lg:gap-3 mt-2">
                            {model.uploaderId && (
                                <FollowButton
                                    targetUserId={model.uploaderId}
                                    targetUserName={uploader?.displayName || undefined}
                                    size="sm"
                                    variant="primary"
                                    openAuthModal={openAuthModal}
                                />
                            )}
                            <span className="text-xs lg:text-sm text-txt-secondary">
                                {viewCountLoading ? "Loading..." : `${viewCount} views`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
