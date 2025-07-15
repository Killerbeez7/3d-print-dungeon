import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MdSave } from "react-icons/md";
import type { SiteSettingsType } from "@/types/admin";

export const SiteSettings = () => {
    const [settings, setSettings] = useState<SiteSettingsType>({
        allowNewRegistrations: true,
        maxUploadSizeMB: 50,
        defaultUserQuotaMB: 500,
        featuredCategories: [],
        newCategoryName: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsRef = doc(db, "settings", "global");
                const settingsDoc = await getDoc(settingsRef);
                
                if (settingsDoc.exists()) {
                    console.log("Fetched settings:", settingsDoc.data());
                    setSettings(current => ({
                        ...current,
                        ...settingsDoc.data()
                    }));
                } else {
                    console.log("Creating initial settings document");
                    // Create initial settings document if it doesn't exist
                    await setDoc(settingsRef, {
                        allowNewRegistrations: settings.allowNewRegistrations,
                        maxUploadSizeMB: settings.maxUploadSizeMB,
                        defaultUserQuotaMB: settings.defaultUserQuotaMB,
                        featuredCategories: settings.featuredCategories,
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveSettings = async () => {
        setSaving(true);
        setSaveStatus(null);

        try {
            const settingsRef = doc(db, "settings", "global");
            const settingsToSave = {
                allowNewRegistrations: settings.allowNewRegistrations,
                maxUploadSizeMB: Number(settings.maxUploadSizeMB),
                defaultUserQuotaMB: Number(settings.defaultUserQuotaMB),
                featuredCategories: settings.featuredCategories,
            };

            console.log("Saving settings:", settingsToSave);
            await setDoc(settingsRef, settingsToSave, { merge: true });
            console.log("Settings saved successfully");
            setSaveStatus({ type: "success", message: "Settings saved successfully!" });
        } catch (error) {
            console.error("Error saving settings:", error);
            setSaveStatus({ type: "error", message: "Failed to save settings. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleAddCategory = () => {
        if (settings.newCategoryName.trim() && !settings.featuredCategories.includes(settings.newCategoryName.trim())) {
            console.log("Adding category:", settings.newCategoryName.trim());
            setSettings(current => ({
                ...current,
                featuredCategories: [...current.featuredCategories, current.newCategoryName.trim()],
                newCategoryName: ""
            }));
        }
    };

    const handleRemoveCategory = (category: string) => {
        console.log("Removing category:", category);
        setSettings(current => ({
            ...current,
            featuredCategories: current.featuredCategories.filter(c => c !== category)
        }));
    };

    if (loading) {
        return <div className="text-center py-4">Loading settings...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {/* Site Status */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Site Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-txt-primary">New Registrations</label>
                                <p className="text-sm text-txt-secondary">Allow new users to register</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allowNewRegistrations}
                                    onChange={(e) => setSettings(current => ({
                                        ...current,
                                        allowNewRegistrations: e.target.checked
                                    }))}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Upload Settings */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Upload Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium text-txt-primary mb-1">
                                Max Upload Size (MB)
                            </label>
                            <input
                                type="number"
                                value={settings.maxUploadSizeMB}
                                onChange={(e) => setSettings(current => ({
                                    ...current,
                                    maxUploadSizeMB: Number(e.target.value)
                                }))}
                                className="w-full px-4 py-2 rounded-lg bg-bg-surface text-txt-primary"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-txt-primary mb-1">
                                Default User Quota (MB)
                            </label>
                            <input
                                type="number"
                                value={settings.defaultUserQuotaMB}
                                onChange={(e) => setSettings(current => ({
                                    ...current,
                                    defaultUserQuotaMB: Number(e.target.value)
                                }))}
                                className="w-full px-4 py-2 rounded-lg bg-bg-surface text-txt-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Featured Categories */}
                <div className="bg-bg-secondary rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Featured Categories</h3>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={settings.newCategoryName}
                                onChange={(e) => setSettings(current => ({
                                    ...current,
                                    newCategoryName: e.target.value
                                }))}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddCategory();
                                    }
                                }}
                                placeholder="Enter category name"
                                className="flex-1 px-4 py-2 rounded-lg bg-bg-surface text-txt-primary"
                            />
                            <button
                                onClick={handleAddCategory}
                                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {settings.featuredCategories.map((category) => (
                                <div
                                    key={category}
                                    className="flex items-center gap-2 px-3 py-1 bg-bg-surface rounded-full"
                                >
                                    <span className="text-txt-primary">{category}</span>
                                    <button
                                        onClick={() => handleRemoveCategory(category)}
                                        className="text-txt-secondary hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
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
                    <p className={`text-sm ${
                        saveStatus.type === "success" ? "text-green-500" : "text-red-500"
                    }`}>
                        {saveStatus.message}
                    </p>
                )}
            </div>
        </div>
    );
}; 