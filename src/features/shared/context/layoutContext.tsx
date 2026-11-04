import { useState, ReactNode } from "react";

import { LayoutContext } from "./useLayout";

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