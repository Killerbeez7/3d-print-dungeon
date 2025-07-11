import { useState } from "react";

export interface Settings {
    theme: string;
    language: string;
    notifications: boolean;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
}

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>({
        theme: "light",
        language: "en",
        notifications: true,
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
    });

    return { settings, setSettings };
};

