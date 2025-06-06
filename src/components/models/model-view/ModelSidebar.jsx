import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
//components
import { LikeButton } from "../action-buttons/likeButton";
import { FavoritesButton } from "../action-buttons/favoritesButton";
//contexts
import { STATIC_ASSETS } from "@/config/assetsConfig";

export const ModelSidebar = ({
    model,
    uploader,
    viewCount,
    currentUser,
    openAuthModal,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: model.name || "",
        description: model.description || "",
        tags: model.tags ? model.tags.join(", ") : "",
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");

    // Keep formData in sync if model changes (e.g. after update)
    useEffect(() => {
        setFormData({
            name: model.name || "",
            description: model.description || "",
            tags: model.tags ? model.tags.join(", ") : "",
        });
    }, [model]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError("");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: model.name || "",
            description: model.description || "",
            tags: model.tags ? model.tags.join(", ") : "",
        });
        setError("");
    };

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
                            rows="3"
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
                                className="bg-btn-primary text-white py-1 px-4 rounded">
                                {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="bg-bg-tertiary text-txt-primary py-1 px-4 rounded border border-br-primary">
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-txt-primary mb-3">
                            {formData.name}
                        </h1>
                        <p className="text-txt-secondary mb-4">
                            {formData.description}
                        </p>
                        {formData.tags && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {formData.tags.split(",").map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-sm rounded-full bg-bg-surface text-txt-secondary">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

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

                <div className="grid grid-cols-2 gap-3 pb-6">
                    {model.originalFileUrl && (
                        <button
                            onClick={() =>
                                window.open(model.originalFileUrl, "_blank")
                            }
                            className="cta-button flex items-center justify-center gap-2 py-4 px-2.5 text-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Download (STL)
                        </button>
                    )}
                    {model.convertedFileUrl &&
                        model.convertedFileUrl !== model.originalFileUrl && (
                            <button
                                onClick={() =>
                                    window.open(
                                        model.convertedFileUrl,
                                        "_blank"
                                    )
                                }
                                className="secondary-button flex items-center justify-center gap-2 py-4 px-2.5 text-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Download (glTF)
                            </button>
                        )}
                </div>

                {/* Edit Button for Owner */}
                {currentUser &&
                    currentUser.uid === model.uploaderId &&
                    !isEditing && (
                        <button
                            onClick={handleEdit}
                            className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 px-4 transition-colors secondary-button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor">
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
                                {viewCount} views
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
        </aside>
    );
};

ModelSidebar.propTypes = {
    model: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        likes: PropTypes.number,
        uploaderId: PropTypes.string,
        originalFileUrl: PropTypes.string,
        convertedFileUrl: PropTypes.string,
    }).isRequired,
    uploader: PropTypes.shape({
        photoURL: PropTypes.string,
        displayName: PropTypes.string,
    }),
    viewCount: PropTypes.number.isRequired,
    currentUser: PropTypes.object,
    openAuthModal: PropTypes.func.isRequired,
};
