import { useState } from "react";
import { mockEvents } from "../mock/mockEvents";
import { EventCreateForm } from "../components/EventCreateForm";
import { EventCard } from "../components/EventCard";
import type { Event, EventType } from "@/features/events/types/event";

const typeLabels: Record<EventType | "all", string> = {
    all: "All",
    competition: "Competitions",
    meetup: "Meetups",
    webinar: "Webinars",
};

export const EventsHome = () => {
    const [type, setType] = useState<EventType | "all">("all");
    const [showCreate, setShowCreate] = useState(false);
    const [events, setEvents] = useState<Event[]>(mockEvents);

    const filtered = type === "all" ? events : events.filter((e) => e.type === type);

    const handleCreate = (newEvent: Omit<Event, "id">) => {
        setEvents([...events, { ...newEvent, id: `event${events.length + 1}` }]);
        setShowCreate(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* title */}
            <h1 className="text-txt-primary text-2xl sm:text-xl lg:text-4xl font-bold mb-8 text-center">
                Events & Competitions
            </h1>

            {/* filter chips – responsive grid for all devices */}
            <div className="mb-8 w-full max-w-md mx-auto">
                {/* Tabs row */}
                <div className="flex flex-row gap-2">
                    {Object.entries(typeLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setType(key as EventType | "all")}
                            className={`flex-1 px-4 py-2 rounded font-semibold transition text-center
                    ${
                        type === key
                            ? "bg-accent text-txt-highlight"
                            : "bg-bg-surface text-txt-primary hover:bg-bg-tertiary"
                    }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {/* Create Event button below, same width as a tab */}
                <div className="flex mt-2">
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex-1 btn-base btn-action-success text-center"
                    >
                        + Create Event
                    </button>
                </div>
            </div>

            {/* Create Event Form Modal/Inline */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-reverse bg-opacity-40">
                    <div className="bg-bg-primary rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                        <button
                            onClick={() => setShowCreate(false)}
                            className="absolute top-2 right-2 text-txt-muted hover:text-txt-primary text-2xl font-bold"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <EventCreateForm onCreate={handleCreate} />
                    </div>
                </div>
            )}

            {/* cards */}
            <div className="w-full grid gap-6 sm:gap-8 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                {filtered.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};
