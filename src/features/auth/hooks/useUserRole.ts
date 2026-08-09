import type { Role } from "@/features/user/types/user";
import { useAuth } from "../hooks/useAuth";

export function useUserRole() {
  const { roles, isAdmin } = useAuth();

  const hasRole = (role: Role) =>
    roles.includes(role) ||
    (role === "admin" && isAdmin);

  return {
    roles,
    isAdmin,
    hasRole,
  };
}