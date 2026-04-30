import { useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";
import { FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";

const SITE_URL = "https://print-dungeon-3d.firebaseapp.com";
const DEFAULT_TITLE = "3D Print Dungeon";
const DEFAULT_DESCRIPTION =
    "Discover, share, and purchase 3D printable dungeon models, miniatures, and resources for tabletop gaming.";
const DEFAULT_IMAGE = "/assets/carousel-images/MiniaturesCompetition_270.webp";

const routeMetadata = [
    { path: ROUTES.HOME, title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
    {
        path: ROUTES.SEARCH,
        title: "Search 3D Models | 3D Print Dungeon",
        description: "Search printable 3D models, tabletop miniatures, terrain, and creators.",
    },
    {
        path: ROUTES.SEARCH_ARTISTS,
        title: "Search Artists | 3D Print Dungeon",
        description: "Find 3D artists and creators in the 3D Print Dungeon community.",
    },
    {
        path: ROUTES.ARTISTS_LIST,
        title: "3D Artists | 3D Print Dungeon",
        description: "Discover 3D artists and browse their printable models.",
    },
    {
        path: ROUTES.COLLECTIONS,
        title: "3D Model Collections | 3D Print Dungeon",
        description: "Browse curated collections of printable 3D models.",
    },
    {
        path: ROUTES.EVENTS,
        title: "Events and Competitions | 3D Print Dungeon",
        description: "Explore community events, contests, meetups, and webinars.",
    },
    {
        path: ROUTES.BLOG,
        title: "Community Blog | 3D Print Dungeon",
        description: "Read 3D printing ideas, community updates, and tabletop model inspiration.",
    },
    {
        path: ROUTES.MARKETPLACE,
        title: "Marketplace | 3D Print Dungeon",
        description: "Browse curated printable model listings and marketplace previews.",
    },
    {
        path: ROUTES.MARKETPLACE_FEATURED,
        title: "Featured 3D Models | 3D Print Dungeon",
        description: "Explore featured printable 3D models selected for the community.",
    },
    {
        path: ROUTES.MARKETPLACE_NEW_ARRIVALS,
        title: "New Arrivals | 3D Print Dungeon",
        description: "See new printable 3D model arrivals and upcoming marketplace listings.",
    },
    {
        path: ROUTES.MARKETPLACE_BEST_SELLERS,
        title: "Best Sellers | 3D Print Dungeon",
        description: "Browse best-selling printable 3D model previews.",
    },
    {
        path: ROUTES.PRINTED_FIGURES,
        title: "Printed Figures | 3D Print Dungeon",
        description: "Preview high-quality printed tabletop figures and miniatures.",
    },
    {
        path: FORUM_HOME_PATH,
        title: "Forum | 3D Print Dungeon",
        description: "Join community discussions about 3D printing, models, and tabletop gaming.",
    },
    {
        path: ROUTES.POLICIES,
        title: "Policies | 3D Print Dungeon",
        description: "Review 3D Print Dungeon policies, privacy information, and terms.",
    },
    {
        path: ROUTES.PRIVACY_POLICY,
        title: "Privacy Policy | 3D Print Dungeon",
        description: "Read the 3D Print Dungeon privacy policy.",
    },
    {
        path: ROUTES.TERMS_OF_USE,
        title: "Terms of Use | 3D Print Dungeon",
        description: "Read the 3D Print Dungeon terms of use.",
    },
    {
        path: ROUTES.COOKIE_POLICY,
        title: "Cookie Policy | 3D Print Dungeon",
        description: "Read how 3D Print Dungeon uses cookies and consent settings.",
    },
    {
        path: ROUTES.REFUND_POLICY,
        title: "Refund Policy | 3D Print Dungeon",
        description: "Read the 3D Print Dungeon refund policy.",
    },
    {
        path: ROUTES.MODEL_VIEW,
        title: "3D Model | 3D Print Dungeon",
        description: "View a printable 3D model on 3D Print Dungeon.",
    },
    {
        path: ROUTES.USER_PROFILE,
        title: "Creator Profile | 3D Print Dungeon",
        description: "View a 3D Print Dungeon creator profile.",
    },
];

function setMeta(name: string, content: string, property = false) {
    const attr = property ? "property" : "name";
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
    if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
    }
    tag.content = content;
}

function setCanonical(href: string) {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
    }
    link.href = href;
}

export const RouteMetadata = () => {
    const location = useLocation();

    useEffect(() => {
        const matched =
            routeMetadata.find((item) =>
                matchPath({ path: item.path, end: true }, location.pathname)
            ) || routeMetadata[0];

        const canonical = `${SITE_URL}${location.pathname === "/" ? "" : location.pathname}`;
        const title = matched.title || DEFAULT_TITLE;
        const description = matched.description || DEFAULT_DESCRIPTION;

        document.title = title;
        setMeta("description", description);
        setCanonical(canonical);
        setMeta("og:title", title, true);
        setMeta("og:description", description, true);
        setMeta("og:url", canonical, true);
        setMeta("og:image", DEFAULT_IMAGE, true);
        setMeta("twitter:title", title);
        setMeta("twitter:description", description);
        setMeta("twitter:image", DEFAULT_IMAGE);
    }, [location.pathname]);

    return null;
};
