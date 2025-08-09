import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { mockEvents } from "../mock/mockEvents";
import { EventEntryCard } from "../components/EventEntryCard";
import { EventEntryForm } from "../components/EventEntryForm";
import type { Event, EventEntry } from "@/features/events/types/event";

export const EventDetailsPage = () => {
    const { eventId } = useParams();
    const [events, setEvents] = useState<Event[]>(mockEvents);
    const event = events.find((e) => e.id === eventId);

    if (!event) {
        return (
            <div className="max-w-2xl mx-auto py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
                <Link to="/events" className="text-accent hover:underline">
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
                <div className="relative w-full aspect-[16/7] bg-bg-surface">
                    <img
                        src={currentEvent.bannerUrl}
                        alt={currentEvent.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-txt-primary text-center break-words">
                {currentEvent.title}
            </h1>
            <div className="mb-2 text-sm sm:text-base text-txt-secondary text-center">
                {currentEvent.startDate} - {currentEvent.endDate}
            </div>
            <div className="mb-4 text-xs sm:text-sm text-txt-muted text-center">
                Status: <span className="font-semibold">{currentEvent.status}</span>
            </div>
            <div className="mb-4 text-base sm:text-lg text-txt-primary text-center">
                {currentEvent.description}
            </div>
            {/* Competition-specific sections */}
            {currentEvent.type === "competition" && (
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {currentEvent.prizes && (
                        <div className="bg-bg-surface rounded-lg p-4 border border-br-secondary">
                            <h2 className="font-semibold mb-2 text-lg text-txt-primary flex items-center">
                                🏆 Prizes
                            </h2>
                            <div className="text-txt-highlight text-sm font-medium bg-accent/10 p-3 rounded">
                                {currentEvent.prizes}
                            </div>
                        </div>
                    )}
                    {currentEvent.rules && (
                        <div className="bg-bg-surface rounded-lg p-4 border border-br-secondary">
                            <h2 className="font-semibold mb-2 text-lg text-txt-primary flex items-center">
                                📋 Rules
                            </h2>
                            <div className="text-txt-secondary whitespace-pre-line text-sm">
                                {currentEvent.rules}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Non-competition rules */}
            {currentEvent.type !== "competition" && currentEvent.rules && (
                <div className="mb-6 bg-bg-surface rounded-lg p-4 border border-br-secondary">
                    <h2 className="font-semibold mb-2 text-lg text-txt-primary">Event Details</h2>
                    <div className="text-txt-secondary whitespace-pre-line text-sm">
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
                        <button className="cta-button px-6 py-2 rounded font-semibold transition-colors">
                            RSVP
                        </button>
                    </div>
                )}
            {currentEvent.type === "competition" && (
                <div className="mb-6">
                    <div className="bg-bg-surface rounded-lg p-6 border border-br-secondary">
                        <h2 className="font-bold mb-4 text-center text-xl text-txt-primary flex items-center justify-center gap-2">
                            🎨 Competition Entries
                            <span className="text-sm font-normal text-txt-muted">
                                ({(currentEvent.entries || []).length} submissions)
                            </span>
                        </h2>
                        {(currentEvent.entries || []).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(currentEvent.entries || []).map((entry) => (
                                    <EventEntryCard key={entry.id} entry={entry} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-txt-muted">
                                <div className="text-4xl mb-2">🎯</div>
                                <p>No entries yet. Be the first to submit!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="mt-8 text-center">
                <Link to="/events" className="text-accent hover:underline">
                    &larr; Back to Events
                </Link>
            </div>
        </div>
    );
};
