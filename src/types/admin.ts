/** Generic Firestore document with id and dynamic fields */
export interface FirestoreDoc {
    id: string;
    [key: string]: unknown;
}

export interface AdminModel extends FirestoreDoc {
    createdAt?: unknown;
    originalFileUrl?: string;
    convertedFileUrl?: string;
    renderPrimaryUrl?: string;
    posterUrl?: string;
    renderExtraUrls?: string[];
}

export interface AdminUser extends FirestoreDoc {
    favorites?: string[];
    uploads?: string[];
}

export interface AdminReport extends FirestoreDoc {
    contentId: string;
    contentType: string;
    contentPreviewUrl?: string;
    contentTitle?: string;
    reason?: string;
    description?: string;
    reporterName?: string;
    status?: string;
}

export interface MaintenanceSettingsType {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    maintenanceEndTime: string | null;
    scheduledMaintenance: {
        isScheduled: boolean;
        startTime: string | null;
        endTime: string | null;
        message: string;
    };
}

export interface SiteSettingsType {
    allowNewRegistrations: boolean;
    maxUploadSizeMB: number;
    defaultUserQuotaMB: number;
    featuredCategories: string[];
    newCategoryName: string;
}