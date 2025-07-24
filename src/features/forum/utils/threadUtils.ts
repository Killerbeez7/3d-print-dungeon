import { formatDistanceToNow } from "date-fns";
import type { ForumThread } from "@/features/forum/types/forum";


export const isThreadNew = (thread: ForumThread): boolean => {
    if (!thread.createdAt) return false;

    const ts = thread.createdAt as { toDate?: () => Date } | Date;
    const createdAt = typeof ts === "object" && typeof (ts as { toDate?: () => Date }).toDate === "function"
        ? (ts as { toDate: () => Date }).toDate()
        : new Date(ts as string | number | Date);

    const now = new Date();

    // Handle future dates - treat them as new
    if (createdAt > now) {
        return true;
    }

    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
};


export const formatRelativeTime = (timestamp: unknown): string => {
    if (!timestamp) return "Unknown time";

    const ts = timestamp as { toDate?: () => Date } | Date;
    const date = typeof ts === "object" && typeof (ts as { toDate?: () => Date }).toDate === "function"
        ? (ts as { toDate: () => Date }).toDate()
        : new Date(ts as string | number | Date);

    return formatDistanceToNow(date, { addSuffix: true });
};

