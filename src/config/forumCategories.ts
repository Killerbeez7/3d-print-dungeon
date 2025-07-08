import { IconType } from "react-icons";
import { HiShoppingCart, HiUsers, HiOutlineGlobeAlt } from "react-icons/hi";
import { HiWrenchScrewdriver, HiPaintBrush } from "react-icons/hi2";
import { HiOutlineCalendar } from "react-icons/hi";

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  order: number;
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: "general",
    name: "General",
    description: "General discussion about 3D printing.",
    icon: HiOutlineGlobeAlt,
    order: 0,
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Buy, sell, or trade 3D prints and materials.",
    icon: HiShoppingCart,
    order: 1,
  },
  {
    id: "community",
    name: "Community",
    description: "Meetups, events, and user introductions.",
    icon: HiUsers,
    order: 2,
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Printer maintenance and troubleshooting.",
    icon: HiWrenchScrewdriver,
    order: 3,
  },
  {
    id: "art",
    name: "Art & Design",
    description: "Share and discuss 3D art and design.",
    icon: HiPaintBrush,
    order: 4,
  },
  {
    id: "news",
    name: "News & Updates",
    description: "Latest news and updates in 3D printing.",
    icon: HiOutlineCalendar,
    order: 5,
  },
]; 