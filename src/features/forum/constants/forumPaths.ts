export const FORUM_PATHS = {
  HOME: "/forum",
  NEW_THREAD: "/forum/new-thread",

  NEW_THREAD_FOR_CATEGORY: (categoryId: string) => {
    return `/forum/new-thread?category=${encodeURIComponent(categoryId)}`;
  },

  THREAD: (threadId: string) => {
    return `/forum/thread/${threadId}`;
  },

  THREAD_EDIT: (threadId: string) => {
    return `/forum/thread/${threadId}/edit`;
  },

  CATEGORY: (categoryId: string) => {
    return `/forum/category/${categoryId}`;
  },

  DASHBOARD: "/forum/dashboard",
  MY_THREADS: "/forum/my-threads",
  RULES: "/forum/rules",
  HELP: "/forum/help",

  REPLY_EDIT: (replyId: string) => {
    return `/forum/reply/${replyId}/edit`;
  },
} as const;
