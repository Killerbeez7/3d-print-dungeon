import { Settings } from "../hooks/useSettings";

export const getSettings = async (): Promise<Settings> => {
    const settings = await getSettingsFromDatabase();
    return settings;
};


const getSettingsFromDatabase = async (): Promise<Settings> => {
    const settings = await getSettingsFromDatabase();
    return settings;
};

