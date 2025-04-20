import { User } from "../types/user";

export interface ForumCategory {
    id: string;
    name: string;
    description: string;
    order: number;
    icon?: string;
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

export interface ForumUser extends User {
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