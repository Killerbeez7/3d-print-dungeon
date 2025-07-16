import type { Event } from "@/features/events/types/event";
import { Link } from "react-router-dom";

export const EventCard = ({ event }: { event: Event }) => (
    <Link
        to={`/events/${event.id}`}
        className="bg-white dark:bg-[var(--bg-surface)] rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden block focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        aria-label={`View details for ${event.title}`}
    >
        <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-40 w-full object-cover"
        />
        <div className="p-4">
            <h3 className="text-xl font-bold mb-2 text-[var(--txt-primary)]">
                {event.title}
            </h3>
            <div className="text-sm text-gray-500 mb-1">
                {event.startDate} – {event.endDate}
            </div>
            <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    event.status === "ongoing"
                        ? "bg-green-100 text-green-700"
                        : event.status === "upcoming"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-600"
                }`}
            >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            {event.type === "competition" && event.prizes && (
                <div className="mt-2 text-xs text-[var(--txt-highlight)]">
                    Prizes: {event.prizes}
                </div>
            )}
            {event.type !== "competition" && event.location && (
                <div className="mt-2 text-xs text-[var(--txt-secondary)]">
                    Location: {event.location}
                </div>
            )}
        </div>
    </Link>
);
