export type SystemAlertType = "success" | "error" | "warning" | "info";

export interface SystemAlert {
  id: string;
  type: SystemAlertType;
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

export interface SystemAlertContextValue {
  alerts: SystemAlert[];
  addAlert: (alert: Omit<SystemAlert, "id" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
  success: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
}
