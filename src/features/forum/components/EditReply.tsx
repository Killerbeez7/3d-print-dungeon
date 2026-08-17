import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { useFetchReply } from "../hooks";

import { FORUM_PATHS } from "../constants/forumPaths";

import { ReplyEditor } from "./ReplyEditor";

export const EditReply = () => {
  const { replyId } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const { data: reply, isLoading, error } = useFetchReply(replyId);

  const handleSuccess = () => {
    if (!reply) {
      return;
    }

    navigate(FORUM_PATHS.THREAD(reply.threadId));
  };

  const handleCancel = () => {
    if (!reply) {
      navigate(FORUM_PATHS.HOME);
      return;
    }

    navigate(FORUM_PATHS.THREAD(reply.threadId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error.message}</p>

        <button
          type="button"
          onClick={() => {
            navigate(FORUM_PATHS.HOME);
          }}
          className="mt-4 text-accent hover:underline"
        >
          Return to Forum
        </button>
      </div>
    );
  }

  if (!replyId || !reply) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200">Reply not found</p>

        <button
          type="button"
          onClick={() => {
            navigate(FORUM_PATHS.HOME);
          }}
          className="mt-4 text-accent hover:underline"
        >
          Return to Forum
        </button>
      </div>
    );
  }

  if (currentUser?.uid !== reply.authorId) {
    return (
      <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Cannot edit this reply</h2>

        <p className="text-txt-secondary mb-6">
          You can only edit replies that you posted.
        </p>

        <button
          type="button"
          onClick={() => {
            navigate(FORUM_PATHS.THREAD(reply.threadId));
          }}
          className="inline-block px-4 py-2 rounded-lg font-semibold bg-accent text-txt-highlight hover:bg-accent-hover transition"
        >
          Back to Thread
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-surface-card text-txt-primary rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Reply</h1>

        <ReplyEditor
          threadId={reply.threadId}
          initialContent={reply.content}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isEdit
          replyId={reply.id}
        />
      </div>
    </div>
  );
};
