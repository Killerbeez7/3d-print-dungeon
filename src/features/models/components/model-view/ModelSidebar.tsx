import { useEffect, useState, ChangeEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSystemAlert } from "@/features/system-alerts/hooks/useSystemAlert";
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
    const notification = useSystemAlert();
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
        <aside className="w-full lg:w-[400px] flex flex-col h-full overflow-y-auto rounded-lg">
            {/* Model Info Section */}
            <section className="px-4 pb-5 pt-0 lg:px-6 lg:pb-6">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mb-3 w-full rounded-lg border border-br-secondary bg-surface-card px-3 py-2 text-lg font-bold text-txt-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 lg:text-2xl"
                            required
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mb-4 w-full rounded-lg border border-br-secondary bg-surface-card px-3 py-2 text-sm text-txt-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 lg:text-base"
                            rows={3}
                        />
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="mb-4 w-full rounded-lg border border-br-secondary bg-surface-card px-3 py-2 text-sm text-txt-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 lg:text-base"
                            placeholder="Tags (comma-separated)"
                        />
                        {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-btn-primary-text transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-60 lg:text-base"
                            >
                                {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="flex-1 rounded-lg border border-br-secondary bg-bg-surface px-4 py-2 text-sm font-medium text-txt-primary transition-colors hover:border-br-primary hover:bg-bg-tertiary focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-60 lg:text-base"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <H4 className="mb-3 text-base font-bold text-txt-primary lg:text-lg">
                            {formData.name}
                        </H4>
                        <p className="text-sm leading-relaxed text-txt-secondary lg:text-base">
                            {formData.description}
                        </p>
                        {formData.tags && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {formData.tags.split(",").map((tag, i) => (
                                    <span
                                        key={i}
                                        className="rounded-full border border-br-subtle bg-bg-surface px-2.5 py-1 text-xs text-txt-secondary"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Action Buttons Section */}
            <section className="border-t border-br-subtle px-4 py-5 lg:px-6">
                {model.isPaid && model.price && model.price > 0 && (
                    <div className="mb-3">
                        <p className="text-xs font-medium uppercase text-txt-muted">Price</p>
                        <p className="mt-1 text-2xl font-semibold leading-tight text-txt-primary">
                            ${model.price}
                        </p>
                    </div>
                )}

                {/* Purchase/Download Button */}
                <div className="mb-4">
                    <PurchaseButton
                        model={{
                            ...model,
                            price: model.price ?? 0,
                            uploaderId: model.uploaderId ?? "",
                        }}
                        className="h-12 w-full text-sm font-semibold lg:text-base"
                    />
                </div>

                <div className="flex gap-3">
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

                {/* Edit and Delete Buttons for Owner or Admin */}
                {currentUser && (currentUser.uid === model.uploaderId || isAdmin) && !isEditing && (
                    <div className="mt-5 border-t border-br-subtle pt-4">
                        <p className="mb-3 text-xs font-medium uppercase text-txt-muted">
                            Owner actions
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <button
                                onClick={handleEdit}
                                className="h-11 w-full rounded-lg border border-br-secondary bg-bg-surface px-4 text-sm font-medium text-txt-primary transition-colors hover:border-br-primary hover:bg-bg-tertiary focus:outline-none focus:ring-2 focus:ring-focus"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <Pencil className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden="true" />
                                    <span>Edit Model</span>
                                </span>
                            </button>

                            {showDeleteConfirm ? (
                                <div className="space-y-3 rounded-lg border border-error/40 bg-error/5 p-3 sm:col-span-2 lg:col-span-1">
                                    <p className="text-sm text-error">Delete this model? This action cannot be undone.</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="h-10 flex-1 rounded-lg bg-error px-4 text-sm font-medium text-txt-inverse transition-colors hover:bg-error-hover focus:outline-none focus:ring-2 focus:ring-error disabled:bg-btn-disabled disabled:opacity-70"
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isDeleting}
                                            className="h-10 flex-1 rounded-lg border border-br-secondary bg-bg-surface px-4 text-sm font-medium text-txt-primary transition-colors hover:border-br-primary hover:bg-bg-tertiary focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-70"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="h-11 w-full rounded-lg border border-error/50 bg-transparent px-4 text-sm font-medium text-error transition-colors hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-error/60"
                                >
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden="true" />
                                        <span>Delete Model</span>
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Creator Info Section */}
            <section className="border-t border-br-subtle px-4 py-5 lg:px-6">
                <p className="mb-3 text-xs font-medium uppercase text-txt-muted">
                    Creator
                </p>
                <div className="flex items-center gap-3 rounded-lg bg-surface-card/60 p-3 lg:gap-4">
                    <img
                        src={uploader?.photoURL || "/assets/images/user.png"}
                        alt={uploader?.displayName || "Unknown User"}
                        className="h-14 w-14 rounded-lg border border-br-secondary object-cover lg:h-16 lg:w-16"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/assets/images/user.png";
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <H5 className="text-base font-semibold text-txt-primary">
                            <span className="block truncate" title={uploader?.displayName || "Anonymous"}>
                                {uploader?.displayName || "Anonymous"}
                            </span>
                        </H5>
                        <p className="mt-1 text-xs text-txt-secondary">
                            Senior 3D Artist
                        </p>
                        <div className="mt-3 flex items-center gap-2 lg:gap-3">
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
            </section>
        </aside>
    );
}
