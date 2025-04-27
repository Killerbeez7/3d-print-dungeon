export interface MaintenanceStatus {
    inMaintenance: boolean;
    message: string | null;
    endTime: Date | null;
    isAdmin: boolean;
}

export type UserId = string | null | undefined; 