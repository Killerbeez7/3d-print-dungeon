import { useContext } from "react";
import { ModelsContext } from "../contexts/modelsContext";

export const useModels = () => {
    const context = useContext(ModelsContext);
    if (context === undefined) {
        throw new Error("useModels must be used within a ModelsProvider");
    }
    return context;
}; 