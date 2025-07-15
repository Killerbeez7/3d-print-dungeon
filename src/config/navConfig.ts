import { ROUTES } from "../constants/routeConstants";

export interface NavItem {
    label: string;
    to: string;
}

export interface NavSection {
    label: string;
    to: string | null; // null or "#" if just a dropdown
    items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
    {
        label: "Explore",
        to: ROUTES.HOME,
        items: [
            { label: "Models", to: ROUTES.HOME },
            { label: "Artists", to: ROUTES.ARTISTS_LIST },
            { label: "Collections", to: ROUTES.COLLECTIONS },
        ],
    },
    {
        label: "Community",
        to: null,
        items: [
            { label: "Events", to: ROUTES.EVENTS },
            { label: "Forum", to: ROUTES.FORUM },
            { label: "Blog", to: ROUTES.BLOG },
        ],
    },
    {
        label: "Marketplace",
        to: "/marketplace",
        items: [
            { label: "Featured", to: ROUTES.MARKETPLACE_FEATURED },
            { label: "New Arrivals", to: ROUTES.MARKETPLACE_NEW_ARRIVALS },
            { label: "Best Sellers", to: ROUTES.MARKETPLACE_BEST_SELLERS },
        ],
    },
    {
        label: "Business",
        to: "/business",
        items: [
            { label: "Bulk Orders", to: ROUTES.BUSINESS_BULK_ORDERS },
            { label: "Custom Solutions", to: ROUTES.BUSINESS_CUSTOM_SOLUTIONS },
            { label: "Enterprise Suite", to: ROUTES.BUSINESS_ENTERPRISE_SUITE },
        ],
    },
];
