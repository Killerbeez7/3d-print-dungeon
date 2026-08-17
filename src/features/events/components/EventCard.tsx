import type { Event } from "@/features/events/types/event";
import { Link } from "react-router-dom";

export function EventCard({ event }: { event: Event }) {
  const getButtonText = (): string => {
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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-section shadow transition hover:shadow-lg">
      <img src={event.bannerUrl} alt={event.title} className="h-40 w-full object-cover" />

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 min-h-[3.5rem] line-clamp-2 text-lg font-bold text-txt-primary">
          {event.title}
        </h3>

        <div className="mb-2 text-sm text-txt-secondary">
          {event.startDate} – {event.endDate}
        </div>

        <div className="mb-3">
          <span
            className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
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

        <div className="mb-4 min-h-[2.5rem]">
          {event.type === "competition" && event.prizes && (
            <div className="text-xs text-txt-highlight">Prizes: {event.prizes}</div>
          )}

          {event.type !== "competition" && event.location && (
            <div className="text-xs text-txt-secondary">Location: {event.location}</div>
          )}
        </div>

        <div className="mt-auto">
          <Link
            to={`/events/${event.id}`}
            className="block w-full rounded-lg bg-[linear-gradient(135deg,var(--btn-main)_0%,var(--btn-secondary)_100%)] px-4 py-2 text-center text-sm font-semibold text-txt-primary transition-all duration-200 hover:bg-[linear-gradient(135deg,var(--btn-secondary)_0%,var(--btn-hover)_100%)] hover:shadow-md"
            aria-label={`${getButtonText()} for ${event.title}`}
          >
            {getButtonText()}
          </Link>
        </div>
      </div>
    </div>
  );
}
