export type SystemAlertType = "success" | "error" | "warning" | "info";

export interface SystemAlert {
  id: string;
  type: SystemAlertType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: Date;
}

export type SystemAlertInput = Omit<SystemAlert, "id" | "createdAt">;

export type ShowSystemAlert = (
  title: string,
  message?: string,
  duration?: number
) => void;

export interface SystemAlertContextValue {
  alerts: SystemAlert[];

  addAlert: (alert: SystemAlertInput) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;

  success: ShowSystemAlert;
  error: ShowSystemAlert;
  warning: ShowSystemAlert;
  info: ShowSystemAlert;
}
