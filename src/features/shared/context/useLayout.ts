import { createContext, useContext } from "react";

interface LayoutContextType {
  isFooterHidden: boolean;
  hideFooter: (hidden: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
