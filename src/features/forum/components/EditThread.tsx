import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageSquareOff, ShieldX } from "lucide-react";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { buttonClassName } from "@/components";
import { StatePanel } from "@/features/shared/components/StatePanel";

import { useFetchCategories, useFetchThread, useUpdateThread } from "../hooks";

import { FORUM_PATHS } from "../constants/forumPaths";

import { ForumFormShell, ForumFormSkeleton } from "./ForumUI";
import { ThreadEditor } from "./ThreadEditor";

import type { CreateThreadInput } from "../types/forum";

export function EditThread() {
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

  const handleCancel = (): void => {
    if (threadId) {
      navigate(FORUM_PATHS.THREAD(threadId));
      return;
    }

    navigate(FORUM_PATHS.HOME);
  };

  if (isLoading) {
    return <ForumFormSkeleton />;
  }

  if (threadError || !threadId || !thread) {
    return (
      <StatePanel
        icon={MessageSquareOff}
        title={threadError ? "Couldn't load this thread" : "Thread not found"}
        actions={
          <Link to={FORUM_PATHS.HOME} className={buttonClassName()}>
            Back to the forum
          </Link>
        }
      >
        {threadError ? "Check your connection and refresh the page." : "It may have been moved or deleted."}
      </StatePanel>
    );
  }

  if (currentUser?.uid !== thread.authorId) {
    return (
      <StatePanel
        icon={ShieldX}
        title="You can't edit this thread"
        actions={
          <Link to={FORUM_PATHS.THREAD(thread.id)} className={buttonClassName({ variant: "secondary" })}>
            Back to the thread
          </Link>
        }
      >
        Only the person who started a thread can edit it.
      </StatePanel>
    );
  }

  const initialData: CreateThreadInput = {
    title: thread.title,
    content: thread.content,
    categoryId: thread.categoryId,
    tags: thread.tags ?? [],
  };

  return (
    <ForumFormShell
      eyebrow="Edit thread"
      title="Edit your thread"
      description="Update the title, category, tags or message."
      error={updateError?.message}
    >
      <ThreadEditor
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isPending}
        isEdit
      />
    </ForumFormShell>
  );
}
