const FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** "6 Nov 2026"; posts saved a moment ago have no server time yet. */
export const formatDevlogDate = (date: Date | null): string => (date ? FORMAT.format(date) : "Just now");
