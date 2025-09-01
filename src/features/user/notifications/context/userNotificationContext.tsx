import { createContext } from "react";
import type { UserNotificationContextValue } from "../types/userNotification";

export const UserNotificationContext = createContext<UserNotificationContextValue | null>(null);
