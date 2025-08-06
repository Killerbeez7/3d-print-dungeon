import type { ModelData } from "@/features/models/types/model";

export interface ModelViewerProps {
  model: ModelData;
  selectedRenderIndex: number;
  setSelectedRenderIndex: (idx: number) => void;
  threeJsLoaded?: boolean;
  threeJsLoading?: boolean;
}

export interface NavigationArrowProps {
  direction: "left" | "right";
  onClick: () => void;
}

export interface NavigationDotsProps {
  selectedIndex: number;
  totalItems: number;
  onSelect: (idx: number) => void;
} 