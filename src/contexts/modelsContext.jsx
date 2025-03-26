import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, onSnapshot, orderBy, where, doc, getDoc } from "firebase/firestore";
import PropTypes from "prop-types";
import { createAdvancedModel } from "../services/modelService";

const ModelsContext = createContext();

export const useModels = () => useContext(ModelsContext);

export const ModelsProvider = ({ children }) => {
    const [models, setModels] = useState([]);
    const [userModels, setUserModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploader, setUploader] = useState(null);
    const [selectedRenderIndex, setSelectedRenderIndex] = useState(-1);

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

    // Fetch uploader info
    const fetchUploader = async (uploaderId) => {
        try {
            const userDocRef = doc(db, "users", uploaderId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUploader(userDoc.data());
            }
        } catch (err) {
            console.error("Error fetching uploader data:", err);
        }
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
                uploader,
                selectedRenderIndex,
                setSelectedRenderIndex,
                fetchUploader,
                createModelInContext,
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
