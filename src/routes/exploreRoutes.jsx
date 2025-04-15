import { Explore } from "../components/explore/Explore";
import { ArtistsList } from "../components/artists/ArtistsList";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";
import { withMaintenance } from "../helpers/routeHelpers";

export const exploreRoutes = [
    {
        path: "/explore",
        element: withMaintenance(<Explore />),
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
        ],
    },
];
