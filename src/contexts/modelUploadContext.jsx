import { createContext, useContext, useState } from "react";
import { createAdvancedModel } from "../services/modelsService";

const ModelUploadContext = createContext();

export const ModelUploadProvider = ({ children }) => {
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]); // Store uploaded files
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRenderIndex, setSelectedRenderIndex] = useState(-1);
    const [modelData, setModelData] = useState({
        name: "",
        description: "",
        category: "",
        tags: [],
        convertedUrl: null,
        renderFiles: [],
        renderPreviewUrls: [],
        selectedRenderIndex: 0,
    });

    async function createModelInContext(data) {
        setLoading(true);
        try {
            const result = await createAdvancedModel(data);
    
            // Update context with the new model data
            setModelData((prev) => ({
                ...prev,
                convertedUrl: result.convertedFileUrl,
                renderFiles: result.renderFileUrls || [],
                selectedRenderIndex: data.selectedRenderIndex,
            }));
    
            setLoading(false);
        } catch (err) {
            setLoading(false);
            throw err;
        }
    }

    return (
        <ModelUploadContext.Provider value={{ 
            step, setStep, 
            files, setFiles, 
            images, setImages,
            loading, setLoading,
            modelData, setModelData,
            selectedRenderIndex, setSelectedRenderIndex,
            createModelInContext,
        }}>
            {children}
        </ModelUploadContext.Provider>
    );
};

export const useModelUpload = () => useContext(ModelUploadContext);
