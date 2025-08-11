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

// Shorter labels for mobile devices
const mobileTypeLabels: Record<EventType | "all", string> = {
    all: "All",
    competition: "Comps",
    meetup: "Meets",
    webinar: "Web",
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
            <h1 className="text-txt-primary font-bold mb-4 sm:mb-6 text-center">
                Events & Competitions
            </h1>

            {/* filter chips – responsive grid for all devices */}
            <div className="mb-8 w-full max-w-md mx-auto">
                {/* Tabs row */}
                <div className="flex flex-row gap-1 sm:gap-2">
                    {Object.entries(typeLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setType(key as EventType | "all")}
                            className={`flex-1 px-2 sm:px-4 py-2 rounded font-semibold transition text-center text-sm sm:text-base
                    ${
                        type === key
                            ? "bg-accent text-txt-highlight"
                            : "bg-bg-surface text-txt-primary hover:bg-bg-tertiary"
                    }`}
                        >
                            <span className="hidden sm:inline">{label}</span>
                            <span className="sm:hidden">{mobileTypeLabels[key as EventType | "all"]}</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop with blur effect */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
                    
                    {/* Modal content */}
                    <div className="relative bg-bg-secondary border border-br-secondary rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 transform transition-all duration-300 ease-out">
                        {/* Close button */}
                        <button
                            onClick={() => setShowCreate(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-bg-tertiary text-txt-muted hover:text-txt-primary transition-colors duration-200"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
