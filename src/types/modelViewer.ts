import type { ModelData } from "./model";

export interface ModelViewerProps {
  model: ModelData;
  selectedRenderIndex: number;
  setSelectedRenderIndex: (idx: number) => void;
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