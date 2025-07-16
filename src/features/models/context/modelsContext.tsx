import { createContext } from "react";
import type { ModelData } from "@/features/models/types/model";

export interface ModelsContextType {
    models: ModelData[];
    userModels: ModelData[];
    loading: boolean;
    uploader: Record<string, unknown> | undefined;
    selectedRenderIndex: number;
    setSelectedRenderIndex: (idx: number) => void;
    fetchUploader: (uploaderId: string) => Promise<void>;
    fetchModelsByUser: (userId: string) => () => void;
}

export const ModelsContext = createContext<ModelsContextType | undefined>(undefined); 