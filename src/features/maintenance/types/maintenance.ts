export interface MaintenanceStatus {
    inMaintenance: boolean;
    message: string | null;
    endTime: Date | null;
    isAdmin: boolean;
}

export interface MaintenanceSettings {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    maintenanceEndTime: Date | null;
    scheduledMaintenance: {
        isScheduled: boolean;
        startTime: Date | null;
        endTime: Date | null;
        message: string;
    };
}

export type UserId = string | null | undefined; 