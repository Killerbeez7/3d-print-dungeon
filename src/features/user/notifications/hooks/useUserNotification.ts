import { useContext } from "react";
import { UserNotificationContext } from "../context/userNotificationContext";

export const useUserNotification = () => {
  const context = useContext(UserNotificationContext);
  
  if (!context) {
    throw new Error("useUserNotification must be used within a UserNotificationProvider");
  }
  
  return context;
};
