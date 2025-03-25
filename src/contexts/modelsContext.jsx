import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import PropTypes from "prop-types";
import { createAdvancedModel } from "../services/modelService";

const ModelsContext = createContext();

export const useModels = () => useContext(ModelsContext);

export const ModelsProvider = ({ children }) => {
    const [models, setModels] = useState([]);
    const [userModels, setUserModels] = useState([]); // To store models specific to the current user
    const [loading, setLoading] = useState(false);

    // Real-time listener to fetch all models
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

    // Fetch models by a specific userId
    const fetchModelsByUser = (userId) => {
        setLoading(true);
        const q = query(collection(db, "models"), where("userId", "==", userId), orderBy("createdAt", "desc"));
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

    // Create a new model and update context
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
            value={{
                models,
                userModels,
                loading,
                createModelInContext,
                fetchModelsByUser, // Expose this function for Profile to use
            }}
        >
            {children}
        </ModelsContext.Provider>
    );
};

ModelsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};