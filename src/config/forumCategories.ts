import { Globe, Megaphone, Paintbrush, ShoppingBag, UsersRound, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  order: number;
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: "general",
    name: "General",
    description: "General discussion about 3D printing.",
    icon: Globe,
    order: 0,
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Buy, sell, or trade 3D prints and materials.",
    icon: ShoppingBag,
    order: 1,
  },
  {
    id: "community",
    name: "Community",
    description: "Meetups, events, and user introductions.",
    icon: UsersRound,
    order: 2,
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Printer maintenance and troubleshooting.",
    icon: Wrench,
    order: 3,
  },
  {
    id: "art",
    name: "Art & Design",
    description: "Share and discuss 3D art and design.",
    icon: Paintbrush,
    order: 4,
  },
  {
    id: "news",
    name: "News & Updates",
    description: "Latest news and updates in 3D printing.",
    icon: Megaphone,
    order: 5,
  },
]; 