import { Link } from "react-router-dom";
import { FORUM_PATHS } from "../constants/forumPaths";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFetchUserReplies, useFetchUserThreads } from "../hooks";

import { Spinner } from "@/features/shared/reusable/Spinner";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

export const ForumDashboard = () => {
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
      <div className="text-txt-primary rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Forum Dashboard</h1>
        <p className="text-txt-secondary mb-6">
          Sign in to see your forum threads, replies, and activity shortcuts.
        </p>
        <Link
          to={FORUM_PATHS.HOME}
          className="inline-flex items-center justify-center rounded-md border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:border-br-primary hover:bg-muted"
        >
          Back to Forum
        </Link>
      </div>
    );
  }

  const queryError = threadsError ?? repliesError;

  if (queryError) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-300">
        <h2 className="text-lg font-semibold mb-2">Unable to load forum activity</h2>

        <p>{queryError.message}</p>
      </div>
    );
  }

  return (
    <div className=" text-txt-primary rounded-lg shadow p-6">
      {/* Welcome/User Info */}
      <div className="mb-6 flex items-center gap-4">
        <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {currentUser?.displayName || "User"}!
          </h1>
          <p className="text-txt-secondary">
            Here&apos;s your forum activity at a glance.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Link
          to={FORUM_PATHS.NEW_THREAD}
          className="inline-flex items-center justify-center rounded-md bg-btn-primary px-4 py-2 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-btn-primary-hover"
        >
          New Thread
        </Link>

        <Link
          to={"/profile"}
          className="inline-flex items-center justify-center rounded-md border border-br-secondary bg-surface-card px-4 py-2 text-sm font-semibold text-txt-primary transition-colors hover:border-br-primary hover:bg-muted"
        >
          My Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{userThreads.length}</div>
          <div className="text-xs text-txt-muted">Threads</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{userReplies.length}</div>
          <div className="text-xs text-txt-muted">Replies</div>
        </div>
        {/* Add more stats: likes, badges, etc. */}
      </div>

      {/* My Threads */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">My Threads</h2>
        {areThreadsLoading ? (
          <Spinner size={24} />
        ) : userThreads.length === 0 ? (
          <div className="text-txt-muted">
            You haven&apos;t started any threads yet.
            <div className="mt-3">
              <Link to={FORUM_PATHS.NEW_THREAD} className="text-accent">
                Create your first thread
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {userThreads.slice(0, 5).map((thread) => (
              <li key={thread.id}>
                <Link
                  to={FORUM_PATHS.THREAD(thread.id)}
                  className="font-medium hover:text-accent"
                >
                  {thread.title}
                </Link>
                <span className="ml-2 text-xs text-txt-muted">
                  {thread.replyCount || 0} replies
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link to={FORUM_PATHS.MY_THREADS} className="text-accent text-sm">
          View all my threads
        </Link>
      </div>

      {/* My Replies */}
      <div>
        <h2 className="text-xl font-semibold mb-2">My Recent Replies</h2>
        {areRepliesLoading ? (
          <Spinner size={24} />
        ) : userReplies.length === 0 ? (
          <div className="text-txt-muted">
            You haven&apos;t replied to any threads yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {userReplies.slice(0, 5).map((reply) => {
              return (
                <li key={reply.id}>
                  <span className="text-txt-muted">On </span>

                  <Link
                    to={FORUM_PATHS.THREAD(reply.threadId)}
                    className="font-medium hover:text-accent"
                  >
                    thread
                  </Link>

                  <span className="ml-2 text-xs text-txt-muted">
                    {reply.content.slice(0, 90)}
                    {reply.content.length > 90 ? "..." : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
