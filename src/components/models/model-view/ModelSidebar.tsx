import { useEffect, useState, ChangeEvent } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
//components
import { LikeButton } from "../action-buttons/likeButton";
import { FavoritesButton } from "../action-buttons/favoritesButton";
import { PurchaseButton } from "@/components/payment/PurchaseButton";
//contexts
import { STATIC_ASSETS } from "@/config/assetsConfig";
//types
import type { CurrentUser } from "@/types/auth";
import type { ModelData } from "@/types/model";

interface Uploader {
    photoURL?: string;
    displayName?: string;
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
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: model.name || "",
        description: model.description || "",
        tags: model.tags ? model.tags.join(", ") : "",
    });
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

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

    return (
        <aside className="w-full lg:w-[400px] flex flex-col h-full rounded-lg">
            {/* Model Info Section */}
            <div className="p-6">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-br-primary rounded px-3 py-2 text-2xl font-bold mb-3"
                            required
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-br-primary rounded px-3 py-2 mb-4"
                            rows={3}
                        />
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full border border-br-primary rounded px-3 py-2 mb-4"
                            placeholder="Tags (comma-separated)"
                        />
                        {error && <p className="text-red-600 mb-2">{error}</p>}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="bg-btn-primary text-white py-1 px-4 rounded"
                            >
                                {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="bg-bg-tertiary text-txt-primary py-1 px-4 rounded border border-br-primary"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-txt-primary mb-3">
                            {formData.name}
                        </h1>
                        <p className="text-txt-secondary mb-4">{formData.description}</p>
                        {formData.tags && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {formData.tags.split(",").map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-sm rounded-full bg-bg-surface text-txt-secondary"
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
                <div className="px-6 pb-4">
                    <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-txt-secondary">Price</p>
                                <p className="text-2xl font-bold text-accent">
                                    ${model.price}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-txt-muted">
                                    Platform fee (5%)
                                </p>
                                <p className="text-sm text-txt-secondary">
                                    -${(model.price * 0.05).toFixed(2)}
                                </p>
                                <p className="text-sm font-medium text-txt-primary">
                                    Seller earns: ${(model.price * 0.95).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons Section */}
            <div className="p-6 divider-top">
                <div className="flex gap-4 mb-4">
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
                <div className="mb-6">
                    <PurchaseButton
                        model={{ ...model, price: model.price ?? 0 }}
                        className="w-full py-4 text-base font-medium"
                    />
                </div>

                {/* Edit Button for Owner */}
                {currentUser && currentUser.uid === model.uploaderId && !isEditing && (
                    <button
                        onClick={handleEdit}
                        className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 px-4 transition-colors secondary-button"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Model
                    </button>
                )}
            </div>

            {/* Creator Info Section */}
            <div className="p-6 divider-top">
                <div className="flex items-center gap-4">
                    <img
                        src={uploader?.photoURL || STATIC_ASSETS.DEFAULT_AVATAR}
                        alt={uploader?.displayName || "Unknown User"}
                        className="w-[7em] rounded-[10px] object-cover border-2 border-br-primary"
                    />
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-txt-primary">
                            {uploader?.displayName || "Anonymous"}
                        </h2>
                        <p className="text-sm text-txt-secondary mt-1">
                            Senior 3D Artist
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <button className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                                Follow
                            </button>
                            <span className="text-sm text-txt-secondary">
                                {viewCountLoading ? "Loading..." : `${viewCount} views`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
        </aside>
    );
}
