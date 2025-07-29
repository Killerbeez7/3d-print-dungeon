import { createContext } from "react";
import type { NotificationContextValue } from "../types/notification";

export const NotificationContext = createContext<NotificationContextValue | null>(null);