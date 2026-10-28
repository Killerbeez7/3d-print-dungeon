import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageSquareOff, ShieldX } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { buttonClassName } from "@/components";
import { StatePanel } from "@/features/shared/components/StatePanel";

import { useFetchReply } from "../hooks";
import { FORUM_PATHS } from "../constants/forumPaths";

import { ForumFormShell, ForumFormSkeleton } from "./ForumUI";
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
    return <ForumFormSkeleton />;
  }

  if (error || !replyId || !reply) {
    return (
      <StatePanel
        icon={MessageSquareOff}
        title={error ? "Couldn't load this reply" : "Reply not found"}
        actions={
          <Link to={FORUM_PATHS.HOME} className={buttonClassName()}>
            Back to the forum
          </Link>
        }
      >
        {error ? "Check your connection and refresh the page." : "It may have been removed."}
      </StatePanel>
    );
  }

  if (currentUser?.uid !== reply.authorId) {
    return (
      <StatePanel
        icon={ShieldX}
        title="You can't edit this reply"
        actions={
          <Link to={FORUM_PATHS.THREAD(reply.threadId)} className={buttonClassName({ variant: "secondary" })}>
            Back to the thread
          </Link>
        }
      >
        Only the person who posted a reply can edit it.
      </StatePanel>
    );
  }

  return (
    <ForumFormShell eyebrow="Edit reply" title="Edit your reply" description="Fix a typo or add a detail.">
      <ReplyEditor
        threadId={reply.threadId}
        initialContent={reply.content}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        isEdit
        replyId={reply.id}
      />
    </ForumFormShell>
  );
}
