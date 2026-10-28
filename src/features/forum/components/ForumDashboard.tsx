import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, MessageSquare, Plus } from "lucide-react";
import type { ReactNode } from "react";

import { Button, buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import { useFetchUserReplies, useFetchUserThreads } from "../hooks";

import { FORUM_PATHS } from "../constants/forumPaths";
import { formatRelativeTime } from "../utils/threadUtils";
import { ForumAvatar, ForumHeader } from "./ForumUI";

const Panel = ({
  title,
  link,
  isLoading,
  empty,
  children,
}: {
  title: string;
  link?: { to: string; label: string };
  isLoading: boolean;
  empty: ReactNode | null;
  children: ReactNode;
}) => (
  <section className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
    <div className="flex items-center justify-between border-b border-br-subtle px-5 py-3.5">
      <h2 className="font-sans text-sm font-semibold">{title}</h2>
      {link && (
        <Link to={link.to} className="group inline-flex items-center gap-1 text-sm font-semibold text-accent">
          {link.label}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
    {isLoading ? (
      <div className="space-y-3 p-5" role="status" aria-label="Loading">
        <div className="skeleton-print h-4 w-3/4" />
        <div className="skeleton-print h-4 w-1/2" />
        <div className="skeleton-print h-4 w-2/3" />
      </div>
    ) : (
      empty ?? <div className="divide-y divide-br-subtle">{children}</div>
    )}
  </section>
);

export function ForumDashboard() {
  const { currentUser } = useAuth();

  const {
    data: userThreads = [],
    isLoading: areThreadsLoading,
    error: threadsError,
  } = useFetchUserThreads(currentUser?.uid);

  const {
    data: userReplies = [],
    isLoading: areRepliesLoading,
    error: repliesError,
  } = useFetchUserReplies(currentUser?.uid);

  const { open } = useModal("auth");
  const avatarUrl = getAvatarUrlWithCacheBust(currentUser?.photoURL);

  if (!currentUser) {
    return (
      <StatePanel
        icon={LayoutDashboard}
        title="Sign in to see your activity"
        actions={<Button onClick={() => open({ mode: "signin" })}>Sign in</Button>}
      >
        Your threads and replies show up here once you&apos;re signed in.
      </StatePanel>
    );
  }

  const queryError = threadsError ?? repliesError;

  if (queryError) {
    return (
      <StatePanel icon={LayoutDashboard} title="Couldn't load your activity">
        Check your connection and refresh the page.
      </StatePanel>
    );
  }

  const stats = [
    { label: "Threads", value: userThreads.length },
    { label: "Replies", value: userReplies.length },
    {
      label: "Replies received",
      value: userThreads.reduce((total, thread) => total + (thread.replyCount ?? 0), 0),
    },
    { label: "Thread views", value: userThreads.reduce((total, thread) => total + (thread.views ?? 0), 0) },
  ];

  return (
    <div>
      <ForumHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${currentUser.displayName || "maker"}`}
        description="Your forum activity at a glance."
        action={
          <Link to={FORUM_PATHS.NEW_THREAD} className={buttonClassName()}>
            <Plus className="size-4" aria-hidden="true" />
            New thread
          </Link>
        }
      />

      <div className="mb-8 flex items-center gap-4">
        <ForumAvatar src={avatarUrl} />
        <dl className="grid flex-1 grid-cols-2 border-y border-br-subtle sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-3 py-3 ${index % 2 === 1 ? "border-l border-br-subtle" : ""} ${
                index >= 2 ? "border-t border-br-subtle sm:border-t-0" : ""
              } sm:border-l sm:first:border-l-0`}
            >
              <dt className="label-mono text-txt-muted">{stat.label}</dt>
              <dd className="mt-1 font-mono text-xl font-semibold text-txt-primary">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Your threads"
          link={{ to: FORUM_PATHS.MY_THREADS, label: "All" }}
          isLoading={areThreadsLoading}
          empty={
            userThreads.length === 0 ? (
              <div className="p-5 text-sm text-txt-secondary">
                You haven&apos;t started a thread yet.{" "}
                <Link to={FORUM_PATHS.NEW_THREAD} className="font-semibold text-accent hover:underline">
                  Start one
                </Link>
              </div>
            ) : null
          }
        >
          {userThreads.slice(0, 5).map((thread) => (
            <Link
              key={thread.id}
              to={FORUM_PATHS.THREAD(thread.id)}
              className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-txt-primary group-hover:text-accent">
                  {thread.title}
                </span>
                <span className="font-mono text-xs text-txt-muted">{formatRelativeTime(thread.createdAt)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-txt-muted">
                <MessageSquare className="size-3.5" aria-hidden="true" />
                {thread.replyCount || 0}
              </span>
            </Link>
          ))}
        </Panel>

        <Panel
          title="Your replies"
          isLoading={areRepliesLoading}
          empty={
            userReplies.length === 0 ? (
              <p className="p-5 text-sm text-txt-secondary">You haven&apos;t replied to a thread yet.</p>
            ) : null
          }
        >
          {userReplies.slice(0, 5).map((reply) => (
            <Link
              key={reply.id}
              to={FORUM_PATHS.THREAD(reply.threadId)}
              className="group block px-5 py-3.5 transition-colors hover:bg-muted/50"
            >
              <span className="line-clamp-2 text-sm leading-relaxed text-txt-secondary group-hover:text-txt-primary">
                {reply.content}
              </span>
              <span className="font-mono text-xs text-txt-muted">{formatRelativeTime(reply.createdAt)}</span>
            </Link>
          ))}
        </Panel>
      </div>
    </div>
  );
}
