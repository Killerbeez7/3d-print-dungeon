import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

import { withProtected } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";

const PublicProfilePage = lazy(() =>
  import("../profile/pages/PublicProfilePage").then((module) => ({
    default: module.PublicProfilePage,
  }))
);

const ProfileRedirect = lazy(() =>
  import("../profile/pages/ProfileRedirect").then((module) => ({
    default: module.ProfileRedirect,
  }))
);

const SettingsPage = lazy(() =>
  import("../settings/pages/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);

const SettingsPageSkeleton = lazy(() =>
  import("../settings/components/SettingsPageSkeleton").then((m) => ({
    default: m.SettingsPageSkeleton,
  }))
);

const NotificationsPage = lazy(() =>
  import("../notifications/pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  }))
);

const PasswordResetPage = lazy(() =>
  import("@/features/auth/components/PasswordResetPage").then((m) => ({
    default: m.PasswordResetPage,
  }))
);

export const userRoutes: RouteObject[] = [
  // Target for Firebase's password reset email when its action URL points here.
  {
    path: ROUTES.PASSWORD_RESET,
    element: (
      <Suspense>
        <PasswordResetPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.USER_PROFILE_REDIRECT,
    element: withProtected(
      <Suspense>
        <ProfileRedirect />
      </Suspense>
    ),
  },
  {
    path: ROUTES.USER_PROFILE,
    element: (
      <Suspense>
        <PublicProfilePage />
      </Suspense>
    ),
  },

  {
    path: ROUTES.USER_SETTINGS,
    element: withProtected(
      <Suspense fallback={<SettingsPageSkeleton />}>
        <SettingsPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.USER_NOTIFICATIONS,
    element: withProtected(
      <Suspense>
        <NotificationsPage />
      </Suspense>
    ),
  },
];
