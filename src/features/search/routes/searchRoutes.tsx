import { SearchPage } from "../pages/SearchPage";
import { ArtistsSearchPage } from "../pages/ArtistsSearchPage";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { SearchProvider } from "../providers/searchProvider";

export const searchRoutes: RouteObject[] = [
  {
    path: ROUTES.SEARCH,
    element: (
      <SearchProvider>
        <SearchPage />
      </SearchProvider>
    ),
  },
  {
    path: ROUTES.SEARCH_ARTISTS,
    element: <ArtistsSearchPage />,
  },
];
