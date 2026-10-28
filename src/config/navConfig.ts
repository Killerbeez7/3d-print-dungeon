import { ROUTES } from "@/constants/routeConstants";
import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";

export interface NavItem {
  label: string;
  to: string;
}

/** A top-level entry: a direct link (`to`) or a menu of `items`. */
export interface NavSection {
  label: string;
  to: string | null;
  items: NavItem[];
}

// Shop (Marketplace, Printed Figures) and Business pages still show demo
// content, so they are left out of the navigation until they are real.
export const NAV_SECTIONS: NavSection[] = [
  { label: "Models", to: ROUTES.HOME, items: [] },
  { label: "Artists", to: ROUTES.ARTISTS_LIST, items: [] },
  { label: "Collections", to: ROUTES.COLLECTIONS, items: [] },
  {
    label: "Community",
    to: null,
    items: [
      { label: "Forum", to: FORUM_PATHS.HOME },
      { label: "Events", to: ROUTES.EVENTS },
      { label: "Blog", to: ROUTES.BLOG },
    ],
  },
];
