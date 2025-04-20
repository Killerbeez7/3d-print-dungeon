export const ROUTES = {
    /* Public */
    HOME: "/",
    SEARCH: "/search",
    MAINTENANCE: "/maintenance",

    /* Explore */
    ARTISTS: "/artists",
    COLLECTIONS: "/collections",

    /* Community */
    FORUM: "/community/forum",
    COMMUNITY_EVENTS: "/community/events",
    COMMUNITY_BLOG: "/community/blog",
    // Forum children (relative to /community/forum)
    FORUM_CATEGORY: "category/:categoryId",
    FORUM_THREAD: "thread/:threadId",
    FORUM_NEW_THREAD: "new-thread",

    /* Marketplace */
    MARKETPLACE_FEATURED: "/marketplace/featured",
    MARKETPLACE_NEW_ARRIVALS: "/marketplace/new-arrivals",
    MARKETPLACE_BEST_SELLERS: "/marketplace/best-sellers",

    /* Business */
    BUSINESS_BULK_ORDERS: "/business/bulk-orders",
    BUSINESS_CUSTOM_SOLUTIONS: "/business/custom-solutions",
    BUSINESS_ENTERPRISE_SUITE: "/business/enterprise-suite",

    /* Models */
    MODEL_UPLOAD: "/model/upload",
    MODEL_VIEW: "/model/:id",
    MODEL_EDIT: "/model/:id/edit",

    /* User */
    SETTINGS: "/settings",
    USER_ARTISTS: "/artists",
    USER_ARTIST_PROFILE: "/artist/:id",

    /* Admin */
    ADMIN_PANEL: "/admin-panel",
};
