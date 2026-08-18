import { useNavigate, useSearchParams } from "react-router-dom";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { FORUM_PATHS } from "../constants/forumPaths";
import { useCreateThread, useFetchCategories } from "../hooks";

import { ThreadEditor } from "./ThreadEditor";

import type { CreateThreadInput } from "../types/forum";

export function CreateThread() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: fetchedCategories = [] } = useFetchCategories();

  const { mutateAsync: createThread, isPending, error } = useCreateThread();

  const categories = fetchedCategories.length > 0 ? fetchedCategories : FORUM_CATEGORIES;

  const initialData: CreateThreadInput = {
    title: "",
    content: "",
    categoryId: searchParams.get("category") ?? "",
    tags: [],
  };

  const handleSubmit = async (data: CreateThreadInput): Promise<void> => {
    try {
      const threadId = await createThread(data);

      navigate(FORUM_PATHS.THREAD(threadId));
    } catch {
      // Mutation error is rendered below.
    }
  };

  const handleCancel = (): void => {
    navigate(FORUM_PATHS.HOME);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          New Discussion
        </p> */}

        <h1 className="text-3xl font-bold text-txt-primary">Create a Thread</h1>

        <p className="mt-2 max-w-2xl text-txt-secondary">
          Start a focused discussion, ask a question, or share something useful with the
          community.
        </p>
      </header>

      <section className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm sm:p-8">
        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            {error.message}
          </div>
        )}

        <ThreadEditor
          initialData={initialData}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isPending}
        />
      </section>
    </div>
  );
}
