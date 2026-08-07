import type { Timestamp } from "firebase/firestore";

export interface MaintenanceStatus {
  inMaintenance: boolean;
  message: string | null;
  endTime: Date | null;
}

export interface MaintenanceSettings {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceEndTime: Timestamp | null;

  scheduledMaintenance: {
    isScheduled: boolean;
    startTime: Timestamp | null;
    endTime: Timestamp | null;
    message: string;
  };
}
