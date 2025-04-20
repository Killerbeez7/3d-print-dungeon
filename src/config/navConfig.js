import { ROUTES } from "./routeConstants";

export const NAV_SECTIONS = [
    {
        label: "Explore",
        to: ROUTES.HOME,
        items: [
            { label: "Models", to: ROUTES.HOME },
            { label: "Artists", to: ROUTES.ARTISTS },
            { label: "Collections", to: ROUTES.COLLECTIONS },
        ],
    },
    {
        label: "Community",
        to: "/community",
        items: [
            { label: "Forum", to: ROUTES.FORUM },
            { label: "Events", to: ROUTES.COMMUNITY_EVENTS },
            { label: "Blog", to: ROUTES.COMMUNITY_BLOG },
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
