import { useSystemAlert } from "../hooks/useSystemAlert";
import type { SystemAlertType } from "../types/systemAlert";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const getAlertIcon = (type: SystemAlertType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "info":
      return <Info className="w-5 h-5 text-blue-500" />;
    default:
      return <Info className="w-5 h-5 text-gray-500" />;
  }
};

const getAlertStyles = (type: SystemAlertType) => {
  const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out";
  
  switch (type) {
    case "success":
      return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
    case "error":
      return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
    case "warning":
      return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
    case "info":
      return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
    default:
      return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
  }
};

export const SystemAlertContainer = () => {
  const { alerts, removeAlert } = useSystemAlert();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getAlertStyles(alert.type)} animate-in slide-in-from-right-2 duration-300`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getAlertIcon(alert.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium leading-5">
              {alert.title}
            </h4>
            {alert.message && (
              <p className="text-sm leading-4 mt-1 opacity-90">
                {alert.message}
              </p>
            )}
          </div>
          
          <button
            onClick={() => removeAlert(alert.id)}
            className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
