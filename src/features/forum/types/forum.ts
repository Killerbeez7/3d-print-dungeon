import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

// DOMAIN

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  order: number;
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
  updatedAt?: Date;
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
  isEdited: boolean;
  parentReplyId?: string;
}

// QUERY

export type ForumThreadSortField = "createdAt" | "lastActivity" | "views" | "replyCount";
export type ForumSortOrder = "asc" | "desc";
export type ForumThreadFilter = "all" | "recent" | "popular" | "unanswered" | "pinned";
export type ForumTimeFrame = "day" | "week" | "month" | "year";

export interface FetchThreadsOptions {
  cursor?: QueryDocumentSnapshot<DocumentData>;
  limit?: number;
  categoryId?: string;
  authorId?: string;
  search?: string;
  sortBy?: ForumThreadSortField;
  sortOrder?: ForumSortOrder;
  filter?: ForumThreadFilter;
  timeFrame?: ForumTimeFrame;
}

export interface FetchRepliesOptions {
  threadId: string;
  cursor?: QueryDocumentSnapshot<DocumentData>;
  limit?: number;
}

// THREAD MUTATIONS

export interface CreateThreadInput {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}

export interface CreateThreadData extends CreateThreadInput {
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
}

export interface UpdateThreadInput {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}

// REPLY MUTATIONS

export interface CreateReplyInput {
  threadId: string;
  content: string;
  parentReplyId?: string;
}

export interface CreateReplyData extends CreateReplyInput {
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
}

export interface UpdateReplyInput {
  content: string;
}
