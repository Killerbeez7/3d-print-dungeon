// contexts/modelsContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { createAdvancedModel } from "../services/modelService";

const ModelsContext = createContext();
export const useModels = () => useContext(ModelsContext);

export const ModelsProvider = ({ children }) => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1) Real-time listening to "models" for the gallery
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

    // 2) Delegating advanced logic to the modelService
    async function createModelInContext(data) {
        setLoading(true);
        try {
            await createAdvancedModel(data);
            // We do not manually add doc to local state, because onSnapshot handles that
            setLoading(false);
        } catch (err) {
            setLoading(false);
            throw err;
        }
    }

    return (
        <ModelsContext.Provider
            value={{
                models,
                loading,
                createModelInContext,
            }}
        >
            {children}
        </ModelsContext.Provider>
    );
};
