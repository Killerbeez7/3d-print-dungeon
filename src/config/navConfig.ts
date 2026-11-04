import {
  Box,
  Library,
  LifeBuoy,
  MessagesSquare,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routeConstants";
import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";

export interface NavItem {
  label: string;
  to: string;
  hint?: string;
  icon?: LucideIcon;
}

/** A top-level entry: a direct link (`to`) or a menu of `items`. */
export interface NavSection {
  label: string;
  to: string | null;
  items: NavItem[];
  icon?: LucideIcon;
}

// Shop (Marketplace, Printed Figures), Business, Events and Blog only had demo
// content, so they are left out of the navigation until they are real.
export const NAV_SECTIONS: NavSection[] = [
  { label: "Models", to: ROUTES.HOME, items: [], icon: Box },
  { label: "Artists", to: ROUTES.ARTISTS_LIST, items: [], icon: Users },
  { label: "Collections", to: ROUTES.COLLECTIONS, items: [], icon: Library },
  {
    label: "Community",
    to: null,
    items: [
      {
        label: "Forum",
        to: FORUM_PATHS.HOME,
        hint: "Ask, share, discuss",
        icon: MessagesSquare,
      },
      {
        label: "Forum rules",
        to: FORUM_PATHS.RULES,
        hint: "How we keep it friendly",
        icon: ScrollText,
      },
      {
        label: "Help",
        to: FORUM_PATHS.HELP,
        hint: "Answers to common questions",
        icon: LifeBuoy,
      },
    ],
  },
];
