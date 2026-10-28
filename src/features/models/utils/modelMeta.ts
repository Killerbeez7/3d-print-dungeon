import { Timestamp } from "firebase/firestore";

import type { ModelData } from "@/features/models/types/model";

/** Converts the date shapes stored on models (Timestamp, Date, string, ms) to a Date. */
export function toDate(value: ModelData["createdAt"]): Date | null {
    if (!value) return null;
    if (value instanceof Timestamp) return value.toDate();
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/** Upper-case file extension of the uploaded file, e.g. "STL". */
export function getFileFormat(fileUrl?: string): string | null {
    if (!fileUrl) return null;
    try {
        const path = decodeURIComponent(new URL(fileUrl).pathname);
        const match = path.match(/\.([a-z0-9]{2,5})$/i);
        return match ? match[1].toUpperCase() : null;
    } catch {
        return null;
    }
}

export function formatPrice(price: number, currency = "usd"): string {
    try {
        return new Intl.NumberFormat("en", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(price);
    } catch {
        return `${price}`;
    }
}
