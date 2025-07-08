import { useContext } from "react";
import { ModelsContext, ModelsContextType } from "../contexts/modelsContext";

export const useModels = (): ModelsContextType => {
    const context = useContext(ModelsContext);
    if (context === undefined) {
        throw new Error("useModels must be used within a ModelsProvider");
    }
    return context;
};
