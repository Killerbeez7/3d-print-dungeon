import { Home } from "../components/home/Home";
import { Events } from "../components/community/Events";
import { Blog } from "../components/community/Blog";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../config/routeConstants";

export const communityRoutes = [
    { path: ROUTES.COMMUNITY_EVENTS, element: withMaintenance(<Events />) },
    { path: ROUTES.COMMUNITY_BLOG, element: withMaintenance(<Blog />) },
];
