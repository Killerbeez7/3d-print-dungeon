import { useState } from "react";
import { Link } from "react-router-dom";
import { mockEvents } from "./mockEvents";

const typeLabels = {
  all: "All",
  competition: "Competitions",
  meetup: "Meetups",
  webinar: "Webinars",
};

export const EventsHome = () => {
  const [type, setType] = useState("all");
  const filtered = type === "all" ? mockEvents : mockEvents.filter(e => e.type === type);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Events & Competitions</h1>
      <div className="flex gap-4 justify-center mb-8">
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`px-4 py-2 rounded font-semibold transition ${type === key ? "bg-[var(--accent)] text-[var(--txt-highlight)]" : "bg-[var(--bg-surface)] text-[var(--txt-primary)] hover:bg-[var(--bg-tertiary)]"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((event) => (
          <div key={event.id} className="bg-[var(--bg-surface)] rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
            <img src={event.bannerUrl} alt={event.title} className="h-40 w-full object-cover" />
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-bold text-xl mb-2 text-[var(--txt-primary)]">{event.title}</h2>
              <div className="mb-2 text-sm text-[var(--txt-secondary)] line-clamp-2">{event.description}</div>
              <div className="mb-2 text-xs text-[var(--txt-muted)]">{event.startDate} - {event.endDate}</div>
              {event.type === "competition" && event.prizes && (
                <div className="text-xs text-[var(--txt-highlight)] mb-2">Prizes: {event.prizes}</div>
              )}
              {event.type === "meetup" && event.location && (
                <div className="text-xs text-[var(--txt-highlight)] mb-2">Location: {event.location}</div>
              )}
              {event.type === "webinar" && event.location && (
                <div className="text-xs text-[var(--txt-highlight)] mb-2">Location: {event.location}</div>
              )}
              <Link
                to={`/events/${event.id}`}
                className="mt-auto inline-block px-4 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)] text-center"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 