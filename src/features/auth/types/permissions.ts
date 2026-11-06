export type Role = "user" | "artist" | "moderator" | "admin" | "superadmin" | "tester";

export type Permission =
  | "read:models"
  | "write:models"
  | "moderate:forum"
  | "manage:users"
  | "manage:billing"
  | "manage:content";
