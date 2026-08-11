export type Role = "user" | "artist" | "moderator" | "admin" | "superadmin";

export type Permission =
  | "read:models"
  | "write:models"
  | "moderate:forum"
  | "manage:users"
  | "manage:billing"
  | "manage:content";
