import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { mockEvents } from "../mock/mockEvents";
import { EventEntryCard } from "../components/EventEntryCard";
import { EventEntryForm } from "../components/EventEntryForm";
import type { Event, EventEntry } from "@/types/event";

export const EventDetailsPage = () => {
    const { eventId } = useParams();
    const [events, setEvents] = useState<Event[]>(mockEvents);
    const event = events.find((e) => e.id === eventId);

    if (!event) {
        return (
            <div className="max-w-2xl mx-auto py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
                <Link to="/events" className="text-[var(--accent)] hover:underline">
                    Back to Events
                </Link>
            </div>
        );
    }

    const handleEntry = (entry: Omit<EventEntry, "id">) => {
        setEvents((prevEvents) =>
            prevEvents.map((e) =>
                e.id === event.id
                    ? {
                          ...e,
                          entries: [
                              ...(e.entries || []),
                              { ...entry, id: `entry${(e.entries?.length || 0) + 1}` },
                          ],
                      }
                    : e
            )
        );
    };

    // Find the updated event after state change
    const currentEvent = events.find((e) => e.id === eventId) || event;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <div className="mb-6 rounded-lg overflow-hidden shadow">
                <div className="relative w-full aspect-[16/7] bg-gray-200">
                    <img
                        src={currentEvent.bannerUrl}
                        alt={currentEvent.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-[var(--txt-primary)] text-center break-words">
                {currentEvent.title}
            </h1>
            <div className="mb-2 text-sm sm:text-base text-[var(--txt-secondary)] text-center">
                {currentEvent.startDate} - {currentEvent.endDate}
            </div>
            <div className="mb-4 text-xs sm:text-sm text-[var(--txt-muted)] text-center">
                Status: <span className="font-semibold">{currentEvent.status}</span>
            </div>
            <div className="mb-4 text-base sm:text-lg text-[var(--txt-primary)] text-center">
                {currentEvent.description}
            </div>
            {currentEvent.type === "competition" && currentEvent.prizes && (
                <div className="mb-4">
                    <h2 className="font-semibold mb-1 text-sm sm:text-base">Prizes</h2>
                    <div className="text-[var(--txt-highlight)] text-xs sm:text-sm">
                        {currentEvent.prizes}
                    </div>
                </div>
            )}
            {currentEvent.rules && (
                <div className="mb-4">
                    <h2 className="font-semibold mb-1 text-sm sm:text-base">Rules</h2>
                    <div className="text-[var(--txt-secondary)] whitespace-pre-line text-xs sm:text-sm">
                        {currentEvent.rules}
                    </div>
                </div>
            )}
            {currentEvent.type === "competition" && currentEvent.status === "ongoing" && (
                <div className="mb-8 text-center">
                    <EventEntryForm onSubmit={handleEntry} />
                </div>
            )}
            {(currentEvent.type === "meetup" || currentEvent.type === "webinar") &&
                currentEvent.status === "upcoming" && (
                    <div className="mb-8 text-center">
                        <button className="inline-block px-6 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)] transition-colors">
                            RSVP
                        </button>
                    </div>
                )}
            {currentEvent.type === "competition" && (
                <div className="mb-4">
                    <h2 className="font-semibold mb-3 text-center text-base sm:text-lg">
                        Entries Gallery
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {(currentEvent.entries || []).map((entry) => (
                            <EventEntryCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                </div>
            )}
            <div className="mt-8 text-center">
                <Link to="/events" className="text-[var(--accent)] hover:underline">
                    &larr; Back to Events
                </Link>
            </div>
        </div>
    );
};
