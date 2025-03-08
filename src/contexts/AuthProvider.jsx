import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import PropTypes from "prop-types";
import { AuthService } from "../services/auth";

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = AuthService.listenForAuthChanges(setUser);

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            signUp: AuthService.signUp, 
            signIn: AuthService.signIn, 
            logout: AuthService.signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

