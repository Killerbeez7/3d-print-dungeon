import type { Event } from "@/features/events/types/event";
import { Link } from "react-router-dom";

export const EventCard = ({ event }: { event: Event }) => {
    // Dynamic button text based on event type and status
    const getButtonText = () => {
        if (event.type === "competition") {
            return event.status === "ongoing" ? "Join Competition" : "View Competition";
        }
        if (event.type === "meetup") {
            return event.status === "upcoming" ? "RSVP Now" : "View Details";
        }
        if (event.type === "webinar") {
            return event.status === "upcoming" ? "Register" : "View Recording";
        }
        return "View Details";
    };

    // Dynamic button styling based on event type and status
    const getButtonStyle = () => {
        // TODO: Add button styles for each event type and status
        // if (event.status === "upcoming") {
        //     return "btn-base btn-action-success"; // Green for upcoming events
        // }
        // if (event.status === "ongoing") {
        //     return "btn-base btn-action-urgent"; // Red for ongoing events
        // }
        // if (event.status === "ended") {
        //     return "btn-base btn-view-primary"; // Gray for ended events
        // }
        // return "btn-base btn-action-primary"; // Default teal

        // All buttons are now gray
        return "btn-base btn-view-primary";
    };

    return (
        <div className="bg-bg-secondary rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col h-full">
            <img
                src={event.bannerUrl}
                alt={event.title}
                className="h-40 w-full object-cover"
            />
            <div className="p-4 flex flex-col flex-1">
                {/* Title - fixed height */}
                <h3 className="text-lg font-bold text-txt-primary mb-2 line-clamp-2 min-h-[3.5rem]">
                    {event.title}
                </h3>

                {/* Date */}
                <div className="text-sm text-txt-secondary mb-2">
                    {event.startDate} – {event.endDate}
                </div>

                {/* Status badge */}
                <div className="mb-3">
                    <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            event.status === "ongoing"
                                ? "bg-success/10 text-success"
                                : event.status === "upcoming"
                                ? "bg-contrast/10 text-contrast"
                                : "bg-txt-muted/10 text-txt-muted"
                        }`}
                    >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                </div>

                {/* Additional info - fixed height container */}
                <div className="min-h-[2.5rem] mb-4">
                    {event.type === "competition" && event.prizes && (
                        <div className="text-xs text-txt-highlight">
                            Prizes: {event.prizes}
                        </div>
                    )}
                    {event.type !== "competition" && event.location && (
                        <div className="text-xs text-txt-secondary">
                            Location: {event.location}
                        </div>
                    )}
                </div>

                {/* Button - pushed to bottom */}
                <div className="mt-auto">
                    <Link
                        to={`/events/${event.id}`}
                        className={`block w-full text-center px-4 py-2 rounded font-semibold transition-colors ${getButtonStyle()}`}
                        aria-label={`${getButtonText()} for ${event.title}`}
                    >
                        {getButtonText()}
                    </Link>
                </div>
            </div>
        </div>
    );
};
