import { useParams, Link } from "react-router-dom";
import { mockEvents } from "./mockEvents";
import { EventEntryCard } from "./EventEntryCard";

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
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 rounded-lg overflow-hidden shadow">
        <div className="relative w-full aspect-[16/7] bg-gray-200">
          <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-[var(--txt-primary)] text-center break-words">{event.title}</h1>
      <div className="mb-2 text-sm sm:text-base text-[var(--txt-secondary)] text-center">{event.startDate} - {event.endDate}</div>
      <div className="mb-4 text-xs sm:text-sm text-[var(--txt-muted)] text-center">Status: <span className="font-semibold">{event.status}</span></div>
      <div className="mb-4 text-base sm:text-lg text-[var(--txt-primary)] text-center">{event.description}</div>
      {event.type === "competition" && event.prizes && (
        <div className="mb-4">
          <h2 className="font-semibold mb-1 text-sm sm:text-base">Prizes</h2>
          <div className="text-[var(--txt-highlight)] text-xs sm:text-sm">{event.prizes}</div>
        </div>
      )}
      {event.rules && (
        <div className="mb-4">
          <h2 className="font-semibold mb-1 text-sm sm:text-base">Rules</h2>
          <div className="text-[var(--txt-secondary)] whitespace-pre-line text-xs sm:text-sm">{event.rules}</div>
        </div>
      )}
      {event.type === "competition" && event.status === "ongoing" && (
        <div className="mb-8 text-center">
          <Link
            to={`/events/${event.id}/enter`}
            className="inline-block px-6 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          >
            Enter Now
          </Link>
        </div>
      )}
      {(event.type === "meetup" || event.type === "webinar") && event.status === "upcoming" && (
        <div className="mb-8 text-center">
          <button
            className="inline-block px-6 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          >
            RSVP
          </button>
        </div>
      )}
      {event.type === "competition" && (
        <div className="mb-4">
          <h2 className="font-semibold mb-3 text-center text-base sm:text-lg">Entries Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {mockEntries.map((entry) => (
              <EventEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-8 text-center">
        <Link to="/events" className="text-[var(--accent)] hover:underline">&larr; Back to Events</Link>
      </div>
    </div>
  );
}; 