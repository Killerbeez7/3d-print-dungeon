import { lazy, Suspense } from "react";
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
    element: (
      <Suspense>
        <EventsHome />
      </Suspense>
    ),
  },
  {
    path: ROUTES.EVENTS_DETAILS,
    element: (
      <Suspense>
        <EventDetailsPage />
      </Suspense>
    ),
  },
];
