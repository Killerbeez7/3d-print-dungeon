export function getAssetPath(path: string): string {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const baseUrl = import.meta.env.BASE_URL;
    return `${baseUrl}${cleanPath}`;
}

export interface CarouselImages {
    SPRING_SALE: string;
    SCHEDULED_PROJECTS: string;
    TRENDING_PROJECTS: string;
    NEW_ARRIVALS: string;
    STORE_3D: string;
    PROJECT_IDEAS: string;
    MINIATURES_COMPETITION: string;
    SCHEDULED_MODELS: string;
    TRENDING_MODELS: string;
    UPCOMING_MODELS: string;
    ARENA_MODELS: string;
    DUNGEON_MODELS: string;
    BATTLE_MODELS: string;
}

export interface ThreeDViewImages {
    THUMBNAIL: string;
}

export interface StaticAssets {
    LOGO: string;
    USER_DEFAULT: string;
    DEFAULT_AVATAR: string;
    PLACEHOLDER_IMAGE: string;
    FAVICON: string;
    CAROUSEL: CarouselImages;
    THREE_D_VIEW: ThreeDViewImages;
}

export const STATIC_ASSETS: StaticAssets = {
    LOGO: "/assets/images/logo.svg",
    USER_DEFAULT: "/assets/images/user.png",
    DEFAULT_AVATAR: "/assets/images/user.png",
    PLACEHOLDER_IMAGE: "/assets/images/image.png",

    // Icons
    FAVICON: "/assets/icons/favicon.svg",

    // Carousel images
    CAROUSEL: {
        SPRING_SALE: "/assets/carousel-images/SpringSale.png",
        SCHEDULED_PROJECTS: "/assets/carousel-images/ScheduledProjects.png",
        TRENDING_PROJECTS: "/assets/carousel-images/TrendingProjects.png",
        NEW_ARRIVALS: "/assets/carousel-images/NewArrivals.png",
        STORE_3D: "/assets/carousel-images/3d-store.png",
        PROJECT_IDEAS: "/assets/carousel-images/ProjectIdeas.png",

        MINIATURES_COMPETITION: "/assets/carousel-images/MiniaturesCompetition_270.webp",
        SCHEDULED_MODELS: "/assets/carousel-images/ScheduledModels_270.webp",
        TRENDING_MODELS: "/assets/carousel-images/TrendingModels_270.webp",
        UPCOMING_MODELS: "/assets/carousel-images/UpcomingModels_270.webp",

        ARENA_MODELS: "/assets/carousel-images/ArenaModels_270.webp",
        DUNGEON_MODELS: "/assets/carousel-images/DungeonModels.jpg",
        BATTLE_MODELS: "/assets/carousel-images/BattleModels_270.webp",
    },

    // 3D View images
    THREE_D_VIEW: {
        THUMBNAIL: "/assets/image/3d-view.png",
    },
};
