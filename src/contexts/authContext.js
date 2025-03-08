import { createContext, useContext } from "react";

// Create Auth Context
export const AuthContext = createContext(undefined);

// Custom hook to use Auth Context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
}
