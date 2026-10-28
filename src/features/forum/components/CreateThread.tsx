import { useNavigate, useSearchParams } from "react-router-dom";

import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { FORUM_PATHS } from "../constants/forumPaths";
import { useCreateThread, useFetchCategories } from "../hooks";

import { ForumFormShell } from "./ForumUI";
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
    <ForumFormShell
      eyebrow="New thread"
      title="Start a discussion"
      description="Ask a question, share a print or start a conversation with the community."
      error={error?.message}
    >
      <ThreadEditor
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isPending}
      />
    </ForumFormShell>
  );
}
