import { useState, useEffect } from "react";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { MdExpandLess, MdExpandMore, MdSave } from "react-icons/md";

import { db } from "@/config/firebaseConfig";
import type { MaintenanceSettingsType } from "@/features/admin/types/admin";

export const MaintenanceSettings = () => {
  const [settings, setSettings] = useState<MaintenanceSettingsType>({
    isMaintenanceMode: false,
    maintenanceMessage:
      "We're currently performing some updates to improve your experience.",
    maintenanceEndTime: null,
    scheduledMaintenance: {
      isScheduled: false,
      startTime: null,
      endTime: null,
      message: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [showCurrentSettings, setShowCurrentSettings] = useState(false);
  const [showScheduledSettings, setShowScheduledSettings] = useState(false);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseDateInput = (value: string | null) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return Timestamp.fromDate(date);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const settingsRef = doc(db, "settings", "maintenance");
        const settingsDoc = await getDoc(settingsRef);

        if (!settingsDoc.exists()) {
          return;
        }

        const data = settingsDoc.data();

        const formattedData: MaintenanceSettingsType = {
          isMaintenanceMode: data.isMaintenanceMode ?? false,
          maintenanceMessage: data.maintenanceMessage ?? "",
          maintenanceEndTime: data.maintenanceEndTime
            ? formatDateForInput(data.maintenanceEndTime.toDate())
            : "",
          scheduledMaintenance: {
            isScheduled: data.scheduledMaintenance?.isScheduled ?? false,
            startTime: data.scheduledMaintenance?.startTime
              ? formatDateForInput(data.scheduledMaintenance.startTime.toDate())
              : "",
            endTime: data.scheduledMaintenance?.endTime
              ? formatDateForInput(data.scheduledMaintenance.endTime.toDate())
              : "",
            message: data.scheduledMaintenance?.message ?? "",
          },
        };

        setSettings(formattedData);

        setShowCurrentSettings(Boolean(data.isMaintenanceMode));

        setShowScheduledSettings(Boolean(data.scheduledMaintenance?.isScheduled));
      } catch (error) {
        console.error("Error initializing maintenance settings:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const settingsRef = doc(db, "settings", "maintenance");

      const settingsToSave = {
        isMaintenanceMode: settings.isMaintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,

        maintenanceEndTime: parseDateInput(settings.maintenanceEndTime),

        scheduledMaintenance: {
          isScheduled: settings.scheduledMaintenance.isScheduled,

          startTime: parseDateInput(settings.scheduledMaintenance.startTime),

          endTime: parseDateInput(settings.scheduledMaintenance.endTime),

          message: settings.scheduledMaintenance.message,
        },

        lastUpdated: serverTimestamp(),
      };

      await setDoc(settingsRef, settingsToSave, { merge: true });

      setSaveStatus({
        type: "success",
        message: "Settings saved successfully!",
      });
    } catch (error) {
      console.error("Error saving maintenance settings:", error);

      setSaveStatus({
        type: "error",
        message: "Failed to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-4 text-center">Loading maintenance settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        {/* Current Maintenance Status */}
        <div className="rounded-lg bg-bg-secondary p-6">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setShowCurrentSettings((current) => !current)}
          >
            <h3 className="flex items-center gap-2 text-lg font-bold text-white/90">
              Current Maintenance
            </h3>

            {showCurrentSettings ? (
              <MdExpandLess size={24} className="text-white" />
            ) : (
              <MdExpandMore size={24} className="text-white" />
            )}
          </div>

          {showCurrentSettings && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-txt-primary">Maintenance Mode</label>

                  <p className="text-sm text-txt-secondary">
                    Enable to show maintenance page to all users
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.isMaintenanceMode}
                    onChange={(event) => {
                      setSettings((current) => ({
                        ...current,
                        isMaintenanceMode: event.target.checked,
                      }));
                    }}
                    onClick={(event) => event.stopPropagation()}
                    className="peer sr-only"
                  />

                  <div className="peer h-6 w-11 rounded-full bg-bg-surface after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:content-[''] after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25" />
                </label>
              </div>

              {settings.isMaintenanceMode && (
                <>
                  <div>
                    <label className="mb-1 block font-medium text-txt-primary">
                      Maintenance Message
                    </label>

                    <textarea
                      value={settings.maintenanceMessage}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          maintenanceMessage: event.target.value,
                        }))
                      }
                      className="min-h-[100px] w-full rounded-lg bg-bg-surface px-4 py-2 text-txt-primary"
                      placeholder="Enter maintenance message..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-txt-primary">
                      Maintenance End Time
                    </label>

                    <input
                      type="datetime-local"
                      value={settings.maintenanceEndTime || ""}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          maintenanceEndTime: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg bg-bg-surface px-4 py-2 text-txt-primary"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Scheduled Maintenance */}
        <div className="rounded-lg bg-bg-secondary p-6">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setShowScheduledSettings((current) => !current)}
          >
            <h3 className="flex items-center gap-2 text-lg font-bold text-white/90">
              Scheduled Maintenance
            </h3>

            {showScheduledSettings ? (
              <MdExpandLess size={24} className="text-white" />
            ) : (
              <MdExpandMore size={24} className="text-white" />
            )}
          </div>

          {showScheduledSettings && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-txt-primary">
                    Enable Scheduled Maintenance
                  </label>

                  <p className="text-sm text-txt-secondary">
                    Schedule maintenance mode in advance
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.scheduledMaintenance.isScheduled}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        scheduledMaintenance: {
                          ...current.scheduledMaintenance,
                          isScheduled: event.target.checked,
                        },
                      }))
                    }
                    onClick={(event) => event.stopPropagation()}
                    className="peer sr-only"
                  />

                  <div className="peer h-6 w-11 rounded-full bg-bg-surface after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:content-[''] after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25" />
                </label>
              </div>

              {settings.scheduledMaintenance.isScheduled && (
                <>
                  <div>
                    <label className="mb-1 block font-medium text-txt-primary">
                      Start Time
                    </label>

                    <input
                      type="datetime-local"
                      value={settings.scheduledMaintenance.startTime || ""}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          scheduledMaintenance: {
                            ...current.scheduledMaintenance,
                            startTime: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg bg-bg-surface px-4 py-2 text-txt-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-txt-primary">
                      End Time
                    </label>

                    <input
                      type="datetime-local"
                      value={settings.scheduledMaintenance.endTime || ""}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          scheduledMaintenance: {
                            ...current.scheduledMaintenance,
                            endTime: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg bg-bg-surface px-4 py-2 text-txt-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-txt-primary">
                      Scheduled Message
                    </label>

                    <textarea
                      value={settings.scheduledMaintenance.message}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          scheduledMaintenance: {
                            ...current.scheduledMaintenance,
                            message: event.target.value,
                          },
                        }))
                      }
                      className="min-h-[100px] w-full rounded-lg bg-bg-surface px-4 py-2 text-txt-primary"
                      placeholder="Enter scheduled maintenance message..."
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
        >
          <MdSave size={20} />
          {saving ? "Saving..." : "Save Settings"}
        </button>

        {saveStatus && (
          <p
            className={`text-sm ${
              saveStatus.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {saveStatus.message}
          </p>
        )}
      </div>
    </div>
  );
};
