import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

const EventsHome = lazy(() =>
    import("../pages/EventsHome").then((m) => ({ default: m.EventsHome }))
);
const EventDetailsPage = lazy(() =>
    import("../pages/EventDetailsPage").then((m) => ({ default: m.EventDetailsPage }))
);

export const eventsRoutes: RouteObject[] = [
    {
        path: ROUTES.EVENTS,
        element: withMaintenance(
            <Suspense>
                <EventsHome />
            </Suspense>
        ),
    },
    {
        path: ROUTES.EVENTS_DETAILS,
        element: withMaintenance(
            <Suspense>
                <EventDetailsPage />
            </Suspense>
        ),
    },
];
