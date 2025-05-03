import { useParams, Link } from "react-router-dom";
import { mockEvents } from "../events/mockEvents";
import { CompetitionEntryCard } from "../competitions/CompetitionEntryCard";

const mockEntries = [
  {
    id: "entry1",
    userName: "Alice",
    imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    description: "My spring flower vase!",
  },
  {
    id: "entry2",
    userName: "Bob",
    imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    description: "A bunny planter for the garden.",
  },
  {
    id: "entry3",
    userName: "Charlie",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    description: "Spring-themed phone stand.",
  },
];

export const EventDetails = () => {
  const { eventId } = useParams();
  const event = mockEvents.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <Link to="/events" className="text-[var(--accent)] hover:underline">Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <img src={event.bannerUrl} alt={event.title} className="w-full h-56 object-cover rounded-lg shadow" />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-[var(--txt-primary)]">{event.title}</h1>
      <div className="mb-2 text-[var(--txt-secondary)]">{event.startDate} - {event.endDate}</div>
      <div className="mb-4 text-[var(--txt-muted)]">Status: <span className="font-semibold">{event.status}</span></div>
      <div className="mb-4 text-lg text-[var(--txt-primary)]">{event.description}</div>
      {event.type === "competition" && event.prizes && (
        <div className="mb-4">
          <h2 className="font-semibold mb-1">Prizes</h2>
          <div className="text-[var(--txt-highlight)]">{event.prizes}</div>
        </div>
      )}
      {event.rules && (
        <div className="mb-4">
          <h2 className="font-semibold mb-1">Rules</h2>
          <div className="text-[var(--txt-secondary)] whitespace-pre-line">{event.rules}</div>
        </div>
      )}
      {event.type === "competition" && event.status === "ongoing" && (
        <div className="mb-8">
          <Link
            to={`/events/${event.id}/enter`}
            className="inline-block px-6 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)]"
          >
            Enter Now
          </Link>
        </div>
      )}
      {(event.type === "meetup" || event.type === "webinar") && event.status === "upcoming" && (
        <div className="mb-8">
          <button
            className="inline-block px-6 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)]"
          >
            RSVP
          </button>
        </div>
      )}
      {event.type === "competition" && (
        <div className="mb-4">
          <h2 className="font-semibold mb-3">Entries Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mockEntries.map((entry) => (
              <CompetitionEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-8">
        <Link to="/events" className="text-[var(--accent)] hover:underline">&larr; Back to Events</Link>
      </div>
    </div>
  );
}; 