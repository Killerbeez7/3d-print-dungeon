import { lazy, Suspense } from "react";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { PageLoader } from "@/features/shared/components/Die";

const EventsHome = lazy(() =>
  import("../pages/EventsHome").then((m) => ({ default: m.EventsHome }))
);

export const eventsRoutes: RouteObject[] = [
  {
    path: ROUTES.EVENTS,
    element: (
      <Suspense fallback={<PageLoader />}>
        <EventsHome />
      </Suspense>
    ),
  },
  {
    path: ROUTES.EVENTS_DETAILS,
    element: (
      <Suspense fallback={<PageLoader />}>
        <EventsHome />
      </Suspense>
    ),
  },
];
