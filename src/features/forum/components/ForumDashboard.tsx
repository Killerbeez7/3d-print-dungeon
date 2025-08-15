import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForum } from "@/features/forum/hooks/useForum";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/features/shared/reusable/Spinner";
import type { ForumThread, ForumReply } from "@/features/forum/types/forum";
import type { FC } from "react";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

export const ForumDashboard: FC = () => {
    const { currentUser } = useAuth();
    const { getUserThreads, getUserReplies } = useForum();
    const [userThreads, setUserThreads] = useState<ForumThread[]>([]);
    const [userReplies, setUserReplies] = useState<ForumReply[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const avatarUrl = getAvatarUrlWithCacheBust(currentUser?.photoURL);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (currentUser) {
                    const threads = await getUserThreads(currentUser.uid);
                    const replies = await getUserReplies(currentUser.uid);
                    setUserThreads(threads.slice(0, 5)); // Show 5 most recent
                    setUserReplies(replies.slice(0, 5));
                }
            } catch {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser, getUserThreads, getUserReplies]);

    return (
        <div className=" text-[var(--txt-primary)] rounded-lg shadow p-6">
            {/* Welcome/User Info */}
            <div className="mb-6 flex items-center gap-4">
                <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome, {currentUser?.displayName || "User"}!
                    </h1>
                    <p className="text-[var(--txt-secondary)]">
                        Here&apos;s your forum activity at a glance.
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-6">
                <Link to="/forum/new-thread" className="cta-button px-4 py-2">
                    New Thread
                </Link>
                <Link to="/profile" className="secondary-button px-4 py-2">
                    My Profile
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{userThreads.length}</div>
                    <div className="text-xs text-[var(--txt-muted)]">Threads</div>
                </div>
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{userReplies.length}</div>
                    <div className="text-xs text-[var(--txt-muted)]">Replies</div>
                </div>
                {/* Add more stats: likes, badges, etc. */}
            </div>

            {/* My Threads */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">My Threads</h2>
                {loading ? (
                    <Spinner size={24} />
                ) : userThreads.length === 0 ? (
                    <div className="text-[var(--txt-muted)]">
                        You haven&apos;t started any threads yet.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {userThreads.map((thread: ForumThread) => (
                            <li key={thread.id}>
                                <Link
                                    to={`/forum/thread/${thread.id}`}
                                    className="font-medium hover:text-[var(--accent)]"
                                >
                                    {thread.title}
                                </Link>
                                <span className="ml-2 text-xs text-[var(--txt-muted)]">
                                    {/* Optionally show date or stats here */}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <Link to="/forum/my-threads" className="text-[var(--accent)] text-sm">
                    View all my threads
                </Link>
            </div>

            {/* My Replies */}
            <div>
                <h2 className="text-xl font-semibold mb-2">My Recent Replies</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : userReplies.length === 0 ? (
                    <div className="text-[var(--txt-muted)]">
                        You haven&apos;t replied to any threads yet.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {userReplies.map((reply: ForumReply) => (
                            <li key={reply.id}>
                                <span className="text-[var(--txt-muted)]">On </span>
                                <Link
                                    to={`/forum/thread/${reply.threadId}`}
                                    className="font-medium hover:text-[var(--accent)]"
                                >
                                    {"Thread"}
                                </Link>
                                <span className="ml-2 text-xs text-[var(--txt-muted)]">
                                    {/* Optionally show date or stats here */}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <Link to="/forum/my-threads" className="text-[var(--accent)] text-sm">
                    View all my replies
                </Link>
            </div>

            {/* Moderation Tools (if user is mod/admin) can be added here */}
        </div>
    );
};
