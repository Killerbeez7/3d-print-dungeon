import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { ReplyEditor } from "./ReplyEditor";
import { Spinner } from "@/features/shared/reusable/Spinner";
import type { FC } from "react";

export const EditReply: FC = () => {
    const { replyId } = useParams<{ replyId: string }>();
    const navigate = useNavigate();
    const { currentThread, loading, error } = useForum();

    const [reply, setReply] = useState<{
        id: string;
        content: string;
        threadId: string;
    } | null>(null);

    useEffect(() => {
        if (currentThread?.replies && replyId) {
            const foundReply = currentThread.replies.find((r) => r.id === replyId);
            if (foundReply) {
                setReply({
                    id: foundReply.id,
                    content: foundReply.content,
                    threadId: currentThread.id,
                });
            }
        }
    }, [currentThread, replyId]);

    const handleSuccess = () => {
        navigate(`/forum/thread/${reply?.threadId}`);
    };

    const handleCancel = () => {
        navigate(`/forum/thread/${reply?.threadId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size={24} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
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
