import { lazy, Suspense } from "react";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";
import { UserProfilePage } from "../profile/pages/UserProfilePage";

const MyProfileRedirect = lazy(() =>
    import("../profile/pages/MyProfileRedirect").then((m) => ({
        default: m.MyProfileRedirect,
    }))
);

export const userRoutes: RouteObject[] = [
    {
        path: ROUTES.USER_PROFILE,
        element: withMaintenance(
            <Suspense>
                <UserProfilePage />
            </Suspense>
        ),
    },
    {
        path: ROUTES.USER_PROFILE,
        element: withMaintenance(
            <Suspense>
                <MyProfileRedirect />
            </Suspense>
        ),
    },
  
];
