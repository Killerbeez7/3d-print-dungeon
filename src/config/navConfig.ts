import { ROUTES } from "../constants/routeConstants";

export interface NavItem {
    label: string;
    to: string;
}

export interface NavSection {
    label: string;
    to: string | null;
    items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
    {
        label: "Explore",
        to: null,
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
        label: "Shop",
        to: null,
        items: [
            { label: "Marketplace", to: "/marketplace" },
            { label: "Printed Figures", to: "/printed-figures" },
        ],
    },
    {
        label: "Business",
        to: null,
        items: [
            { label: "Bulk Orders", to: ROUTES.BUSINESS_BULK_ORDERS },
            { label: "Custom Solutions", to: ROUTES.BUSINESS_CUSTOM_SOLUTIONS },
            { label: "Enterprise Suite", to: ROUTES.BUSINESS_ENTERPRISE_SUITE },
        ],
    },
];
