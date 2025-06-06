import { useState, useEffect, useCallback } from "react";
import { db } from "../config/firebase";
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    where,
    doc,
    getDoc,
} from "firebase/firestore";
import PropTypes from "prop-types";
import { ModelsContext } from "../contexts/modelsContext";

export const ModelsProvider = ({ children }) => {
    const [models, setModels] = useState([]);
    const [userModels, setUserModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploader, setUploader] = useState(null);
    const [selectedRenderIndex, setSelectedRenderIndex] = useState(-1);

    // listener to fetch all models
    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "models"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setModels(items);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching models:", err);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // fetch models by userId
    const fetchModelsByUser = (userId) => {
        setLoading(true);
        const q = query(
            collection(db, "models"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUserModels(items);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching user models:", err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    };

    const fetchUploader = useCallback(async (uploaderId) => {
        try {
            const userDocRef = doc(db, "users", uploaderId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUploader(userDoc.data());
            }
        } catch (err) {
            console.error("Error fetching uploader data:", err);
        }
    }, []);

    return (
        <ModelsContext.Provider
            value={{
                models,
                userModels,
                loading,
                uploader,
                selectedRenderIndex,
                setSelectedRenderIndex,
                fetchUploader,
                fetchModelsByUser,
            }}
        >
            {children}
        </ModelsContext.Provider>
    );
};

ModelsProvider.propTypes = {
    children: PropTypes.node.isRequired,
}; 