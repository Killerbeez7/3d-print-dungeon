import { createContext, useContext, useState, ReactNode } from "react";

interface LayoutContextType {
    isFooterHidden: boolean;
    hideFooter: (hidden: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }
    return context;
};

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [isFooterHidden, setIsFooterHidden] = useState(false);

    const hideFooter = (hidden: boolean) => {
        setIsFooterHidden(hidden);
    };

    return (
        <LayoutContext.Provider value={{ isFooterHidden, hideFooter }}>
            {children}
        </LayoutContext.Provider>
    );
}; 