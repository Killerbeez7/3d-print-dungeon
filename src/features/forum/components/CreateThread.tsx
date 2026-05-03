import { useNavigate, useSearchParams } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { ThreadEditor } from "./ThreadEditor";
import { useState, type FC } from "react";
import { FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";

export const CreateThread: FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { categories, createThread, loading } = useForum();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const newThreadData = {
        title: "",
        content: "",
        categoryId: searchParams.get("category") || "",
    };

    const handleNewThreadSubmit = async (data: {
        title?: string;
        content?: string;
        categoryId?: string;
        authorId?: string;
        authorName?: string;
        authorPhotoURL?: string;
        createdAt?: Date;
        lastActivity?: Date;
        views?: number;
        replyCount?: number;
        isPinned?: boolean;
        isLocked?: boolean;
        tags?: string[];
    }) => {
        setSubmitError(null);
        try {
            const threadId = await createThread(data);
            navigate(`/forum/thread/${threadId}`);
        } catch (error) {
            console.error("Error creating thread:", error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Unable to create the thread. Please try again."
            );
        }
    };

    return (
        <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Thread</h1>
            {submitError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                    {submitError}
                </div>
            )}
            <ThreadEditor
                initialData={newThreadData}
                categories={categories}
                onSubmit={handleNewThreadSubmit}
                onCancel={() => navigate(FORUM_HOME_PATH)}
                isLoading={loading}
            />
        </div>
    );
};
