import { Link } from "react-router-dom";
import { FaComment, FaPlus, FaRegFileAlt } from "react-icons/fa";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import { useFetchUserReplies, useFetchUserThreads } from "../hooks";

import { FORUM_PATHS } from "../constants/forumPaths";

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

  const avatarUrl = getAvatarUrlWithCacheBust(currentUser?.photoURL);

  if (!currentUser) {
    return (
      <div className="rounded-xl border border-br-subtle bg-surface-card p-8 shadow-sm">
        {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Forum Dashboard
        </p> */}

        <h1 className="text-2xl font-bold text-txt-primary">
          Sign in to view your activity
        </h1>

        <p className="mt-2 max-w-xl text-txt-secondary">
          Your threads, replies, and activity shortcuts will appear here once you&apos;re
          signed in.
        </p>

        <Link
          to={FORUM_PATHS.HOME}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
        >
          Back to Forum
        </Link>
      </div>
    );
  }

  const queryError = threadsError ?? repliesError;

  if (queryError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 p-6 text-error">
        <h2 className="text-lg font-semibold">Unable to Load Forum Activity</h2>

        <p className="mt-2 text-sm">{queryError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={currentUser.displayName || "User avatar"}
            className="size-16 rounded-full border border-br-subtle object-cover shadow-sm"
          />

          <div>
            {/* <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Forum Dashboard
            </p> */}

            <h1 className="text-2xl font-bold text-txt-primary">
              Welcome back, {currentUser.displayName || "User"}
            </h1>

            <p className="mt-1 text-txt-secondary">
              Your recent community activity at a glance.
            </p>
          </div>
        </div>

        <Link
          to={FORUM_PATHS.NEW_THREAD}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-btn-primary-text shadow-sm transition-all hover:bg-accent-hover hover:shadow-md sm:self-auto"
        >
          <FaPlus size={11} aria-hidden="true" />
          New Thread
        </Link>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <FaRegFileAlt size={14} aria-hidden="true" />
          </div>

          <div className="text-2xl font-bold text-txt-primary">{userThreads.length}</div>

          <div className="mt-1 text-sm text-txt-muted">Threads</div>
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
          <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <FaComment size={14} aria-hidden="true" />
          </div>

          <div className="text-2xl font-bold text-txt-primary">{userReplies.length}</div>

          <div className="mt-1 text-sm text-txt-muted">Replies</div>
        </div>
      </section>

      {/* Recent Threads */}
      <section className="rounded-xl border border-br-subtle bg-surface-card shadow-sm">
        <div className="flex items-center justify-between border-b border-br-subtle px-5 py-4">
          <div>
            <h2 className="font-semibold text-txt-primary">Recent Threads</h2>

            <p className="mt-0.5 text-sm text-txt-muted">
              Discussions you&apos;ve started recently.
            </p>
          </div>

          <Link
            to={FORUM_PATHS.MY_THREADS}
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-br-subtle">
          {areThreadsLoading ? (
            <div className="flex justify-center p-8">
              <Spinner size={24} />
            </div>
          ) : userThreads.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-txt-secondary">
                You haven&apos;t started any threads yet.
              </p>

              <Link
                to={FORUM_PATHS.NEW_THREAD}
                className="mt-3 inline-flex text-sm font-semibold text-accent hover:text-accent-hover"
              >
                Create your first thread
              </Link>
            </div>
          ) : (
            userThreads.slice(0, 5).map((thread) => (
              <Link
                key={thread.id}
                to={FORUM_PATHS.THREAD(thread.id)}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-txt-primary transition-colors group-hover:text-accent">
                    {thread.title}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-txt-muted">
                  {thread.replyCount || 0} replies
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Recent Replies */}
      <section className="rounded-xl border border-br-subtle bg-surface-card shadow-sm">
        <div className="border-b border-br-subtle px-5 py-4">
          <h2 className="font-semibold text-txt-primary">Recent Replies</h2>

          <p className="mt-0.5 text-sm text-txt-muted">
            Your latest contributions to discussions.
          </p>
        </div>

        <div className="divide-y divide-br-subtle">
          {areRepliesLoading ? (
            <div className="flex justify-center p-8">
              <Spinner size={24} />
            </div>
          ) : userReplies.length === 0 ? (
            <div className="p-6 text-sm text-txt-secondary">
              You haven&apos;t replied to any threads yet.
            </div>
          ) : (
            userReplies.slice(0, 5).map((reply) => (
              <Link
                key={reply.id}
                to={FORUM_PATHS.THREAD(reply.threadId)}
                className="group block px-5 py-4 transition-colors hover:bg-muted/60"
              >
                <p className="line-clamp-2 text-sm leading-relaxed text-txt-secondary transition-colors group-hover:text-txt-primary">
                  {reply.content}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
