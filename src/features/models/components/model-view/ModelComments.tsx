import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useComments } from "@/features/models/hooks/useComments";

interface ModelCommentsProps {
    openAuthModal: () => void;
}

interface Comment {
    id: string;
    text: string;
    userId: string;
    userName: string;
    createdAt?: { toDate: () => Date };
}

export const ModelComments = ({ openAuthModal }: ModelCommentsProps) => {
    const { currentUser } = useAuth();
    const { comments, loading, submitComment, removeComment, updateComment } =
        useComments();
    const [newComment, setNewComment] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>("");

    // Handle new comment submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!currentUser) {
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

    // Handle comment deletion
    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await removeComment(commentId);
        } catch (error) {
            console.error("Error deleting comment:", error);
            setError("Error deleting comment");
        }
    };

    // Start editing a comment
    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingText("");
    };

    // Save edited comment
    const saveEditing = async (commentId: string) => {
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
        <section id="model-discussion" className="mx-auto max-w-5xl scroll-mt-24 border-t border-br-subtle pt-7">
            <div className="mb-5 flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-bold text-txt-primary">Comments</h3>
                <span className="text-sm text-txt-muted">
                    {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </span>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-error/40 bg-error/5 px-3 py-2 text-sm text-error">
                    {error}
                </div>
            )}
            {/* Always show the comment form */}
            <form
                onSubmit={handleSubmit}
                className="mb-6 rounded-lg border border-br-subtle bg-surface-card p-3"
            >
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="min-h-20 w-full resize-y rounded-md border border-transparent bg-bg-primary p-3 text-sm leading-relaxed text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                    rows={3}
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-txt-muted">
                        {currentUser ? "Post as " + (currentUser.displayName || "Anonymous") : "Sign in to join the discussion"}
                    </p>
                    <button
                        type="submit"
                        className="h-10 rounded-lg bg-accent px-5 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!newComment.trim()}
                    >
                        Submit
                    </button>
                </div>
            </form>
            {loading ? (
                <p className="py-4 text-sm text-txt-secondary">
                    Loading comments...
                </p>
            ) : comments.length === 0 ? (
                <p className="py-2 text-sm text-txt-muted">
                    No comments yet. Start the discussion with a question or feedback.
                </p>
            ) : (
                <ul className="divide-y divide-br-subtle">
                    {comments.map((comment: Comment) => {
                        const isOwner = currentUser && currentUser.uid === comment.userId;
                        const isEditing = editingCommentId === comment.id;
                        if (isEditing) {
                            return (
                                <li
                                    key={comment.id}
                                    className="py-5"
                                >
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text">
                                            {comment.userName?.charAt(0)?.toUpperCase() || "A"}
                                        </div>
                                        <div className="text-sm font-semibold text-txt-primary">
                                            {comment.userName}
                                        </div>
                                    </div>
                                    <textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="mb-3 w-full rounded-lg border border-br-secondary bg-surface-card p-3 text-sm text-txt-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                                        rows={2}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => saveEditing(comment.id)}
                                            className="h-9 rounded-lg bg-accent px-3 text-sm font-medium text-btn-primary-text transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="h-9 rounded-lg border border-br-secondary bg-bg-surface px-3 text-sm font-medium text-txt-primary transition-colors hover:border-br-primary hover:bg-bg-tertiary focus:outline-none focus:ring-2 focus:ring-focus"
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
                                className="py-5"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-sm font-semibold text-txt-secondary">
                                            {comment.userName?.charAt(0)?.toUpperCase() || "A"}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-txt-primary">
                                                {comment.userName}
                                            </div>
                                            {comment.createdAt && (
                                                <div className="text-xs text-txt-muted">
                                                    {formatDistanceToNow(
                                                        comment.createdAt.toDate(),
                                                        { addSuffix: true }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <div className="flex shrink-0 gap-3">
                                            <button
                                                onClick={() => startEditing(comment)}
                                                className="text-sm font-medium text-accent-text transition-colors hover:text-accent-hover"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-sm font-medium text-error transition-colors hover:text-error-hover"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-txt-secondary">
                                    {comment.text}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};
