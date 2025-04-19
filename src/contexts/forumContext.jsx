import { createContext, useContext, useState, useEffect } from "react";
import { forumService } from "../services/forumService";
import { useAuth } from "./authContext";

const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [categories, setCategories] = useState([]);
    const [recentThreads, setRecentThreads] = useState([]);
    const [popularThreads, setPopularThreads] = useState([]);
    const [unansweredThreads, setUnansweredThreads] = useState([]);
    const [currentThread, setCurrentThread] = useState(null);
    const [threadReplies, setThreadReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [categoriesData, recentData, popularData, unansweredData] = await Promise.all([
                    forumService.getCategories(),
                    forumService.getRecentThreads(),
                    forumService.getPopularThreads(),
                    forumService.getUnansweredThreads()
                ]);

                setCategories(categoriesData);
                setRecentThreads(recentData);
                setPopularThreads(popularData);
                setUnansweredThreads(unansweredData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Load thread data when threadId changes
    const loadThread = async (threadId) => {
        try {
            setLoading(true);
            const [threadData, repliesData] = await Promise.all([
                forumService.getThreadById(threadId),
                forumService.getThreadReplies(threadId)
            ]);

            setCurrentThread(threadData);
            setThreadReplies(repliesData);
            
            // Increment views
            await forumService.incrementThreadViews(threadId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create new thread
    const createThread = async (threadData) => {
        try {
            setLoading(true);
            const newThread = {
                ...threadData,
                authorId: currentUser.uid,
                authorName: currentUser.displayName,
                authorPhotoURL: currentUser.photoURL
            };
            
            const threadId = await forumService.createThread(newThread);
            return threadId;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Add reply to thread
    const addReply = async (threadId, content) => {
        try {
            setLoading(true);
            const replyData = {
                content,
                authorId: currentUser.uid,
                authorName: currentUser.displayName,
                authorPhotoURL: currentUser.photoURL
            };

            await forumService.addReply(threadId, replyData);
            
            // Refresh thread and replies
            await loadThread(threadId);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get threads by category
    const getThreadsByCategory = async (categoryId) => {
        try {
            setLoading(true);
            const threads = await forumService.getThreadsByCategory(categoryId);
            return threads;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        categories,
        recentThreads,
        popularThreads,
        unansweredThreads,
        currentThread,
        threadReplies,
        loading,
        error,
        loadThread,
        createThread,
        addReply,
        getThreadsByCategory
    };

    return (
        <ForumContext.Provider value={value}>
            {children}
        </ForumContext.Provider>
    );
};

export const useForum = () => {
    const context = useContext(ForumContext);
    if (context === undefined) {
        throw new Error("useForum must be used within a ForumProvider");
    }
    return context;
}; 