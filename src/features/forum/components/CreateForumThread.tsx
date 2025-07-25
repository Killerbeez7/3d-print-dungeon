import { useNavigate, useSearchParams } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { ThreadEditor } from "./ThreadEditor";
import type { FC } from "react";
import { FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";

export const CreateForumThread: FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { categories, createThread, loading } = useForum();

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
        try {
            await createThread(data);
            navigate(FORUM_HOME_PATH);
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    return (
        <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Thread</h1>
            <ThreadEditor
                initialData={newThreadData}
                categories={categories}
                onSubmit={handleNewThreadSubmit}
                isLoading={loading}
            />
        </div>
    );
};
