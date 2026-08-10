import { useContext } from "react";

import { UserNotificationContext } from "../context/userNotificationContext";
import type { UserNotificationContextValue } from "../types/userNotification";

export function useUserNotification(): UserNotificationContextValue {
  const context = useContext(UserNotificationContext);

  if (!context) {
    throw new Error("useUserNotification must be used within a UserNotificationProvider");
  }

  return context;
}
