import {
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  type FirestoreError,
} from "firebase/firestore";

import { db } from "@/config/firebaseConfig";

import type {
  MaintenanceSettings,
  MaintenanceStatus,
} from "@/features/maintenance/types/maintenance";

const MAINTENANCE_SETTINGS_REF = doc(db, "settings", "maintenance");

const DEFAULT_MAINTENANCE_STATUS: MaintenanceStatus = {
  inMaintenance: false,
  message: null,
  endTime: null,
};

const MAX_TIMEOUT_MS = 2_147_483_647;

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  // Temporary compatibility with values saved by the old implementation.
  if (typeof value === "string") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function isImmediateMaintenanceActive(settings: MaintenanceSettings): boolean {
  if (!settings.isMaintenanceMode) {
    return false;
  }

  const endTime = toDate(settings.maintenanceEndTime);

  // No end time means maintenance stays active until manually disabled.
  if (!endTime) {
    return true;
  }

  return Date.now() < endTime.getTime();
}

function isScheduledMaintenanceActive(settings: MaintenanceSettings): boolean {
  const scheduled = settings.scheduledMaintenance;

  if (!scheduled?.isScheduled) {
    return false;
  }

  const startTime = toDate(scheduled.startTime);
  const endTime = toDate(scheduled.endTime);

  if (!startTime || !endTime) {
    return false;
  }

  const now = Date.now();

  return now >= startTime.getTime() && now < endTime.getTime();
}

function getMaintenanceStatus(settings: MaintenanceSettings): MaintenanceStatus {
  if (isImmediateMaintenanceActive(settings)) {
    return {
      inMaintenance: true,
      message: settings.maintenanceMessage || "Site is under maintenance",
      endTime: toDate(settings.maintenanceEndTime),
    };
  }

  if (isScheduledMaintenanceActive(settings)) {
    return {
      inMaintenance: true,
      message: settings.scheduledMaintenance.message || "Site is under maintenance",
      endTime: toDate(settings.scheduledMaintenance.endTime),
    };
  }

  return DEFAULT_MAINTENANCE_STATUS;
}

function getNextBoundary(settings: MaintenanceSettings): number | null {
  const now = Date.now();

  // Current/manual maintenance end.
  if (settings.isMaintenanceMode) {
    const endTime = toDate(settings.maintenanceEndTime)?.getTime();

    if (endTime && endTime > now) {
      return endTime;
    }
  }

  const scheduled = settings.scheduledMaintenance;

  if (scheduled?.isScheduled && scheduled.startTime && scheduled.endTime) {
    const startTime = toDate(scheduled.startTime)?.getTime();

    const endTime = toDate(scheduled.endTime)?.getTime();

    if (!startTime || !endTime) {
      return null;
    }

    if (now < startTime) {
      return startTime;
    }

    if (now < endTime) {
      return endTime;
    }
  }

  return null;
}

export async function checkMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    const snapshot = await getDoc(MAINTENANCE_SETTINGS_REF);

    if (!snapshot.exists()) {
      return DEFAULT_MAINTENANCE_STATUS;
    }

    return getMaintenanceStatus(snapshot.data() as MaintenanceSettings);
  } catch (error) {
    console.error("Failed to check maintenance status:", error);

    // Fail open if maintenance status cannot be read.
    return DEFAULT_MAINTENANCE_STATUS;
  }
}

export function subscribeToMaintenanceStatus(
  onStatus: (status: MaintenanceStatus) => void,
  onError?: (error: FirestoreError | Error) => void
) {
  let currentSettings: MaintenanceSettings | null = null;

  let boundaryTimer: number | null = null;

  const clearBoundaryTimer = () => {
    if (boundaryTimer !== null) {
      window.clearTimeout(boundaryTimer);
      boundaryTimer = null;
    }
  };

  const scheduleNextBoundaryCheck = (settings: MaintenanceSettings) => {
    clearBoundaryTimer();

    const nextBoundary = getNextBoundary(settings);

    if (nextBoundary === null) {
      return;
    }

    const delay = Math.min(Math.max(nextBoundary - Date.now(), 0), MAX_TIMEOUT_MS);

    boundaryTimer = window.setTimeout(() => {
      if (!currentSettings) {
        return;
      }

      onStatus(getMaintenanceStatus(currentSettings));

      scheduleNextBoundaryCheck(currentSettings);
    }, delay);
  };

  const unsubscribe = onSnapshot(
    MAINTENANCE_SETTINGS_REF,

    (snapshot) => {
      try {
        if (!snapshot.exists()) {
          currentSettings = null;

          clearBoundaryTimer();

          onStatus(DEFAULT_MAINTENANCE_STATUS);

          return;
        }

        const settings = snapshot.data() as MaintenanceSettings;

        currentSettings = settings;

        onStatus(getMaintenanceStatus(settings));

        scheduleNextBoundaryCheck(settings);
      } catch (error) {
        clearBoundaryTimer();

        const parsedError = error instanceof Error ? error : new Error(String(error));

        console.error("Failed to process maintenance settings:", parsedError);

        onError?.(parsedError);
      }
    },

    (error) => {
      clearBoundaryTimer();

      console.error("Maintenance listener failed:", error);

      onError?.(error);
    }
  );

  return () => {
    clearBoundaryTimer();
    unsubscribe();
  };
}
