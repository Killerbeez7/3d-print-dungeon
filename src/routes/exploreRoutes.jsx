import { Explore } from "../components/explore/Explore";
import { ArtistsList } from "../components/artists/ArtistsList";
import { ArtistProfile } from "../components/artists/artist-profile/ArtistProfile";
import { MaintenanceRoute } from "../routes/MaintenanceRoute";

export const exploreRoutes = {
    path: "/explore",
    element: (
        <MaintenanceRoute>
            <Explore />
        </MaintenanceRoute>
    ),
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
