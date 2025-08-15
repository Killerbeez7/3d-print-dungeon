import type { PublicProfileView } from "@/features/user/types/user";
import type { IconType } from "react-icons";


export interface ForumSidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    handleSidebarClick: () => void;
    categories: ForumCategory[];
    className?: string;
}

export interface ThreadListProps {
    categoryId: string;
    sortBy?: string;
    showCategory?: boolean;
    isCompact?: boolean;
}

export interface FetchThreadsOptions {
    cursor?: QueryDocumentSnapshot<DocumentData>;
    limit?: number;
    categoryId?: string;
    authorId?: string;
    search?: string;
    sortBy?: "createdAt" | "lastActivity" | "views" | "replyCount";
    sortOrder?: "asc" | "desc";
    filter?: "all" | "recent" | "popular" | "unanswered" | "pinned";
    timeFrame?: "day" | "week" | "month" | "year";
}

export interface FetchRepliesOptions {
    cursor?: QueryDocumentSnapshot<DocumentData>;
    limit?: number;
    threadId: string;
}

export interface CreateThreadParams {
    title: string;
    content: string;
    categoryId: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    tags?: string[];
}

export interface CreateReplyParams {
    threadId: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    parentReplyId?: string;
}

export interface ForumCategory {
    id: string;
    name: string;
    description: string;
    order: number;
    icon?: IconType;
    threadCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateThreadInput {
    title: string;
    content: string;
    categoryId: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    tags?: string[];
}

export interface ForumThread {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: Date;
    lastActivity: Date;
    views: number;
    replyCount: number;
    isPinned: boolean;
    isLocked: boolean;
    tags?: string[];
}

export interface ForumReply {
    id: string;
    threadId: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    createdAt: Date;
    updatedAt?: Date;
    isEdited?: boolean;
    parentReplyId?: string; // For nested replies
}

export interface ForumUser extends PublicProfileView {
    threadCount?: number;
    replyCount?: number;
    lastActivity?: Date;
    reputation?: number;
}

export type SortOption = 'newest' | 'oldest' | 'popular' | 'active';

export interface ForumFilters {
    category?: string;
    author?: string;
    tag?: string;
    searchQuery?: string;
    sortBy: SortOption;
    timeFrame?: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface PaginationParams {
    page: number;
    limit: number;
    hasMore: boolean;
    total?: number;
}

export interface ForumThreadsState {
    recent: ForumThread[];
    popular: ForumThread[];
    unanswered: ForumThread[];
    byCategory: Record<string, ForumThread[]>;
}

import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export interface ForumPagination {
    threads: {
        lastVisible: QueryDocumentSnapshot<DocumentData> | null;
        hasMore: boolean;
    };
    replies: {
        lastVisible: QueryDocumentSnapshot<DocumentData> | null;
        hasMore: boolean;
    };
}

export interface ForumContextValue {
    categories: ForumCategory[];
    threads: ForumThreadsState;
    currentThread: (ForumThread & { replies?: ForumReply[] }) | null;
    currentCategory: ForumCategory | null;
    loading: boolean;
    error: string | null;
    pagination: ForumPagination;
    getCategory: (categoryId: string) => Promise<ForumCategory>;
    getThreadsByCategory: (categoryId: string, sortBy?: "createdAt" | "lastActivity" | "views" | "replyCount") => Promise<ForumThread[]>;
    loadMoreThreads: (categoryId: string, sortBy?: "createdAt" | "lastActivity" | "views" | "replyCount") => Promise<ForumThread[] | undefined>;
    loadThread: (threadId: string) => Promise<ForumThread & { replies?: ForumReply[] }>;
    loadMoreReplies: (threadId: string) => Promise<ForumReply[] | undefined>;
    createThread: (data: Partial<ForumThread>) => Promise<string>;
    updateThread: (threadId: string, data: Partial<ForumThread>) => Promise<string>;
    deleteThread: (threadId: string) => Promise<string>;
    addReply: (threadId: string, content: string) => Promise<string>;
    updateReply: (replyId: string, threadId: string, content: string) => Promise<string>;
    deleteReply: (replyId: string, threadId: string) => Promise<string>;
    searchThreads: (searchQuery: string) => Promise<ForumThread[]>;
    getUserThreads: (
        userId: string,
        sortBy?: "createdAt" | "lastActivity" | "views" | "replyCount",
        sortOrder?: "asc" | "desc",
        pageSize?: number,
        lastVisible?: unknown
    ) => Promise<ForumThread[]>;
    getUserThreadsWithFilter: (
        userId: string,
        filter?: "all" | "recent" | "popular" | "unanswered" | "pinned",
        sortBy?: "createdAt" | "lastActivity" | "views" | "replyCount",
        sortOrder?: "asc" | "desc",
        pageSize?: number
    ) => Promise<ForumThread[]>;
    getUserReplies: (userId: string) => Promise<ForumReply[]>;
    clearCurrentThread: () => void;
    clearError: () => void;
} 