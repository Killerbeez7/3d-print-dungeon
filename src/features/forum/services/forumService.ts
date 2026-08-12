import { db } from "@/config/firebaseConfig";
import { FORUM_CATEGORIES } from "@/config/forumCategories";

import {
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  writeBatch,
  Timestamp,
  serverTimestamp,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  increment,
} from "firebase/firestore";

import type {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import type {
  ForumThread,
  ForumReply,
  ForumCategory,
  FetchThreadsOptions,
  FetchRepliesOptions,
  CreateThreadData,
  CreateReplyData,
  UpdateThreadInput,
  UpdateReplyInput,
} from "@/features/forum/types/forum";

export const PAGE_SIZE = 20;

// Fetch - Threads

export async function fetchThreads(options: FetchThreadsOptions = {}): Promise<{
  threads: ForumThread[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
}> {
  const {
    cursor,
    limit: pageSize = PAGE_SIZE,
    categoryId,
    authorId,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    filter = "all",
    timeFrame,
  } = options;

  const normalizedSearch = search?.trim().toLowerCase();

  let threadsQuery = query(collection(db, "forumThreads"));

  if (categoryId) {
    threadsQuery = query(threadsQuery, where("categoryId", "==", categoryId));
  }

  if (authorId) {
    threadsQuery = query(threadsQuery, where("authorId", "==", authorId));
  }

  if (filter === "unanswered") {
    threadsQuery = query(threadsQuery, where("replyCount", "==", 0));
  }

  if (filter === "pinned") {
    threadsQuery = query(threadsQuery, where("isPinned", "==", true));
  }

  if (filter === "recent") {
    const timeLimit = getTimeFrameStart(timeFrame);

    threadsQuery = query(threadsQuery, where("createdAt", ">=", timeLimit));
  }

  threadsQuery = query(threadsQuery, orderBy(sortBy, sortOrder));

  const queryLimit = normalizedSearch ? Math.max(pageSize, 100) : pageSize;

  if (cursor) {
    threadsQuery = query(threadsQuery, startAfter(cursor), limit(queryLimit));
  } else {
    threadsQuery = query(threadsQuery, limit(queryLimit));
  }

  const snapshot = await getDocs(threadsQuery);

  let threads = snapshot.docs.map(normalizeThread);

  if (normalizedSearch) {
    threads = threads.filter((thread) => {
      return threadMatchesSearch(thread, normalizedSearch);
    });
  }

  return {
    threads,
    nextCursor:
      !normalizedSearch && snapshot.docs.length === pageSize
        ? snapshot.docs[snapshot.docs.length - 1]
        : undefined,
  };
}

export async function fetchReplies(options: FetchRepliesOptions): Promise<{
  replies: ForumReply[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
}> {
  const { cursor, limit: pageSize = PAGE_SIZE, threadId } = options;

  let repliesQuery = query(
    collection(db, "forumReplies"),
    where("threadId", "==", threadId),
    orderBy("createdAt", "asc"),
    limit(pageSize)
  );

  if (cursor) {
    repliesQuery = query(
      collection(db, "forumReplies"),
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc"),
      startAfter(cursor),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(repliesQuery);

  return {
    replies: snapshot.docs.map(normalizeReply),
    nextCursor:
      snapshot.docs.length === pageSize
        ? snapshot.docs[snapshot.docs.length - 1]
        : undefined,
  };
}

export async function getThreadById(threadId: string): Promise<ForumThread> {
  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  const threadRef = doc(db, "forumThreads", threadId);

  const snapshot = await getDoc(threadRef);

  if (!snapshot.exists()) {
    throw new Error("Thread not found");
  }

  return normalizeThread(snapshot);
}

export async function getReplyById(replyId: string): Promise<ForumReply> {
  if (!replyId) {
    throw new Error("Reply ID is required");
  }

  const replyRef = doc(db, "forumReplies", replyId);

  const snapshot = await getDoc(replyRef);

  if (!snapshot.exists()) {
    throw new Error("Reply not found");
  }

  return normalizeReply(snapshot);
}

export async function getUserReplies(
  authorId: string,
  limitCount: number = 20
): Promise<ForumReply[]> {
  if (!authorId) {
    return [];
  }

  const repliesQuery = query(
    collection(db, "forumReplies"),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(repliesQuery);

  return snapshot.docs.map(normalizeReply);
}

export async function getCategories(): Promise<ForumCategory[]> {
  const categoriesQuery = query(
    collection(db, "forumCategories"),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(categoriesQuery);

  return snapshot.docs.map((categorySnapshot) => {
    return normalizeCategory(categorySnapshot);
  });
}

export async function getRecentThreads(limitCount: number = 10): Promise<ForumThread[]> {
  const threadsQuery = query(
    collection(db, "forumThreads"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(threadsQuery);

  return snapshot.docs.map(normalizeThread);
}

export async function getPopularThreads(limitCount: number = 10): Promise<ForumThread[]> {
  const threadsQuery = query(
    collection(db, "forumThreads"),
    orderBy("views", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(threadsQuery);

  return snapshot.docs.map(normalizeThread);
}

export async function getUnansweredThreads(
  limitCount: number = 10
): Promise<ForumThread[]> {
  const threadsQuery = query(
    collection(db, "forumThreads"),
    where("replyCount", "==", 0),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(threadsQuery);

  return snapshot.docs.map(normalizeThread);
}

// CRUD - Thread

export async function createThread(data: CreateThreadData): Promise<string> {
  if (!data.title.trim()) {
    throw new Error("Thread title is required");
  }

  if (!data.content.trim()) {
    throw new Error("Thread content is required");
  }

  if (!data.categoryId) {
    throw new Error("Category is required");
  }

  if (!data.authorId) {
    throw new Error("Author ID is required");
  }

  if (!data.authorName.trim()) {
    throw new Error("Author name is required");
  }

  const threadRef = await addDoc(collection(db, "forumThreads"), {
    title: data.title.trim(),
    content: data.content.trim(),
    categoryId: data.categoryId,
    authorId: data.authorId,
    authorName: data.authorName.trim(),
    authorPhotoURL: data.authorPhotoURL ?? "",
    tags: data.tags ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivity: serverTimestamp(),
    views: 0,
    replyCount: 0,
    isLocked: false,
    isPinned: false,
  });

  return threadRef.id;
}

export async function updateThread(
  threadId: string,
  data: UpdateThreadInput
): Promise<string> {
  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  if (!data.title.trim()) {
    throw new Error("Thread title is required");
  }

  if (!data.content.trim()) {
    throw new Error("Thread content is required");
  }

  if (!data.categoryId) {
    throw new Error("Category is required");
  }

  const threadRef = doc(db, "forumThreads", threadId);

  await updateDoc(threadRef, {
    title: data.title.trim(),
    content: data.content.trim(),
    categoryId: data.categoryId,
    tags: data.tags ?? [],
    updatedAt: serverTimestamp(),
  });

  return threadId;
}

export async function deleteThread(threadId: string): Promise<string> {
  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  const threadRef = doc(db, "forumThreads", threadId);

  const threadSnapshot = await getDoc(threadRef);

  if (!threadSnapshot.exists()) {
    throw new Error("Thread not found");
  }

  const repliesQuery = query(
    collection(db, "forumReplies"),
    where("threadId", "==", threadId)
  );

  const repliesSnapshot = await getDocs(repliesQuery);

  const batch = writeBatch(db);

  repliesSnapshot.docs.forEach((replySnapshot) => {
    batch.delete(replySnapshot.ref);
  });

  batch.delete(threadRef);

  await batch.commit();

  return threadId;
}

// CRUD - Reply

export async function createReply(data: CreateReplyData): Promise<string> {
  if (!data.threadId) {
    throw new Error("Thread ID is required");
  }

  if (!data.content.trim()) {
    throw new Error("Reply content is required");
  }

  if (!data.authorId) {
    throw new Error("Author ID is required");
  }

  if (!data.authorName.trim()) {
    throw new Error("Author name is required");
  }

  const threadRef = doc(db, "forumThreads", data.threadId);

  const replyRef = doc(collection(db, "forumReplies"));

  const batch = writeBatch(db);

  batch.set(replyRef, {
    threadId: data.threadId,
    content: data.content.trim(),
    authorId: data.authorId,
    authorName: data.authorName.trim(),
    authorPhotoURL: data.authorPhotoURL ?? "",
    parentReplyId: data.parentReplyId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isEdited: false,
  });

  batch.update(threadRef, {
    lastActivity: serverTimestamp(),
    replyCount: increment(1),
  });

  await batch.commit();

  return replyRef.id;
}

export async function updateReply(
  replyId: string,
  data: UpdateReplyInput
): Promise<string> {
  if (!replyId) {
    throw new Error("Reply ID is required");
  }

  if (!data.content.trim()) {
    throw new Error("Reply content is required");
  }

  const replyRef = doc(db, "forumReplies", replyId);

  await updateDoc(replyRef, {
    content: data.content.trim(),
    updatedAt: serverTimestamp(),
    isEdited: true,
  });

  return replyId;
}

export async function deleteReply(replyId: string, threadId: string): Promise<string> {
  if (!replyId) {
    throw new Error("Reply ID is required");
  }

  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  const replyRef = doc(db, "forumReplies", replyId);

  const threadRef = doc(db, "forumThreads", threadId);

  const replySnapshot = await getDoc(replyRef);

  if (!replySnapshot.exists()) {
    throw new Error("Reply not found");
  }

  const batch = writeBatch(db);

  batch.delete(replyRef);

  batch.update(threadRef, {
    replyCount: increment(-1),
  });

  await batch.commit();

  return replyId;
}

// Helpers - utils

export async function incrementThreadViews(threadId: string): Promise<void> {
  if (!threadId) {
    return;
  }

  const threadRef = doc(db, "forumThreads", threadId);

  await updateDoc(threadRef, {
    views: increment(1),
  });
}

// Helpers - Date/Time

const toDate = (value: unknown): Date => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date(0);
};

const getTimeFrameStart = (timeFrame?: "day" | "week" | "month" | "year"): Date => {
  const date = new Date();

  switch (timeFrame) {
    case "day":
      date.setDate(date.getDate() - 1);
      return date;

    case "month":
      date.setMonth(date.getMonth() - 1);
      return date;

    case "year":
      date.setFullYear(date.getFullYear() - 1);
      return date;

    case "week":
    default:
      date.setDate(date.getDate() - 7);
      return date;
  }
};

const threadMatchesSearch = (thread: ForumThread, search: string): boolean => {
  const categoryName =
    FORUM_CATEGORIES.find((category) => {
      return category.id === thread.categoryId;
    })?.name ?? "";

  const searchableText = [
    thread.title,
    thread.content,
    thread.categoryId,
    categoryName,
    ...(thread.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(search);
};

// Helpers - normalize

const normalizeThread = (
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): ForumThread => {
  const data = snapshot.data() ?? {};

  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "Untitled",
    content: typeof data.content === "string" ? data.content : "",
    categoryId: typeof data.categoryId === "string" ? data.categoryId : "",
    authorId: typeof data.authorId === "string" ? data.authorId : "",
    authorName: typeof data.authorName === "string" ? data.authorName : "",
    authorPhotoURL:
      typeof data.authorPhotoURL === "string" ? data.authorPhotoURL : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
    lastActivity: toDate(data.lastActivity),
    views: typeof data.views === "number" ? data.views : 0,
    replyCount: typeof data.replyCount === "number" ? data.replyCount : 0,
    isPinned: Boolean(data.isPinned),
    isLocked: Boolean(data.isLocked),
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
};

const normalizeReply = (
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): ForumReply => {
  const data = snapshot.data() ?? {};

  return {
    id: snapshot.id,
    threadId: typeof data.threadId === "string" ? data.threadId : "",
    content: typeof data.content === "string" ? data.content : "",
    authorId: typeof data.authorId === "string" ? data.authorId : "",
    authorName: typeof data.authorName === "string" ? data.authorName : "",
    authorPhotoURL:
      typeof data.authorPhotoURL === "string" ? data.authorPhotoURL : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
    isEdited: Boolean(data.isEdited),
    parentReplyId:
      typeof data.parentReplyId === "string" ? data.parentReplyId : undefined,
  };
};

const normalizeCategory = (
  snapshot: QueryDocumentSnapshot<DocumentData>
): ForumCategory => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: typeof data.name === "string" ? data.name : "",
    description: typeof data.description === "string" ? data.description : "",
    order: typeof data.order === "number" ? data.order : 0,
    threadCount: typeof data.threadCount === "number" ? data.threadCount : undefined,
    createdAt: data.createdAt ? toDate(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
  };
};
