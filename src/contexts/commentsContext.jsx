import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

const CommentsContext = createContext();

export const useComments = () => useContext(CommentsContext);

export const CommentsProvider = ({ modelId, children }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!modelId) return;
        // Set up real-time subscription
        const q = query(
            collection(db, "comments"),
            where("modelId", "==", modelId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetched = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setComments(fetched);
                setLoading(false);
            },
            (error) => {
                console.error("Error listening to comments:", error);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [modelId]);

    const submitComment = async (commentData) => {
        try {
            await addDoc(collection(db, "comments"), {
                ...commentData,
                modelId,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    };

    const removeComment = async (commentId) => {
        try {
            await deleteDoc(doc(db, "comments", commentId));
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    };

    const updateComment = async (commentId, newData) => {
        try {
            await updateDoc(doc(db, "comments", commentId), newData);
        } catch (error) {
            console.error("Error updating comment:", error);
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
            }}
        >
            {children}
        </CommentsContext.Provider>
    );
};
