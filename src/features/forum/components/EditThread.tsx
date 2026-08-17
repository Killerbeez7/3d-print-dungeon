import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFetchCategories, useFetchThread, useUpdateThread } from "../hooks";

import { FORUM_CATEGORIES } from "@/config/forumCategories";
import { FORUM_PATHS } from "../constants/forumPaths";

import Skeleton from "@/features/shared/Skeleton";
import { ThreadEditor } from "./ThreadEditor";

import type { CreateThreadInput } from "../types/forum";

export const EditThread = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { currentUser } = useAuth();

  const { data: thread, isLoading, error: threadError } = useFetchThread(threadId);
  const { data: fetchedCategories = [] } = useFetchCategories();
  const { mutateAsync: updateThread, isPending, error: updateError } = useUpdateThread();

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const handleSubmit = async (data: CreateThreadInput): Promise<void> => {
    if (!threadId) {
      return;
    }

    try {
      await updateThread({
        threadId,
        data,
      });

      navigate(FORUM_PATHS.THREAD(threadId));
    } catch {
      // Mutation error is rendered below.
    }
  };

  const handleCancel = () => {
    if (threadId) {
      navigate(FORUM_PATHS.THREAD(threadId));
      return;
    }

    navigate(FORUM_PATHS.HOME);
  };

  if (isLoading) {
    return (
      <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (threadError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-red-700 dark:text-red-400">
        <h2 className="text-lg font-semibold mb-2">Error Loading Thread</h2>

        <p>{threadError.message}</p>

        <button
          type="button"
          onClick={() => {
            navigate(FORUM_PATHS.HOME);
          }}
          className="mt-4 inline-block text-accent hover:underline"
        >
          Return to Forum
        </button>
      </div>
    );
  }

  if (!threadId || !thread) {
    return (
      <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Thread Not Found</h2>

        <p className="text-txt-secondary mb-6">
          The thread you&apos;re looking for may have been moved or deleted.
        </p>

        <button
          type="button"
          onClick={() => {
            navigate(FORUM_PATHS.HOME);
          }}
          className="inline-block px-4 py-2 rounded-lg font-semibold bg-accent text-txt-highlight hover:bg-accent-hover transition"
        >
          Return to Forum
        </button>
      </div>
    );
  }

  if (currentUser?.uid !== thread.authorId) {
    return (
      <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Cannot edit this thread</h2>

        <p className="text-txt-secondary mb-6">
          You can only edit threads that you created.
        </p>

        <button
          type="button"
          onClick={() => {
            navigate(FORUM_PATHS.THREAD(thread.id));
          }}
          className="inline-block px-4 py-2 rounded-lg font-semibold bg-accent text-txt-highlight hover:bg-accent-hover transition"
        >
          Back to Thread
        </button>
      </div>
    );
  }

  const initialData: CreateThreadInput = {
    title: thread.title,
    content: thread.content,
    categoryId: thread.categoryId,
    tags: thread.tags ?? [],
  };

  return (
    <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Thread</h1>

      {updateError && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {updateError.message}
        </div>
      )}

      <ThreadEditor
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isPending}
        isEdit
      />
    </div>
  );
};
