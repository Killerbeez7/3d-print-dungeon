import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { ThreadEditor } from "./ThreadEditor";
import Skeleton from "@/features/shared/Skeleton";
import { FORUM_PATHS, FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";
import type { FC } from "react";

export const EditThread: FC = () => {
    const { threadId } = useParams<Record<string, string | undefined>>();
    const navigate = useNavigate();

    const { loadThread, updateThread, currentThread, categories, loading, error } =
        useForum();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (threadId) {
            loadThread(threadId);
        }
    }, [threadId, loadThread]);

    const handleEditThreadSubmit = async (data: {
        title?: string;
        content?: string;
        categoryId?: string;
        tags?: string[];
    }) => {
        if (!threadId) return;

        setIsSubmitting(true);
        try {
            await updateThread(threadId, data);
            navigate(FORUM_PATHS.THREAD(threadId));
        } catch (error) {
            console.error("Error updating thread:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (threadId) {
            navigate(FORUM_PATHS.THREAD(threadId));
        } else {
            navigate(FORUM_HOME_PATH);
        }
    };

    // Loading state
    if (loading && !currentThread) {
        return (
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
                <Skeleton className="h-8 w-3/4 mb-6" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
                <h2 className="text-lg font-semibold mb-2">Error Loading Thread</h2>
                <p>{error}</p>
                <button
                    onClick={() => navigate(FORUM_HOME_PATH)}
                    className="mt-4 inline-block text-[var(--accent)] hover:underline"
                >
                    Return to Forum
                </button>
            </div>
        );
    }

    // No thread found
    if (!currentThread) {
        return (
            <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Thread Not Found</h2>
                <p className="text-[var(--txt-secondary)] mb-6">
                    The thread you&apos;re looking for may have been moved or deleted.
                </p>
                <button
                    onClick={() => navigate(FORUM_HOME_PATH)}
                    className="inline-block px-4 py-2 rounded-lg font-semibold bg-[var(--accent)] text-[var(--txt-highlight)] hover:bg-[var(--accent-hover)] transition"
                >
                    Return to Forum
                </button>
            </div>
        );
    }

    const editThreadData = {
        title: currentThread.title,
        content: currentThread.content,
        categoryId: currentThread.categoryId,
        tags: currentThread.tags || [],
    };

    return (
        <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Thread</h1>
            <ThreadEditor
                initialData={editThreadData}
                categories={categories}
                onSubmit={handleEditThreadSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
                isEdit={true}
            />
        </div>
    );
};
