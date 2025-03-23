import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { createAdvancedModel } from "../services/modelService";
import PropTypes from "prop-types";

const ModelsContext = createContext();
export const useModels = () => useContext(ModelsContext);

export const ModelsProvider = ({ children }) => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);

    // Real-time listener
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

    async function createModelInContext(data) {
        setLoading(true);
        try {
            await createAdvancedModel(data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            throw err;
        }
    }

    return (
        <ModelsContext.Provider
            value={{ models, loading, createModelInContext }}
        >
            {children}
        </ModelsContext.Provider>
    );
};

ModelsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
