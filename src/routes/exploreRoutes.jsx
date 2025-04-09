import { Explore } from "../components/explore/Explore";
import { ArtistsList } from "../components/artists/ArtistsList";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";

export const exploreRoutes = {
    path: "/explore",
    element: <Explore />,
    children: [
        {
            path: "",
            element: <Explore />,
        },
        {
            path: "artists",
            element: <ArtistsList />,
        },
        {
            path: "artists/:id",
            element: <ArtistProfile />,
        },
        {
            path: "forum",
            element: <Explore />,
        },
    ],
}; 