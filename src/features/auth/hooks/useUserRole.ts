import { useContext } from "react";
import { AuthContext } from "@/features/auth/context/authContext";
import type { Role } from "@/features/user/types/user";

// Custom hook to check user roles
export function useUserRole() {
  const { roles = [], isAdmin } = useContext(AuthContext);

  const hasRole = (role: Role): boolean => {
    return roles.includes(role) || (role === "admin" && isAdmin);
  };

  return {
    roles,
    isAdmin,
    hasRole,
  };
}