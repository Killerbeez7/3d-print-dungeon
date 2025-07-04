import { ArtistsList } from "../components/artists/ArtistsList";
import { Collections } from "../components/collections/Collections";
import { withMaintenance } from "../helpers/routeHelpers";
import { ROUTES } from "../constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const exploreRoutes: RouteObject[] = [
    { path: ROUTES.ARTISTS, element: withMaintenance(<ArtistsList />) },
    { path: ROUTES.COLLECTIONS, element: withMaintenance(<Collections />) },
];
