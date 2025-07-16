export type EventType = "competition" | "meetup" | "webinar";

export interface EventEntry {
    id: string;
    userName: string;
    imageUrl: string;
    description: string;
}

export interface Event {
    id: string;
    type: EventType;
    title: string;
    description: string;
    bannerUrl: string;
    startDate: string;
    endDate: string;
    status: "ongoing" | "upcoming" | "ended";
    prizes?: string;
    rules?: string;
    location?: string;
    entries?: EventEntry[];
}