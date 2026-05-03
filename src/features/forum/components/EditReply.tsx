import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getReplyById } from "@/features/forum/services/forumService";
import { ReplyEditor } from "./ReplyEditor";
import { Spinner } from "@/features/shared/reusable/Spinner";
import type { FC } from "react";

export const EditReply: FC = () => {
    const { replyId } = useParams<{ replyId: string }>();
    const navigate = useNavigate();
    const { currentThread, loading, error } = useForum();
    const { currentUser } = useAuth();

    const [reply, setReply] = useState<{
        id: string;
        content: string;
        threadId: string;
        authorId: string;
    } | null>(null);
    const [replyError, setReplyError] = useState<string | null>(null);
    const [replyLoading, setReplyLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadReply = async () => {
            if (!replyId) return;
            setReplyLoading(true);
            setReplyError(null);

            const foundReply = currentThread?.replies?.find((r) => r.id === replyId);
            if (foundReply) {
                setReply({
                    id: foundReply.id,
                    content: foundReply.content,
                    threadId: foundReply.threadId || currentThread?.id || "",
                    authorId: foundReply.authorId,
                });
                setReplyLoading(false);
                return;
            }

            try {
                const fetchedReply = await getReplyById(replyId);
                setReply({
                    id: fetchedReply.id,
                    content: fetchedReply.content,
                    threadId: fetchedReply.threadId,
                    authorId: fetchedReply.authorId,
                });
            } catch (err) {
                setReplyError(
                    err instanceof Error ? err.message : "Unable to load this reply"
                );
            } finally {
                setReplyLoading(false);
            }
        };

        loadReply();
    }, [currentThread, replyId]);

    const handleSuccess = () => {
        navigate(`/forum/thread/${reply?.threadId}`);
    };

    const handleCancel = () => {
        navigate(`/forum/thread/${reply?.threadId}`);
    };

    if (loading || replyLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size={24} />
            </div>
        );
    }

    if (error || replyError) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error || replyError}</p>
            </div>
        );
    }

    if (!reply) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">Reply not found</p>
            </div>
        );
    }

    if (currentUser?.uid !== reply.authorId) {
        return (
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-3">Cannot edit this reply</h2>
                <p className="text-[var(--txt-secondary)] mb-6">
                    You can only edit replies that you posted.
                </p>
                <button
                    onClick={() => navigate(`/forum/thread/${reply.threadId}`)}
                    className="inline-block px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                >
                    Back to Thread
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Edit Reply</h1>
                <ReplyEditor
                    threadId={reply.threadId}
                    initialContent={reply.content}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    isEdit={true}
                    replyId={reply.id}
                />
            </div>
        </div>
    );
};
