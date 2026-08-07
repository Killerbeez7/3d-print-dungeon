import type { RouteObject } from "react-router-dom";

import { ROUTES } from "@/constants/routeConstants";
import { PasswordResetPage } from "../components/PasswordResetPage";

export const authRoutes: RouteObject[] = [
  {
    path: ROUTES.PASSWORD_RESET,
    element: <PasswordResetPage />,
  },
];
