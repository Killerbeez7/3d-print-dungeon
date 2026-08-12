import { useNavigate, useSearchParams } from "react-router-dom";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { FORUM_PATHS } from "../constants/forumPaths";
import { useCreateThread, useFetchCategories } from "../hooks";

import { ThreadEditor } from "./ThreadEditor";

import type { CreateThreadInput } from "../types/forum";

export const CreateThread = () => {
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
      // The mutation error is rendered below.
    }
  };

  const handleCancel = () => {
    navigate(FORUM_PATHS.HOME);
  };

  return (
    <div className="bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Thread</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
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
    </div>
  );
};
