import { useState } from "react";
import PropTypes from "prop-types";
//contexts
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";

export const ModelComments = ({ openAuthModal }) => {
    const { currentUser } = useAuth();
    const { comments, loading, submitComment, removeComment, updateComment } =
        useComments();
    const [newComment, setNewComment] = useState("");
    const [error, setError] = useState("");

    // For editing an existing comment
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!currentUser) {
            // Prompt sign in if not logged in
            openAuthModal();
            return;
        }
        try {
            await submitComment({
                text: newComment,
                userId: currentUser.uid,
                userName: currentUser.displayName || "Anonymous",
            });
            setNewComment("");
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
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingText("");
    };

    const saveEditing = async (commentId) => {
        if (!editingText.trim()) return;
        try {
            await updateComment(commentId, { text: editingText });
            cancelEditing();
        } catch (err) {
            console.error("Error editing comment:", err);
            setError("Error editing comment");
        }
    };

    return (
        <div className="mt-8 border border-br-primary p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-txt-primary">
                Comments
            </h3>
            {error && <p className="text-error text-sm mb-4">{error}</p>}

            {/* Always show the comment form */}
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full border border-br-primary rounded-lg p-3 bg-bg-primary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    rows="3"
                />
                <button
                    type="submit"
                    className="cta-gradient px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    Submit
                </button>
            </form>

            {loading ? (
                <p className="text-txt-secondary">Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="text-txt-secondary">No comments yet. Be the first to comment!</p>
            ) : (
                <ul className="space-y-6">
                    {comments.map((comment) => {
                        const isOwner = currentUser && currentUser.uid === comment.userId;
                        const isEditing = editingCommentId === comment.id;
                        if (isEditing) {
                            return (
                                <li
                                    key={comment.id}
                                    className="border border-br-primary rounded-lg p-4 bg-bg-primary"
                                >
                                    <div className="mb-2 text-sm font-semibold text-txt-primary">
                                        {comment.userName}
                                    </div>
                                    <textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full border border-br-primary rounded-lg p-2 mb-2 bg-bg-primary text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                        rows="2"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => saveEditing(comment.id)}
                                            className="bg-success text-white text-sm px-3 py-1 rounded hover:bg-success/80 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="bg-bg-tertiary text-txt-primary text-sm px-3 py-1 rounded hover:bg-bg-surface transition-colors"
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
                                className="border border-br-primary rounded-lg p-4 bg-bg-primary"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-semibold text-txt-primary">
                                        {comment.userName}
                                    </div>
                                </div>
                                <p className="text-sm text-txt-secondary whitespace-pre-line">
                                    {comment.text}
                                </p>
                                {isOwner && (
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button
                                            onClick={() => startEditing(comment)}
                                            className="text-sm text-accent hover:text-accent-hover hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-sm text-error hover:text-error/80 hover:underline"
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

ModelComments.propTypes = {
    openAuthModal: PropTypes.func,
};
