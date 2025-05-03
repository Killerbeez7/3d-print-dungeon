import { EventsHome } from "../components/events/EventsHome";
import { Blog } from "../components/blog/Blog";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../config/routeConstants";

export const communityRoutes = [
    { path: ROUTES.EVENTS, element: withMaintenance(<EventsHome />) },
    { path: ROUTES.BLOG, element: withMaintenance(<Blog />) },
];
