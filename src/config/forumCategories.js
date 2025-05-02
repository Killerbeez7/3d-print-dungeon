import { HiShoppingCart, HiUsers, HiOutlineGlobeAlt } from "react-icons/hi";
import { HiWrenchScrewdriver, HiPaintBrush } from "react-icons/hi2";
import { HiOutlineCalendar } from "react-icons/hi";

export const FORUM_CATEGORIES = [
  {
    id: "general",
    name: "General",
    description: "General discussion about 3D printing.",
    icon: HiOutlineGlobeAlt,
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Buy, sell, or trade 3D prints and materials.",
    icon: HiShoppingCart,
  },
  {
    id: "community",
    name: "Community",
    description: "Meetups, events, and user introductions.",
    icon: HiUsers,
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Printer maintenance and troubleshooting.",
    icon: HiWrenchScrewdriver,
  },
  {
    id: "art",
    name: "Art & Design",
    description: "Share and discuss 3D art and design.",
    icon: HiPaintBrush,
  },
  {
    id: "news",
    name: "News & Updates",
    description: "Latest news and updates in 3D printing.",
    icon: HiOutlineCalendar,
  },
]; 