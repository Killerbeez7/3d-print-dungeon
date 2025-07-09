import { db } from "@/config/firebase";
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
import type { ForumThread, ForumReply } from "@/types/forum";


export const forumService = {

    async getThreadsByCategory(categoryId: string, sortBy: string = "lastActivity", pageSize: number = 20): Promise<{ threads: ForumThread[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                where("categoryId", "==", categoryId),
                orderBy(sortBy, "desc"),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            return {
                threads: snapshot.docs.map(normalizeThread),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting threads by category:", error);
            throw error;
        }
    },


    async getMoreThreadsByCategory(categoryId: string, sortBy: string = "lastActivity", lastVisible: unknown, pageSize: number = 20): Promise<{ threads: ForumThread[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                where("categoryId", "==", categoryId),
                orderBy(sortBy, "desc"),
                startAfter(lastVisible),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            return {
                threads: snapshot.docs.map(normalizeThread),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting more threads:", error);
            throw error;
        }
    },


    async getRecentThreads(limitCount: number = 10): Promise<ForumThread[]> {
        try {
            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                orderBy("lastActivity", "desc"),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(normalizeThread);
        } catch (error) {
            console.error("Error getting recent threads:", error);
            throw error;
        }
    },


    async getPopularThreads(limitCount: number = 10): Promise<ForumThread[]> {
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
    },


    async getUnansweredThreads(limitCount: number = 10): Promise<ForumThread[]> {
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
    },


    async getThreadById(threadId: string): Promise<ForumThread> {
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
    },


    async createThread(threadData: Partial<ForumThread>): Promise<string> {
        try {
            const threadsRef = collection(db, "forumThreads");
            const newThread = {
                ...threadData,
                createdAt: serverTimestamp(),
                lastActivity: serverTimestamp(),
                views: 0,
                replyCount: 0,
                isLocked: false,
                isPinned: false
            };

            const docRef = await addDoc(threadsRef, newThread);
            return docRef.id;
        } catch (error) {
            console.error("Error creating thread:", error);
            throw error;
        }
    },


    async updateThread(threadId: string, threadData: Partial<ForumThread>): Promise<string> {
        try {
            const threadRef = doc(db, "forumThreads", threadId);
            await updateDoc(threadRef, {
                ...threadData,
                updatedAt: serverTimestamp()
            });
            return threadId;
        } catch (error) {
            console.error("Error updating thread:", error);
            throw error;
        }
    },


    async deleteThread(threadId: string): Promise<string> {
        try {
            // Delete all replies first
            const repliesRef = collection(db, "forumReplies");
            const q = query(repliesRef, where("threadId", "==", threadId));
            const snapshot = await getDocs(q);

            const batch = writeBatch(db)
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Delete thread
            const threadRef = doc(db, "forumThreads", threadId);
            batch.delete(threadRef);

            await batch.commit();
            return threadId;
        } catch (error) {
            console.error("Error deleting thread:", error);
            throw error;
        }
    },


    async addReply(threadId: string, replyData: Record<string, unknown>): Promise<string> {
        try {
            const threadRef = doc(db, "forumThreads", threadId);
            const repliesRef = collection(db, "forumReplies");

            const newReply = {
                ...replyData,
                threadId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isEdited: false
            };

            const replyRef = await addDoc(repliesRef, newReply);

            // Update thread's lastActivity and replyCount
            await updateDoc(threadRef, {
                lastActivity: serverTimestamp(),
                replyCount: increment(1)
            });

            return replyRef.id;
        } catch (error) {
            console.error("Error adding reply:", error);
            throw error;
        }
    },


    async updateReply(replyId: string, replyData: Record<string, unknown>): Promise<string> {
        try {
            const replyRef = doc(db, "forumReplies", replyId);
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
    },


    async deleteReply(replyId: string, threadId: string): Promise<string> {
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
    },


    async getThreadReplies(threadId: string, pageSize: number = 20): Promise<{ replies: ForumReply[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            const repliesRef = collection(db, "forumReplies");
            const q = query(
                repliesRef,
                where("threadId", "==", threadId),
                orderBy("createdAt", "asc"),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            return {
                replies: snapshot.docs.map((doc) => ({ ...(doc.data() as ForumReply), id: doc.id })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting thread replies:", error);
            throw error;
        }
    },


    async getMoreThreadReplies(threadId: string, lastVisible: unknown, pageSize: number = 20): Promise<{ replies: ForumReply[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            const repliesRef = collection(db, "forumReplies");
            const q = query(
                repliesRef,
                where("threadId", "==", threadId),
                orderBy("createdAt", "asc"),
                startAfter(lastVisible),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            return {
                replies: snapshot.docs.map((doc) => ({ ...(doc.data() as ForumReply), id: doc.id })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting more thread replies:", error);
            throw error;
        }
    },


    async incrementThreadViews(threadId: string): Promise<void> {
        try {
            const threadRef = doc(db, "forumThreads", threadId);
            await updateDoc(threadRef, {
                views: increment(1)
            });
        } catch (error) {
            console.error("Error incrementing thread views:", error);
            throw error;
        }
    },


    async searchThreads(queryStr: string, pageSize: number = 20): Promise<{ threads: ForumThread[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            // Due to Firestore limitations, we can't do full-text search
            // We'll search by title for now (for production, consider Algolia or similar)
            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                where("title", ">=", queryStr),
                where("title", "<=", queryStr + '\uf8ff'),
                orderBy("title"),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            return {
                threads: snapshot.docs.map(normalizeThread),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error searching threads:", error);
            throw error;
        }
    },


    async getUserThreads(userId: string, pageSize: number = 20): Promise<{ threads: ForumThread[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                where("authorId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            return {
                threads: snapshot.docs.map(normalizeThread),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting user threads:", error);
            throw error;
        }
    },


    async getUserReplies(userId: string, pageSize: number = 20): Promise<{ replies: ForumReply[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            const repliesRef = collection(db, "forumReplies");
            const q = query(
                repliesRef,
                where("authorId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            return {
                replies: snapshot.docs.map((doc) => ({ ...(doc.data() as ForumReply), id: doc.id })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting user replies:", error);
            throw error;
        }
    },


    async getNewestThreads(limitCount: number = 10): Promise<{ threads: ForumThread[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                orderBy("createdAt", "desc"),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            console.log(`[forumService] Fetched ${snapshot.docs.length} newest threads`);

            return {
                threads: snapshot.docs.map(normalizeThread),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === limitCount
            };
        } catch (error) {
            console.error("[forumService] Error getting newest threads:", error);
            return { threads: [], lastVisible: null, hasMore: false };
        }
    },


    async getMoreNewestThreads(lastVisible: unknown, limitCount: number = 5): Promise<{ threads: ForumThread[]; lastVisible: unknown; hasMore: boolean }> {
        try {
            if (!lastVisible) {
                console.error("[forumService] No lastVisible document provided for pagination");
                return { threads: [], lastVisible: null, hasMore: false };
            }

            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            console.log(`[forumService] Fetched ${snapshot.docs.length} more threads`);

            return {
                threads: snapshot.docs.map(normalizeThread),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === limitCount
            };
        } catch (error) {
            console.error("[forumService] Error getting more threads:", error);
            return { threads: [], lastVisible: null, hasMore: false };
        }
    }
};

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
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(0),
        lastActivity: data.lastActivity instanceof Date ? data.lastActivity : new Date(0),
        views: typeof data.views === "number" ? data.views : 0,
        replyCount: typeof data.replyCount === "number" ? data.replyCount : 0,
        isPinned: Boolean(data.isPinned),
        isLocked: Boolean(data.isLocked),
        tags: Array.isArray(data.tags) ? data.tags : [],
    };
} 