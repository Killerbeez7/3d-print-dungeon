import {
    Timestamp,
    collection,
    getAggregateFromServer,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
    query,
    sum,
    where,
} from "firebase/firestore";

import { db } from "@/config/firebaseConfig";
import type { ModelData } from "@/features/models/types/model";

/** Firestore timestamps, dates, strings or numbers as a Date (or null). */
export const toDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === "object" && value !== null && "seconds" in value) {
        return new Date(Number((value as { seconds: number }).seconds) * 1000);
    }
    return null;
};

export interface AdminSale {
    id: string;
    modelId?: string;
    modelName?: string;
    amount: number;
    currency: string;
    purchasedAt: Date | null;
}

export interface AdminOverviewData {
    listings: number;
    listingsLast30: number;
    /** Null when the count couldn't be read. */
    users: number | null;
    views: number;
    likes: number;
    paidListings: number;
    withPreview: number;
    publicOriginals: number;
    pendingReports: number;
    sales: AdminSale[];
    /** Uploads per day for the last 30 days, oldest first. */
    uploadsByDay: { date: Date; count: number }[];
    topModels: ModelData[];
    recentModels: ModelData[];
    loadedAt: Date;
}

const DAYS = 30;

/**
 * Everything the overview shows, with counts and sums worked out by
 * Firestore instead of downloading every document.
 */
export async function fetchAdminOverview(): Promise<AdminOverviewData> {
    const models = collection(db, "models");
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (DAYS - 1));

    const [
        listings,
        views,
        likes,
        users,
        paidListings,
        withPreview,
        publicOriginals,
        pendingReports,
        recentSnap,
        topSnap,
        lastMonthSnap,
        salesSnap,
    ] = await Promise.all([
        // One sum per query: several in one query need a composite index.
        getCountFromServer(models),
        getAggregateFromServer(models, { total: sum("views") }),
        getAggregateFromServer(models, { total: sum("likes") }),
        getCountFromServer(collection(db, "users")).catch(() => null),
        getCountFromServer(query(models, where("isPaid", "==", true))),
        getCountFromServer(query(models, where("previewVersion", ">=", 1))),
        getCountFromServer(query(models, where("originalFileUrl", ">", ""))),
        getCountFromServer(query(collection(db, "reports"), where("status", "==", "pending"))).catch(
            () => null
        ),
        getDocs(query(models, orderBy("createdAt", "desc"), limit(6))),
        getDocs(query(models, orderBy("views", "desc"), limit(6))),
        getDocs(query(models, where("createdAt", ">=", Timestamp.fromDate(since)))),
        getDocs(query(collection(db, "purchases"), orderBy("purchasedAt", "desc"), limit(200))).catch(
            () => null
        ),
    ]);

    const toModel = (doc: { id: string; data: () => object }) => ({ id: doc.id, ...doc.data() }) as ModelData;

    const uploadsByDay = Array.from({ length: DAYS }, (_, index) => {
        const date = new Date(since);
        date.setDate(since.getDate() + index);
        return { date, count: 0 };
    });
    for (const doc of lastMonthSnap.docs) {
        const created = toDate(doc.get("createdAt"));
        if (!created) continue;
        const day = Math.floor((created.getTime() - since.getTime()) / 86_400_000);
        if (day >= 0 && day < DAYS) uploadsByDay[day].count += 1;
    }

    const sales: AdminSale[] = (salesSnap?.docs ?? []).map((doc) => ({
        id: doc.id,
        modelId: doc.get("modelId"),
        modelName: doc.get("modelName") ?? doc.get("modelTitle"),
        amount: Number(doc.get("amount")) || 0,
        currency: String(doc.get("currency") ?? "usd"),
        purchasedAt: toDate(doc.get("purchasedAt")),
    }));

    return {
        listings: listings.data().count,
        listingsLast30: lastMonthSnap.size,
        users: users?.data().count ?? null,
        views: views.data().total ?? 0,
        likes: likes.data().total ?? 0,
        paidListings: paidListings.data().count,
        withPreview: withPreview.data().count,
        publicOriginals: publicOriginals.data().count,
        pendingReports: pendingReports?.data().count ?? 0,
        sales,
        uploadsByDay,
        topModels: topSnap.docs.map(toModel),
        recentModels: recentSnap.docs.map(toModel),
        loadedAt: new Date(),
    };
}

/** All listings for the admin table, newest first. */
export async function fetchAdminModels(max = 1000): Promise<ModelData[]> {
    const snap = await getDocs(query(collection(db, "models"), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ModelData);
}

/** Revenue per currency (amounts are in major units, e.g. euros). */
export const revenueByCurrency = (sales: AdminSale[]): { currency: string; total: number }[] => {
    const totals = new Map<string, number>();
    for (const sale of sales) totals.set(sale.currency, (totals.get(sale.currency) ?? 0) + sale.amount);
    return [...totals].map(([currency, total]) => ({ currency, total })).sort((a, b) => b.total - a.total);
};
