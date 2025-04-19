import { db } from "../config/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";

export const forumService = {
    // Get all categories
    async getCategories() {
        const categoriesRef = collection(db, "forumCategories");
        const q = query(categoriesRef, orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Get threads by category
    async getThreadsByCategory(categoryId, sortBy = "lastActivity", limitCount = 20) {
        const threadsRef = collection(db, "forumThreads");
        const q = query(
            threadsRef,
            where("categoryId", "==", categoryId),
            orderBy(sortBy, "desc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Get recent threads
    async getRecentThreads(limitCount = 10) {
        const threadsRef = collection(db, "forumThreads");
        const q = query(
            threadsRef,
            orderBy("lastActivity", "desc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Get popular threads
    async getPopularThreads(limitCount = 10) {
        const threadsRef = collection(db, "forumThreads");
        const q = query(
            threadsRef,
            orderBy("views", "desc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Get unanswered threads
    async getUnansweredThreads(limitCount = 10) {
        const threadsRef = collection(db, "forumThreads");
        const q = query(
            threadsRef,
            where("replyCount", "==", 0),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Get thread by ID
    async getThreadById(threadId) {
        const threadRef = doc(db, "forumThreads", threadId);
        const threadSnap = await getDoc(threadRef);
        
        if (!threadSnap.exists()) {
            throw new Error("Thread not found");
        }

        return {
            id: threadSnap.id,
            ...threadSnap.data()
        };
    },

    // Create new thread
    async createThread(threadData) {
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
    },

    // Add reply to thread
    async addReply(threadId, replyData) {
        const threadRef = doc(db, "forumThreads", threadId);
        const repliesRef = collection(db, "forumReplies");
        
        const newReply = {
            ...replyData,
            threadId,
            createdAt: serverTimestamp()
        };
        
        await addDoc(repliesRef, newReply);
        
        // Update thread's lastActivity and replyCount
        const threadSnap = await getDoc(threadRef);
        const currentData = threadSnap.data();
        await updateDoc(threadRef, {
            lastActivity: serverTimestamp(),
            replyCount: (currentData.replyCount || 0) + 1
        });
    },

    // Get thread replies
    async getThreadReplies(threadId, limitCount = 20) {
        const repliesRef = collection(db, "forumReplies");
        const q = query(
            repliesRef,
            where("threadId", "==", threadId),
            orderBy("createdAt", "asc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Increment thread views
    async incrementThreadViews(threadId) {
        const threadRef = doc(db, "forumThreads", threadId);
        const threadSnap = await getDoc(threadRef);
        const currentData = threadSnap.data();
        
        await updateDoc(threadRef, {
            views: (currentData.views || 0) + 1
        });
    }
}; 