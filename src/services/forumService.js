import { db } from "../config/firebase";
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
    endBefore,
    startAt,
    endAt,
    limitToLast,
    increment,
} from "firebase/firestore";

/**
 * Forum Service
 * Contains methods for interacting with forum data in Firestore
 */
export const forumService = {
    /**
     * Get all categories
     */
    async getCategories() {
        try {
            const categoriesRef = collection(db, "forumCategories");
            const q = query(categoriesRef, orderBy("order", "asc"));
            const snapshot = await getDocs(q);
            
            // If no categories exist, create default ones
            if (snapshot.empty) {
                console.log("No categories found, creating default categories...");
                const defaultCategories = [
                    {
                        name: "General Discussion",
                        description: "General topics about 3D printing",
                        order: 1,
                        icon: "💬"
                    },
                    {
                        name: "Technical Support",
                        description: "Get help with technical issues",
                        order: 2,
                        icon: "🔧"
                    },
                    {
                        name: "Showcase",
                        description: "Show off your 3D prints",
                        order: 3,
                        icon: "🎨"
                    },
                    {
                        name: "Marketplace",
                        description: "Buy and sell 3D prints",
                        order: 4,
                        icon: "🛒"
                    },
                    {
                        name: "Events",
                        description: "Upcoming events and meetups",
                        order: 5,
                        icon: "📅"
                    }
                ];

                // Create default categories
                for (const category of defaultCategories) {
                    await addDoc(categoriesRef, {
                        ...category,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }

                // Fetch categories again after creating them
                const newSnapshot = await getDocs(q);
                return newSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting categories:", error);
            throw error;
        }
    },

    /**
     * Get a category by ID
     */
    async getCategoryById(categoryId) {
        try {
            const categoryRef = doc(db, "forumCategories", categoryId);
            const categoryDoc = await getDoc(categoryRef);
            
            if (!categoryDoc.exists()) {
                throw new Error("Category not found");
            }
            
            return {
                id: categoryDoc.id,
                ...categoryDoc.data()
            };
        } catch (error) {
            console.error("Error getting category:", error);
            throw error;
        }
    },

    /**
     * Create a new category
     */
    async createCategory(categoryData) {
        try {
            const categoriesRef = collection(db, "forumCategories");
            const data = {
                ...categoryData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(categoriesRef, data);
            return docRef.id;
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    },

    /**
     * Update a category
     */
    async updateCategory(categoryId, categoryData) {
        try {
            const categoryRef = doc(db, "forumCategories", categoryId);
            await updateDoc(categoryRef, {
                ...categoryData,
                updatedAt: serverTimestamp()
            });
            return categoryId;
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        }
    },

    /**
     * Delete a category
     */
    async deleteCategory(categoryId) {
        try {
            const categoryRef = doc(db, "forumCategories", categoryId);
            await deleteDoc(categoryRef);
            return categoryId;
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        }
    },

    /**
     * Get threads by category with pagination
     */
    async getThreadsByCategory(categoryId, sortBy = "lastActivity", page = 1, pageSize = 20) {
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
                threads: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting threads by category:", error);
            throw error;
        }
    },

    /**
     * Get more threads by category (pagination)
     */
    async getMoreThreadsByCategory(categoryId, sortBy = "lastActivity", lastVisible, pageSize = 20) {
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
                threads: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting more threads:", error);
            throw error;
        }
    },

    /**
     * Get recent threads
     */
    async getRecentThreads(limitCount = 10) {
        try {
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
        } catch (error) {
            console.error("Error getting recent threads:", error);
            throw error;
        }
    },

    /**
     * Get popular threads
     */
    async getPopularThreads(limitCount = 10) {
        try {
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
        } catch (error) {
            console.error("Error getting popular threads:", error);
            throw error;
        }
    },

    /**
     * Get unanswered threads
     */
    async getUnansweredThreads(limitCount = 10) {
        try {
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
        } catch (error) {
            console.error("Error getting unanswered threads:", error);
            throw error;
        }
    },

    /**
     * Get thread by ID
     */
    async getThreadById(threadId) {
        try {
            const threadRef = doc(db, "forumThreads", threadId);
            const threadSnap = await getDoc(threadRef);
            
            if (!threadSnap.exists()) {
                throw new Error("Thread not found");
            }

            return {
                id: threadSnap.id,
                ...threadSnap.data()
            };
        } catch (error) {
            console.error("Error getting thread:", error);
            throw error;
        }
    },

    /**
     * Create new thread
     */
    async createThread(threadData) {
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

            // Update thread count in category
            const categoryRef = doc(db, "forumCategories", threadData.categoryId);
            await updateDoc(categoryRef, {
                threadCount: increment(1)
            });

            return docRef.id;
        } catch (error) {
            console.error("Error creating thread:", error);
            throw error;
        }
    },

    /**
     * Update thread
     */
    async updateThread(threadId, threadData) {
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

    /**
     * Delete thread
     */
    async deleteThread(threadId, categoryId) {
        try {
            // Delete all replies first
            const repliesRef = collection(db, "forumReplies");
            const q = query(repliesRef, where("threadId", "==", threadId));
            const snapshot = await getDocs(q);
            
            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            // Delete thread
            const threadRef = doc(db, "forumThreads", threadId);
            batch.delete(threadRef);

            // Update thread count in category
            const categoryRef = doc(db, "forumCategories", categoryId);
            batch.update(categoryRef, {
                threadCount: increment(-1)
            });
            
            await batch.commit();
            return threadId;
        } catch (error) {
            console.error("Error deleting thread:", error);
            throw error;
        }
    },

    /**
     * Add reply to thread
     */
    async addReply(threadId, replyData) {
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

    /**
     * Update reply
     */
    async updateReply(replyId, replyData) {
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

    /**
     * Delete reply
     */
    async deleteReply(replyId, threadId) {
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

    /**
     * Get thread replies with pagination
     */
    async getThreadReplies(threadId, page = 1, pageSize = 20) {
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
                replies: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting thread replies:", error);
            throw error;
        }
    },

    /**
     * Get more thread replies (pagination)
     */
    async getMoreThreadReplies(threadId, lastVisible, pageSize = 20) {
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
                replies: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting more thread replies:", error);
            throw error;
        }
    },

    /**
     * Increment thread views
     */
    async incrementThreadViews(threadId) {
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

    /**
     * Search threads
     */
    async searchThreads(query, page = 1, pageSize = 20) {
        try {
            // Due to Firestore limitations, we can't do full-text search
            // We'll search by title for now (for production, consider Algolia or similar)
            const threadsRef = collection(db, "forumThreads");
            const q = query(
                threadsRef,
                where("title", ">=", query),
                where("title", "<=", query + '\uf8ff'),
                orderBy("title"),
                limit(pageSize)
            );
            
            const snapshot = await getDocs(q);
            
            return {
                threads: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error searching threads:", error);
            throw error;
        }
    },

    /**
     * Get user's threads
     */
    async getUserThreads(userId, page = 1, pageSize = 20) {
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
                threads: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting user threads:", error);
            throw error;
        }
    },

    /**
     * Get user's replies
     */
    async getUserReplies(userId, page = 1, pageSize = 20) {
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
                replies: snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })),
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error("Error getting user replies:", error);
            throw error;
        }
    }
}; 