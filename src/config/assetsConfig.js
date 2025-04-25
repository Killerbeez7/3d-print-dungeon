export const getAssetPath = (path) => {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const baseUrl = import.meta.env.BASE_URL;
    return `${baseUrl}${cleanPath}`;
};

export const STATIC_ASSETS = {
    
    // General images
    LOGO: "/assets/images/logo.png",
    USER_DEFAULT: "/assets/images/user.png",
    DEFAULT_AVATAR: "/assets/images/default-avatar.png",

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

        MINIATURES_COMPETITION: "/assets/carousel-images/MiniaturesCompetition.jpg",
        SCHEDULED_MODELS: "/assets/carousel-images/ScheduledModels.jpg",
        TRENDING_MODELS: "/assets/carousel-images/TrendingModels.jpg",
        UPCOMING_MODELS: "/assets/carousel-images/UpcomingModels.jpg",

        ARENA_MODELS: "/assets/carousel-images/ArenaModels.jpg",
        DUNGEON_MODELS: "/assets/carousel-images/DungeonModels.jpg",
        BATTLE_MODELS: "/assets/carousel-images/BattleModels.jpg",
    },

    // 3D View images
    THREE_D_VIEW: {
        THUMBNAIL: "/assets/image/3d-view.png",
    },
};
