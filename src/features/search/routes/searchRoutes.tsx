import type { RouteObject } from "react-router-dom";

import { ROUTES } from "@/constants/routeConstants";

import { SearchPage } from "../pages/SearchPage";
import { ArtistsSearchPage } from "../pages/ArtistsSearchPage";

export const searchRoutes: RouteObject[] = [
  {
    path: ROUTES.SEARCH,
    element: <SearchPage />,
  },
  {
    path: ROUTES.SEARCH_ARTISTS,
    element: <ArtistsSearchPage />,
  },
];
