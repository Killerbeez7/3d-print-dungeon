import { createContext } from "react";

export const ModelsContext = createContext({
    models: [],
    userModels: [],
    loading: false,
    uploader: null,
    selectedRenderIndex: -1,
    setSelectedRenderIndex: () => {},
    fetchUploader: () => {},
    fetchModelsByUser: () => {},
}); 