import { useContext } from "react";
import { AuthContext } from "@/contexts/authContext";

export function useUserRole() {
  const { userData, isAdmin } = useContext(AuthContext);

  const role = userData?.role ?? (isAdmin ? "admin" : "user");

  return {
    role,
    isAdmin: role === "admin",
    isArtist: role === "artist",
    isUser: role === "user",
  };
}
