import { RawUserData } from "@/features/auth/types/auth";
import type { IconType } from "react-icons";

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

export interface ForumUser extends RawUserData {
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

export interface ForumPagination {
    threads: {
        lastVisible: unknown;
        hasMore: boolean;
    };
    replies: {
        lastVisible: unknown;
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
    getThreadsByCategory: (categoryId: string, sortBy?: string) => Promise<ForumThread[]>;
    loadMoreThreads: (categoryId: string, sortBy?: string) => Promise<ForumThread[] | undefined>;
    loadThread: (threadId: string) => Promise<ForumThread & { replies?: ForumReply[] }>;
    loadMoreReplies: (threadId: string) => Promise<ForumReply[] | undefined>;
    createThread: (data: Partial<ForumThread>) => Promise<string>;
    updateThread: (threadId: string, data: Partial<ForumThread>) => Promise<string>;
    deleteThread: (threadId: string, categoryId: string) => Promise<string>;
    addReply: (threadId: string, content: string) => Promise<string>;
    updateReply: (replyId: string, threadId: string, content: string) => Promise<string>;
    deleteReply: (replyId: string, threadId: string) => Promise<string>;
    searchThreads: (searchQuery: string) => Promise<ForumThread[]>;
    getUserThreads: (userId: string) => Promise<ForumThread[]>;
    getUserReplies: (userId: string) => Promise<ForumReply[]>;
    clearCurrentThread: () => void;
    clearError: () => void;
} 