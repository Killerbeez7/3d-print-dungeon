import { useState } from "react";
import { Link } from "react-router-dom";
import { mockEvents } from "../mock/mockEvents";
import { EventCreateForm } from "../components/EventCreateForm";
import type { Event, EventType } from "@/types/event";

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
            <h1 className="text-[var(--txt-primary)] text-2xl sm:text-xl lg:text-4xl font-bold mb-8 text-center">
                Events & Competitions
            </h1>

            {/* filter chips – responsive grid for all devices */}
            <div className="mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 justify-center w-full max-w-md mx-auto">
                    {Object.entries(typeLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setType(key as EventType | "all")}
                            className={`whitespace-nowrap px-4 py-2 rounded font-semibold transition
                ${
                    type === key
                        ? "bg-[var(--accent)] text-[var(--txt-highlight)]"
                        : "bg-[var(--bg-surface)] text-[var(--txt-primary)] hover:bg-[var(--bg-tertiary)]"
                }`}
                        >
                            {label}
                        </button>
                    ))}
                    {/* Show create button for admins only; for demo, always visible */}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="col-span-2 sm:col-span-4 mt-2 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded font-semibold"
                    >
                        + Create Event
                    </button>
                </div>
            </div>

            {/* Create Event Form Modal/Inline */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-[var(--bg-surface)] rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                        <button
                            onClick={() => setShowCreate(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
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
                    <article
                        key={event.id}
                        className="bg-[var(--bg-surface)] rounded-lg shadow hover:shadow-lg transition flex flex-col overflow-hidden"
                    >
                        {/* keep 16:9 aspect ratio; shrinks nicely on phones */}
                        <div className="relative w-full aspect-[16/9]">
                            <img
                                src={event.bannerUrl}
                                alt={event.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>

                        <div className="p-4 flex-1 flex flex-col gap-2">
                            <h2 className="text-lg sm:text-xl font-bold text-[var(--txt-primary)] line-clamp-2">
                                {event.title}
                            </h2>

                            <p className="text-sm text-[var(--txt-secondary)] line-clamp-3">
                                {event.description}
                            </p>

                            <p className="text-xs text-[var(--txt-muted)]">
                                {event.startDate} – {event.endDate}
                            </p>

                            {event.type === "competition" && event.prizes && (
                                <p className="text-xs text-[var(--txt-highlight)]">
                                    Prizes: {event.prizes}
                                </p>
                            )}
                            {event.type !== "competition" && event.location && (
                                <p className="text-xs text-[var(--txt-highlight)]">
                                    Location: {event.location}
                                </p>
                            )}

                            <Link
                                to={`/events/${event.id}`}
                                className="mt-auto inline-block text-center px-4 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                            >
                                View&nbsp;Details
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};
