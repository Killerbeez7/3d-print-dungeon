import { createContext } from "react";
import type { Model } from "@/types/model";

export interface ModelsContextType {
    models: Model[];
    userModels: Model[];
    loading: boolean;
    uploader: Record<string, unknown> | undefined;
    selectedRenderIndex: number;
    setSelectedRenderIndex: (idx: number) => void;
    fetchUploader: (uploaderId: string) => Promise<void>;
    fetchModelsByUser: (userId: string) => () => void;
}

export const ModelsContext = createContext<ModelsContextType | undefined>(undefined); 