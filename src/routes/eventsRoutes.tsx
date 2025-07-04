import { EventsHome } from "@/components/community/events/EventsHome";
import { EventDetails } from "@/components/community/events/EventDetails";
import { EventEntryForm } from "@/components/community/events/EventEntryForm";
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
