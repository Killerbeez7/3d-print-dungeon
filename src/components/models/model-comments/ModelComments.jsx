import React, { useState } from "react";
import { useComments } from "../../../contexts/CommentsContext";
import { useAuth } from "../../../contexts/authContext";

export const Comments = () => {
    const { currentUser } = useAuth();
    const { comments, loading, submitComment, removeComment, updateComment } =
        useComments();
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(0);
    const [error, setError] = useState("");

    // State for editing an existing comment
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [editingRating, setEditingRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
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
        if (!window.confirm("Are you sure you want to delete this comment?"))
            return;
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
        if (!editingText.trim()) return;
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
        <div className="mt-8 bg-bg-surface p-4 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Comments & Reviews</h3>
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-4">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Leave a comment..."
                        className="w-full border border-br-primary rounded px-3 py-2 mb-2"
                        rows="3"
                    />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm">Rating:</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="border border-br-primary rounded px-2 py-1"
                        >
                            {[0, 1, 2, 3, 4, 5].map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="bg-btn-primary text-white px-4 py-2 rounded"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-sm text-gray-600 mb-4">
                    Please sign in to comment.
                </p>
            )}

            {loading ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="text-sm text-gray-600">No comments yet.</p>
            ) : (
                <ul className="space-y-4">
                    {comments.map((comment) => {
                        const isOwner =
                            currentUser && currentUser.uid === comment.userId;
                        const isEditing = editingCommentId === comment.id;

                        if (isEditing) {
                            return (
                                <li
                                    key={comment.id}
                                    className="border border-gray-300 rounded p-3"
                                >
                                    <div className="mb-2 text-sm font-semibold">
                                        {comment.userName}
                                    </div>
                                    <textarea
                                        value={editingText}
                                        onChange={(e) =>
                                            setEditingText(e.target.value)
                                        }
                                        className="w-full border border-br-primary rounded px-2 py-1 mb-2"
                                        rows="2"
                                    />
                                    <div className="flex items-center space-x-2 mb-2">
                                        <label className="text-xs">
                                            Rating:
                                        </label>
                                        <select
                                            value={editingRating}
                                            onChange={(e) =>
                                                setEditingRating(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="border border-br-primary rounded px-1 py-0.5 text-xs"
                                        >
                                            {[0, 1, 2, 3, 4, 5].map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex space-x-2 justify-end">
                                        <button
                                            onClick={() =>
                                                saveEditing(comment.id)
                                            }
                                            className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="bg-gray-300 text-xs px-2 py-1 rounded"
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
                                className="border border-gray-300 rounded p-3"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-semibold">
                                        {comment.userName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {comment.rating
                                            ? `Rating: ${comment.rating}/5`
                                            : ""}
                                    </div>
                                </div>
                                <p className="text-sm">{comment.text}</p>
                                <div className="flex justify-end gap-2 mt-2">
                                    {isOwner && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    startEditing(comment)
                                                }
                                                className="text-xs text-blue-500 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(comment.id)
                                                }
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>
    );
};
