import React, { useState } from "react";
import { useComments } from "../../../contexts/CommentsContext";
import { useAuth } from "../../../contexts/authContext";
import { FaStar } from "react-icons/fa";

const StarRating = ({ value, onChange, disabled = false, size = 20 }) => {
    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    size={size}
                    onClick={() => !disabled && onChange(star)}
                    color={star <= value ? "#ffc107" : "#e4e5e9"}
                    className={
                        disabled
                            ? "cursor-default"
                            : "cursor-pointer hover:scale-110 transition-transform"
                    }
                />
            ))}
        </div>
    );
};

export const Comments = () => {
    const { currentUser } = useAuth();
    const { comments, loading, submitComment, removeComment, updateComment } =
        useComments();
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(0);
    const [error, setError] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [editingRating, setEditingRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && rating === 0) return;
        try {
            await submitComment({
                text: newComment,
                rating,
                userId: currentUser?.uid || "anonymous",
                userName: currentUser?.displayName || "Anonymous",
            });
            setNewComment("");
            setRating(0);
        } catch (err) {
            console.error("Error adding comment:", err);
            setError("Error adding comment");
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await removeComment(commentId);
        } catch (error) {
            console.error("Error deleting comment:", error);
            setError("Error deleting comment");
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text);
        setEditingRating(comment.rating || 0);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingText("");
        setEditingRating(0);
    };

    const saveEditing = async (commentId) => {
        if (!editingText.trim() && editingRating === 0) return;
        try {
            await updateComment(commentId, {
                text: editingText,
                rating: editingRating,
            });
            cancelEditing();
        } catch (err) {
            console.error("Error editing comment:", err);
            setError("Error editing comment");
        }
    };

    return (
        <div className="mt-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Comments & Reviews
            </h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                        rows="3"
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600 dark:text-gray-300">
                                Rating:
                            </span>
                            <StarRating
                                value={rating}
                                onChange={setRating}
                                disabled={!currentUser}
                                size={20}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Please <span className="font-semibold">sign in</span> to comment or
                    rate.
                </p>
            )}
            {loading ? (
                <p className="text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="text-gray-500">No comments yet. Be the first to review!</p>
            ) : (
                <ul className="space-y-6">
                    {comments.map((comment) => {
                        const isOwner = currentUser && currentUser.uid === comment.userId;
                        const isEditing = editingCommentId === comment.id;
                        if (isEditing) {
                            return (
                                <li
                                    key={comment.id}
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                                >
                                    <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {comment.userName}
                                    </div>
                                    <textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-accent"
                                        rows="2"
                                    />
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            Rating:
                                        </span>
                                        <StarRating
                                            value={editingRating}
                                            onChange={setEditingRating}
                                            disabled={false}
                                            size={18}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => saveEditing(comment.id)}
                                            className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </li>
                            );
                        }
                        return (
                            <li
                                key={comment.id}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {comment.userName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {comment.rating !== undefined &&
                                        comment.rating !== null
                                            ? `Rating: ${comment.rating}/5`
                                            : ""}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {comment.text}
                                </p>
                                {isOwner && (
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button
                                            onClick={() => startEditing(comment)}
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-sm text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Comments;
