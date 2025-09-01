import { useSystemAlert } from "@/features/system-alerts";

export interface NotificationTestConfig {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

export const useNotificationTest = () => {
  const notification = useSystemAlert();

  const testNotification = (config: NotificationTestConfig) => {
    const { type, title, message, duration } = config;
    
    switch (type) {
      case "success":
        notification.success(title, message, duration);
        break;
      case "error":
        notification.error(title, message, duration);
        break;
      case "warning":
        notification.warning(title, message, duration);
        break;
      case "info":
        notification.info(title, message, duration);
        break;
      default:
        notification.info(title, message, duration);
    }
  };

  const testAllTypes = (title: string, message: string, duration?: number) => {
    notification.success(title, message, duration);
    setTimeout(() => notification.error(title, message, duration), 1000);
    setTimeout(() => notification.warning(title, message, duration), 2000);
    setTimeout(() => notification.info(title, message, duration), 3000);
  };

  const testPersistent = (title: string, message: string) => {
    notification.info(title, message, 0);
  };

  const testLongMessage = (title: string, message: string) => {
    notification.info(title, message, 10000);
  };

  return {
    testNotification,
    testAllTypes,
    testPersistent,
    testLongMessage,
  };
}; 