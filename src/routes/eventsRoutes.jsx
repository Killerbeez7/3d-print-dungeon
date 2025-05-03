import { EventsHome } from "@/components/events/EventsHome";
import { EventDetails } from "@/components/events/EventDetails";

// Placeholder for EventEntryForm
const EventEntryForm = () => (
  <div className="max-w-xl mx-auto py-8 text-center">
    <h2 className="text-2xl font-bold mb-4">Event Entry Form</h2>
    <p className="text-[var(--txt-secondary)]">(Form coming soon...)</p>
  </div>
);

export const eventsRoutes = [
  {
    path: "/events",
    children: [
      { index: true, element: <EventsHome /> },
      { path: ":eventId", element: <EventDetails /> },
      { path: ":eventId/enter", element: <EventEntryForm /> },
      // Optionally: { path: "my-entries", element: <MyEventEntries /> },
    ],
  },
]; 