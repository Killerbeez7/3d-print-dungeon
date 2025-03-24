import React, { createContext, useContext, useState, useEffect } from "react";
import {
    fetchComments,
    addComment,
    deleteComment,
    editComment,
} from "../services/commentsService";

const CommentsContext = createContext();

export const useComments = () => useContext(CommentsContext);

export const CommentsProvider = ({ modelId, children }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadComments = async () => {
        setLoading(true);
        try {
            const fetched = await fetchComments(modelId);
            setComments(fetched);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (modelId) {
            loadComments();
        }
    }, [modelId]);

    const submitComment = async (commentData) => {
        try {
            await addComment(modelId, commentData);
            await loadComments();
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    };

    const removeComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            await loadComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    };

    const updateComment = async (commentId, newData) => {
        try {
            await editComment(commentId, newData);
            await loadComments();
        } catch (error) {
            console.error("Error editing comment:", error);
            throw error;
        }
    };

    return (
        <CommentsContext.Provider
            value={{
                comments,
                loading,
                submitComment,
                removeComment,
                updateComment,
                reload: loadComments,
            }}
        >
            {children}
        </CommentsContext.Provider>
    );
};
