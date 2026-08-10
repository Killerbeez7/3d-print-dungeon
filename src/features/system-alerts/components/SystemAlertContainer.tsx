import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";

import { useSystemAlert } from "../hooks/useSystemAlert";
import type { SystemAlertType } from "../types/systemAlert";

interface AlertConfig {
  Icon: LucideIcon;
  borderClass: string;
  iconClass: string;
}

const alertConfig: Record<SystemAlertType, AlertConfig> = {
  success: {
    Icon: CheckCircle,
    borderClass: "border-success",
    iconClass: "text-success",
  },
  error: {
    Icon: AlertCircle,
    borderClass: "border-error",
    iconClass: "text-error",
  },
  warning: {
    Icon: AlertTriangle,
    borderClass: "border-warning",
    iconClass: "text-warning",
  },
  info: {
    Icon: Info,
    borderClass: "border-info",
    iconClass: "text-info",
  },
};

export function SystemAlertContainer() {
  const { alerts, removeAlert } = useSystemAlert();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed right-4 top-4 z-50 max-w-sm space-y-2"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {alerts.map((alert) => {
        const { Icon, borderClass, iconClass } = alertConfig[alert.type];

        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-lg border-l-4 bg-bg-surface p-4 text-txt-primary shadow-lg transition-all duration-300 ease-in-out animate-in slide-in-from-right-2 ${borderClass}`}
          >
            <Icon
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconClass}`}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-5">{alert.title}</p>

              {alert.message && (
                <p className="mt-1 text-sm leading-4 text-txt-secondary">
                  {alert.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeAlert(alert.id)}
              aria-label="Dismiss notification"
              className="ml-2 flex-shrink-0 rounded-md p-1 text-txt-secondary transition-colors hover:bg-black/10 hover:text-txt-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
