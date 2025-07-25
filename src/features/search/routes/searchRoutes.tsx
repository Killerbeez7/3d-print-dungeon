import { SearchPage } from "../pages/SearchPage";
import { ArtistsSearchPage } from "../pages/ArtistsSearchPage";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";

export const searchRoutes: RouteObject[] = [
    {
        path: ROUTES.SEARCH,
        element: withMaintenance(<SearchPage />),
    },
    {
        path: ROUTES.SEARCH_ARTISTS,
        element: withMaintenance(<ArtistsSearchPage />),
    },
];
