import { EventsHome } from "@/features/events/pages/EventsHome";
import { EventDetails } from "@/features/events/components/EventDetails";
import { EventEntryForm } from "@/features/events/components/EventEntryForm";
import { withMaintenance } from "@/helpers/routeHelpers";
import type { RouteObject } from "react-router-dom";

export const eventsRoutes: RouteObject[] = [
    {
        path: "/events",
        children: [
            { index: true, element: withMaintenance(<EventsHome />) },
            { path: ":eventId", element: withMaintenance(<EventDetails />) },
            { path: ":eventId/enter", element: withMaintenance(<EventEntryForm />) },
            // Optionally: { path: "my-entries", element: <MyEventEntries /> },
        ],
    },
];
