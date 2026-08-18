import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { useFetchReply } from "../hooks";
import { FORUM_PATHS } from "../constants/forumPaths";

import { ReplyEditor } from "./ReplyEditor";

export function EditReply() {
  const { replyId } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const { data: reply, isLoading, error } = useFetchReply(replyId);

  const handleSuccess = (): void => {
    if (!reply) {
      return;
    }

    navigate(FORUM_PATHS.THREAD(reply.threadId));
  };

  const handleCancel = (): void => {
    if (!reply) {
      navigate(FORUM_PATHS.HOME);
      return;
    }

    navigate(FORUM_PATHS.THREAD(reply.threadId));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-xl border border-error/30 bg-error/10 p-6">
          <h2 className="text-lg font-semibold text-error">Unable to Load Reply</h2>

          <p className="mt-2 text-sm text-error">{error.message}</p>

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

  if (!replyId || !reply) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-warning">
            Forum Reply
          </p>

          <h2 className="text-xl font-semibold text-txt-primary">Reply Not Found</h2>

          <p className="mx-auto mt-2 max-w-xl text-txt-secondary">
            The reply may have been removed or is no longer available.
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

  if (currentUser?.uid !== reply.authorId) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-xl border border-br-subtle bg-surface-card p-8 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-error">
            Access Restricted
          </p>

          <h2 className="text-xl font-semibold text-txt-primary">
            Cannot edit this reply
          </h2>

          <p className="mt-2 max-w-xl text-txt-secondary">
            You can only edit replies that you posted.
          </p>

          <Link
            to={FORUM_PATHS.THREAD(reply.threadId)}
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
          >
            Back to Thread
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Edit Response
        </p> */}

        <h1 className="text-3xl font-bold text-txt-primary">Edit Reply</h1>

        <p className="mt-2 max-w-2xl text-txt-secondary">
          Update your response while keeping the discussion clear and useful.
        </p>
      </header>

      <section className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm sm:p-8">
        <ReplyEditor
          threadId={reply.threadId}
          initialContent={reply.content}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isEdit
          replyId={reply.id}
        />
      </section>
    </div>
  );
}
