import { Link, useNavigate, useParams } from "react-router-dom";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { useAuth } from "@/features/auth/hooks/useAuth";
import Skeleton from "@/features/shared/Skeleton";

import { useFetchCategories, useFetchThread, useUpdateThread } from "../hooks";

import { FORUM_PATHS } from "../constants/forumPaths";

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
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <Skeleton className="mb-6 h-10 w-full" />
          <Skeleton className="mb-6 h-10 w-full" />
          <Skeleton className="mb-6 h-10 w-full" />
          <Skeleton className="mb-6 h-48 w-full" />

          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (threadError) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-xl border border-error/30 bg-error/10 p-6">
          <h2 className="text-lg font-semibold text-error">Error Loading Thread</h2>

          <p className="mt-2 text-sm text-error">{threadError.message}</p>

          <Link
            to={FORUM_PATHS.HOME}
            className="mt-5 inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            Return to Forum
          </Link>
        </div>
      </div>
    );
  }

  if (!threadId || !thread) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-xl border border-br-subtle bg-surface-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-txt-primary">Thread Not Found</h2>

          <p className="mx-auto mt-2 max-w-xl text-txt-secondary">
            The thread you&apos;re looking for may have been moved or deleted.
          </p>

          <Link
            to={FORUM_PATHS.HOME}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
          >
            Return to Forum
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser?.uid !== thread.authorId) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-xl border border-br-subtle bg-surface-card p-8 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-error">
            Access Restricted
          </p>

          <h2 className="text-xl font-semibold text-txt-primary">
            Cannot edit this thread
          </h2>

          <p className="mt-2 max-w-xl text-txt-secondary">
            You can only edit threads that you created.
          </p>

          <Link
            to={FORUM_PATHS.THREAD(thread.id)}
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
          >
            Back to Thread
          </Link>
        </div>
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
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Edit Discussion
        </p> */}

        <h1 className="text-3xl font-bold text-txt-primary">Edit Thread</h1>

        <p className="mt-2 max-w-2xl text-txt-secondary">
          Update the title, category, tags, or content of your discussion.
        </p>
      </header>

      <section className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm sm:p-8">
        {updateError && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
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
      </section>
    </div>
  );
}
