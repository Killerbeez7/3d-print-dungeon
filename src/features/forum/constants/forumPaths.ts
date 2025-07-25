export const FORUM_PATHS = {
    HOME: "/forum",
    NEW_THREAD: "/forum/new-thread",
    THREAD: (threadId: string) => `/forum/thread/${threadId}`,
    THREAD_EDIT: (threadId: string) => `/forum/thread/${threadId}/edit`,
    CATEGORY: (categoryId: string) => `/forum/category/${categoryId}`,
    DASHBOARD: "/forum/dashboard",
    MY_THREADS: "/forum/my-threads",
    RULES: "/forum/rules",
    HELP: "/forum/help",
    REPLY_EDIT: (replyId: string) => `/forum/reply/${replyId}/edit`,
} as const;

// Convenience exports for commonly used paths
export const FORUM_HOME_PATH = FORUM_PATHS.HOME;
export const FORUM_NEW_THREAD_PATH = FORUM_PATHS.NEW_THREAD;
export const FORUM_DASHBOARD_PATH = FORUM_PATHS.DASHBOARD;
export const FORUM_MY_THREADS_PATH = FORUM_PATHS.MY_THREADS;
export const FORUM_RULES_PATH = FORUM_PATHS.RULES;
export const FORUM_HELP_PATH = FORUM_PATHS.HELP; 