import { EventsHome } from "../components/community/events/EventsHome";
import { Blog } from "../components/community/blog/Blog";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const communityRoutes: RouteObject[] = [
    { path: ROUTES.EVENTS, element: withMaintenance(<EventsHome />) },
    { path: ROUTES.BLOG, element: withMaintenance(<Blog />) },
];
