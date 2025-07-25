import { db } from "@/config/firebaseConfig";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    startAfter,
    increment,
    QueryDocumentSnapshot,
    DocumentData,
    writeBatch,
} from "firebase/firestore";
import type {
    ForumThread, ForumReply, ForumCategory, FetchThreadsOptions, FetchRepliesOptions,
    CreateThreadParams, CreateReplyParams
} from "@/features/forum/types/forum";


export const PAGE_SIZE = 20;

// Fetch forum threads with pagination and optional filters
export async function fetchThreads(opts: FetchThreadsOptions = {}): Promise<{
    threads: ForumThread[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
}> {
    const {
        cursor,
        limit: lim = PAGE_SIZE,
        categoryId,
        authorId,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        filter = "all",
        timeFrame,
    } = opts;

    let q = query(collection(db, "forumThreads"));

    // Apply filters
    if (categoryId) {
        q = query(q, where("categoryId", "==", categoryId));
    }

    if (authorId) {
        q = query(q, where("authorId", "==", authorId));
    }

    if (search) {
        // Note: This requires a composite index for title range queries with sorting
        // The search functionality might need to be implemented differently for better performance
        q = query(
            q,
            where("title", ">=", search),
            where("title", "<=", search + "\uf8ff")
        );
    }

    // Apply specific filters
    switch (filter) {
        case "unanswered":
            q = query(q, where("replyCount", "==", 0));
            break;
        case "pinned":
            q = query(q, where("isPinned", "==", true));
            break;
        case "recent":
            const timeLimit = new Date();
            switch (timeFrame) {
                case "day":
                    timeLimit.setDate(timeLimit.getDate() - 1);
                    break;
                case "week":
                    timeLimit.setDate(timeLimit.getDate() - 7);
                    break;
                case "month":
                    timeLimit.setMonth(timeLimit.getMonth() - 1);
                    break;
                case "year":
                    timeLimit.setFullYear(timeLimit.getFullYear() - 1);
                    break;
                default:
                    timeLimit.setDate(timeLimit.getDate() - 7);
            }
            q = query(q, where("createdAt", ">=", timeLimit));
            break;
    }

    // Apply sorting
    q = query(q, orderBy(sortBy, sortOrder));

    // Apply pagination
    q = cursor ? query(q, startAfter(cursor), limit(lim)) : query(q, limit(lim));

    const snap = await getDocs(q);
    return {
        threads: snap.docs.map(normalizeThread),
        nextCursor: snap.docs.length === lim ? snap.docs[snap.docs.length - 1] : undefined,
    };
}

// Fetch thread replies with pagination
export async function fetchReplies(opts: FetchRepliesOptions): Promise<{
    replies: ForumReply[];
    nextCursor?: QueryDocumentSnapshot<DocumentData>;
}> {
    const { cursor, limit: lim = PAGE_SIZE, threadId } = opts;

    let q = query(
        collection(db, "forumReplies"),
        where("threadId", "==", threadId),
        orderBy("createdAt", "asc")
    );

    q = cursor ? query(q, startAfter(cursor), limit(lim)) : query(q, limit(lim));

    const snap = await getDocs(q);
    return {
        replies: snap.docs.map((doc) => ({ ...(doc.data() as ForumReply), id: doc.id })),
        nextCursor: snap.docs.length === lim ? snap.docs[snap.docs.length - 1] : undefined,
    };
}

// Create a new forum thread
export async function createThread(params: CreateThreadParams): Promise<string> {
    try {
        // Validate required fields
        if (!params.title?.trim()) {
            throw new Error("Thread title is required");
        }
        if (!params.content?.trim()) {
            throw new Error("Thread content is required");
        }
        if (!params.categoryId) {
            throw new Error("Category is required");
        }
        if (!params.authorId) {
            throw new Error("Author ID is required");
        }
        if (!params.authorName?.trim()) {
            throw new Error("Author name is required");
        }

        const threadsRef = collection(db, "forumThreads");

        const newThread = {
            title: params.title.trim(),
            content: params.content.trim(),
            categoryId: params.categoryId,
            authorId: params.authorId,
            authorName: params.authorName.trim(),
            authorPhotoURL: params.authorPhotoURL || "",
            tags: params.tags || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            views: 0,
            replyCount: 0,
            isLocked: false,
            isPinned: false
        };

        const docRef = await addDoc(threadsRef, newThread);
        console.log(`[forumService] Created thread with ID: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error("Error creating thread:", error);
        throw error;
    }
}


// Create a new reply to a thread
export async function createReply(params: CreateReplyParams): Promise<string> {
    try {
        // Validate required fields
        if (!params.content?.trim()) {
            throw new Error("Reply content is required");
        }
        if (!params.threadId) {
            throw new Error("Thread ID is required");
        }
        if (!params.authorId) {
            throw new Error("Author ID is required");
        }
        if (!params.authorName?.trim()) {
            throw new Error("Author name is required");
        }

        const threadRef = doc(db, "forumThreads", params.threadId);
        const repliesRef = collection(db, "forumReplies");

        // Clean the data to remove undefined values
        const cleanReplyData: Record<string, unknown> = {
            threadId: params.threadId,
            content: params.content.trim(),
            authorId: params.authorId,
            authorName: params.authorName.trim(),
            authorPhotoURL: params.authorPhotoURL || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isEdited: false
        };

        // Only add parentReplyId if it's provided
        if (params.parentReplyId) {
            cleanReplyData.parentReplyId = params.parentReplyId;
        }

        const newReply = cleanReplyData;

        const replyRef = await addDoc(repliesRef, newReply);

        // Update thread's lastActivity and replyCount
        await updateDoc(threadRef, {
            lastActivity: serverTimestamp(),
            replyCount: increment(1)
        });

        console.log(`[forumService] Created reply with ID: ${replyRef.id} for thread: ${params.threadId}`);
        return replyRef.id;
    } catch (error) {
        console.error("Error creating reply:", error);
        throw error;
    }
}


// Get a single thread by ID
export async function getThreadById(threadId: string): Promise<ForumThread> {
    try {
        const threadRef = doc(db, "forumThreads", threadId);
        const threadSnap = await getDoc(threadRef);

        if (!threadSnap.exists()) {
            throw new Error("Thread not found");
        }

        return normalizeThread(threadSnap);
    } catch (error) {
        console.error("Error getting thread:", error);
        throw error;
    }
}


// Update a thread
export async function updateThread(threadId: string, threadData: Partial<ForumThread>): Promise<string> {
    try {
        const threadRef = doc(db, "forumThreads", threadId);

        // Remove undefined values to avoid Firestore errors
        const cleanData = Object.fromEntries(
            Object.entries(threadData).filter(([, value]) => value !== undefined)
        );

        await updateDoc(threadRef, {
            ...cleanData,
            updatedAt: serverTimestamp()
        });
        return threadId;
    } catch (error) {
        console.error("Error updating thread:", error);
        throw error;
    }
}


// Delete a thread and all its replies
export async function deleteThread(threadId: string, authorId?: string): Promise<string> {
    try {
        // Get the thread first to check authorization
        const threadRef = doc(db, "forumThreads", threadId);
        const threadSnap = await getDoc(threadRef);

        if (!threadSnap.exists()) {
            throw new Error("Thread not found");
        }

        const threadData = threadSnap.data();

        // Check authorization - only thread author or admin can delete
        if (authorId && threadData.authorId !== authorId) {
            throw new Error("You can only delete your own threads");
        }

        // Delete all replies first
        const repliesRef = collection(db, "forumReplies");
        const q = query(repliesRef, where("threadId", "==", threadId));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete thread
        batch.delete(threadRef);

        await batch.commit();
        return threadId;
    } catch (error) {
        console.error("Error deleting thread:", error);
        throw error;
    }
}

// Update a reply
export async function updateReply(replyId: string, replyData: Record<string, unknown>, authorId?: string): Promise<string> {
    try {
        // Get the reply first to check authorization
        const replyRef = doc(db, "forumReplies", replyId);
        const replySnap = await getDoc(replyRef);

        if (!replySnap.exists()) {
            throw new Error("Reply not found");
        }

        const replyDataFromDb = replySnap.data();

        // Check authorization - only reply author or admin can update
        if (authorId && replyDataFromDb.authorId !== authorId) {
            throw new Error("You can only edit your own replies");
        }

        await updateDoc(replyRef, {
            ...replyData,
            updatedAt: serverTimestamp(),
            isEdited: true
        });
        return replyId;
    } catch (error) {
        console.error("Error updating reply:", error);
        throw error;
    }
}

// Delete a reply
export async function deleteReply(replyId: string, threadId: string): Promise<string> {
    try {
        const replyRef = doc(db, "forumReplies", replyId);
        await deleteDoc(replyRef);

        // Update thread's replyCount
        const threadRef = doc(db, "forumThreads", threadId);
        await updateDoc(threadRef, {
            replyCount: increment(-1)
        });

        return replyId;
    } catch (error) {
        console.error("Error deleting reply:", error);
        throw error;
    }
}

// Increment thread views  - ADD firebase function
export async function incrementThreadViews(threadId: string): Promise<void> {
    try {
        const threadRef = doc(db, "forumThreads", threadId);
        await updateDoc(threadRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error("Error incrementing thread views:", error);
        throw error;
    }
}

// Get forum categories
export async function getCategories(): Promise<ForumCategory[]> {
    try {
        const categoriesRef = collection(db, "forumCategories");
        const q = query(categoriesRef, orderBy("order", "asc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ForumCategory, "id">)
        }));
    } catch (error) {
        console.error("Error getting categories:", error);
        throw error;
    }
}

// Get popular threads (high views or replies)
export async function getPopularThreads(limitCount: number = 10): Promise<ForumThread[]> {
    try {
        const threadsRef = collection(db, "forumThreads");
        const q = query(
            threadsRef,
            orderBy("views", "desc"),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(normalizeThread);
    } catch (error) {
        console.error("Error getting popular threads:", error);
        throw error;
    }
}


// Get recent threads
export async function getRecentThreads(limitCount: number = 10): Promise<ForumThread[]> {
    try {
        const threadsRef = collection(db, "forumThreads");
        const q = query(
            threadsRef,
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(normalizeThread);
    } catch (error) {
        console.error("Error getting recent threads:", error);
        throw error;
    }
}

// Get unanswered threads
export async function getUnansweredThreads(limitCount: number = 10): Promise<ForumThread[]> {
    try {
        const threadsRef = collection(db, "forumThreads");
        const q = query(
            threadsRef,
            where("replyCount", "==", 0),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(normalizeThread);
    } catch (error) {
        console.error("Error getting unanswered threads:", error);
        throw error;
    }
}

// Normalize thread document data
function normalizeThread(doc: QueryDocumentSnapshot<DocumentData>): ForumThread {
    const data = doc.data();

    return {
        id: doc.id,
        title: typeof data.title === "string" ? data.title : "Untitled",
        content: typeof data.content === "string" ? data.content : "",
        categoryId: typeof data.categoryId === "string" ? data.categoryId : "",
        authorId: typeof data.authorId === "string" ? data.authorId : "",
        authorName: typeof data.authorName === "string" ? data.authorName : "",
        authorPhotoURL: typeof data.authorPhotoURL === "string" ? data.authorPhotoURL : "",
        createdAt: data.createdAt as Date,
        lastActivity: data.lastActivity as Date,
        views: typeof data.views === "number" ? data.views : 0,
        replyCount: typeof data.replyCount === "number" ? data.replyCount : 0,
        isPinned: Boolean(data.isPinned),
        isLocked: Boolean(data.isLocked),
        tags: Array.isArray(data.tags) ? data.tags : [],
    };
} 