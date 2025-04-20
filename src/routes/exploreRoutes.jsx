import { Home } from "../components/home/Home";
import { ArtistsList } from "../components/artists/ArtistsList";
import { Collections } from "../components/collections/Collections";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../config/routeConstants";

export const exploreRoutes = [
    { path: ROUTES.ARTISTS, element: withMaintenance(<ArtistsList />) },
    { path: ROUTES.COLLECTIONS, element: withMaintenance(<Collections />) },
];
