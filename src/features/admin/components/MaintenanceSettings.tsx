import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import {
    MdSave,
    MdSchedule,
    MdHistory,
    MdExpandMore,
    MdExpandLess,
} from "react-icons/md";
import { cleanupOldMaintenanceSettings } from "@/features/maintenance/services/maintenanceService";
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
        // Add 3 hours for GMT+3
        const adjustedDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
        const year = adjustedDate.getUTCFullYear();
        const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(adjustedDate.getUTCDate()).padStart(2, "0");
        const hours = String(adjustedDate.getUTCHours()).padStart(2, "0");
        const minutes = String(adjustedDate.getUTCMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const convertToUTC = (localDateString: string | null) => {
        if (!localDateString) return null;
        const date = new Date(localDateString);
        // Subtract 3 hours to store in UTC
        return new Date(date.getTime() - 3 * 60 * 60 * 1000);
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                // Clean up old settings first
                await cleanupOldMaintenanceSettings();

                // Then fetch current settings
                const settingsRef = doc(db, "settings", "maintenance");
                const settingsDoc = await getDoc(settingsRef);

                if (settingsDoc.exists()) {
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
                                ? formatDateForInput(
                                      data.scheduledMaintenance.startTime.toDate()
                                  )
                                : "",
                            endTime: data.scheduledMaintenance?.endTime
                                ? formatDateForInput(
                                      data.scheduledMaintenance.endTime.toDate()
                                  )
                                : "",
                            message: data.scheduledMaintenance?.message ?? "",
                        },
                    };
                    setSettings(formattedData);
                    setShowCurrentSettings(data.isMaintenanceMode);
                    setShowScheduledSettings(
                        data.scheduledMaintenance?.isScheduled || false
                    );
                }
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
                ...settings,
                maintenanceEndTime: settings.maintenanceEndTime
                    ? convertToUTC(settings.maintenanceEndTime)?.toISOString() ?? null
                    : null,
                scheduledMaintenance: {
                    ...settings.scheduledMaintenance,
                    startTime: settings.scheduledMaintenance.startTime
                        ? convertToUTC(
                              settings.scheduledMaintenance.startTime
                          )?.toISOString() ?? null
                        : null,
                    endTime: settings.scheduledMaintenance.endTime
                        ? convertToUTC(
                              settings.scheduledMaintenance.endTime
                          )?.toISOString() ?? null
                        : null,
                },
                lastUpdated: serverTimestamp(),
            };

            await setDoc(settingsRef, settingsToSave, { merge: true });
            setSaveStatus({ type: "success", message: "Settings saved successfully!" });
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
        return <div className="text-center py-4">Loading maintenance settings...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {/* Current Maintenance Status */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowCurrentSettings(!showCurrentSettings)}
                    >
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <MdHistory size={20} />
                            Current Maintenance Status
                        </h3>
                        {showCurrentSettings ? (
                            <MdExpandLess size={24} />
                        ) : (
                            <MdExpandMore size={24} />
                        )}
                    </div>

                    {showCurrentSettings && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium text-txt-primary">
                                        Maintenance Mode
                                    </label>
                                    <p className="text-sm text-txt-secondary">
                                        Enable to show maintenance page to all users
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.isMaintenanceMode}
                                        onChange={(e) => {
                                            setSettings((current) => ({
                                                ...current,
                                                isMaintenanceMode: e.target.checked,
                                            }));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>

                            {settings.isMaintenanceMode && (
                                <>
                                    <div>
                                        <label className="block font-medium text-txt-primary mb-1">
                                            Maintenance Message
                                        </label>
                                        <textarea
                                            value={settings.maintenanceMessage}
                                            onChange={(e) =>
                                                setSettings((current) => ({
                                                    ...current,
                                                    maintenanceMessage: e.target.value,
                                                }))
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-bg-surface text-txt-primary min-h-[100px]"
                                            placeholder="Enter maintenance message..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium text-txt-primary mb-1">
                                            Maintenance End Time (GMT+3)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={settings.maintenanceEndTime || ""}
                                            onChange={(e) =>
                                                setSettings((current) => ({
                                                    ...current,
                                                    maintenanceEndTime: e.target.value,
                                                }))
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-bg-surface text-txt-primary"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Scheduled Maintenance */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowScheduledSettings(!showScheduledSettings)}
                    >
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <MdSchedule size={20} />
                            Scheduled Maintenance
                        </h3>
                        {showScheduledSettings ? (
                            <MdExpandLess size={24} />
                        ) : (
                            <MdExpandMore size={24} />
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
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={
                                            settings.scheduledMaintenance.isScheduled
                                        }
                                        onChange={(e) =>
                                            setSettings((current) => ({
                                                ...current,
                                                scheduledMaintenance: {
                                                    ...current.scheduledMaintenance,
                                                    isScheduled: e.target.checked,
                                                },
                                            }))
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>

                            {settings.scheduledMaintenance.isScheduled && (
                                <>
                                    <div>
                                        <label className="block font-medium text-txt-primary mb-1">
                                            Start Time (GMT+3)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={
                                                settings.scheduledMaintenance.startTime ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setSettings((current) => ({
                                                    ...current,
                                                    scheduledMaintenance: {
                                                        ...current.scheduledMaintenance,
                                                        startTime: e.target.value,
                                                    },
                                                }))
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-bg-surface text-txt-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium text-txt-primary mb-1">
                                            End Time (GMT+3)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={
                                                settings.scheduledMaintenance.endTime ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setSettings((current) => ({
                                                    ...current,
                                                    scheduledMaintenance: {
                                                        ...current.scheduledMaintenance,
                                                        endTime: e.target.value,
                                                    },
                                                }))
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-bg-surface text-txt-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium text-txt-primary mb-1">
                                            Scheduled Message
                                        </label>
                                        <textarea
                                            value={settings.scheduledMaintenance.message}
                                            onChange={(e) =>
                                                setSettings((current) => ({
                                                    ...current,
                                                    scheduledMaintenance: {
                                                        ...current.scheduledMaintenance,
                                                        message: e.target.value,
                                                    },
                                                }))
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-bg-surface text-txt-primary min-h-[100px]"
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
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50"
                >
                    <MdSave size={20} />
                    {saving ? "Saving..." : "Save Settings"}
                </button>

                {saveStatus && (
                    <p
                        className={`text-sm ${
                            saveStatus.type === "success"
                                ? "text-green-500"
                                : "text-red-500"
                        }`}
                    >
                        {saveStatus.message}
                    </p>
                )}
            </div>
        </div>
    );
};
