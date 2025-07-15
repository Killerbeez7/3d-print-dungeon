import { EventsHome } from "../pages/EventsHome";
import { EventDetailsPage } from "../pages/EventDetailsPage";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const eventsRoutes: RouteObject[] = [
    { path: ROUTES.EVENTS, element: withMaintenance(<EventsHome />) },
    { path: ROUTES.EVENTS_DETAILS, element: withMaintenance(<EventDetailsPage />) },
];
