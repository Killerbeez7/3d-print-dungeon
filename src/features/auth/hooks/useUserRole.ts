import { useAuth } from "./useAuth";
import type { Role } from "../types/permissions";

export function useUserRole() {
  const { roles, isAdmin } = useAuth();

  const hasRole = (role: Role) => roles.includes(role) || (role === "admin" && isAdmin);

  return {
    roles,
    isAdmin,
    hasRole,
  };
}
