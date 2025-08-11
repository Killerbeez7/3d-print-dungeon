export interface ResponsiveSetting {
    breakpoint: number;
    settings: {
        slidesToShow: number;
        slidesToScroll: number;
        [key: string]: unknown;
    };
}

// Default carousel settings
export const defaultCarouselSettings = {
    slidesToShow: 4,
    slidesToScroll: 4,
    infinite: false,
    speed: 500,
    enableSnapToNearest: true,
    enableDrag: true,
};

// Default responsive breakpoints
export const defaultResponsiveSettings: ResponsiveSetting[] = [
    { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
];

// Featured carousel specific settings
export const featuredCarouselSettings = {
    slidesToShow: 5,
    slidesToScroll: 5,
    infinite: false,
    speed: 500,
    responsive: [
        { breakpoint: 1536, settings: { slidesToShow: 5, slidesToScroll: 5 } },
        { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 4 } },
        { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
        { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
        { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
};

// Trending carousel specific settings
export const trendingCarouselSettings = {
    slidesToShow: 8,
    slidesToScroll: 8,
    infinite: false,
    speed: 500,
    responsive: [
        { breakpoint: 1536, settings: { slidesToShow: 4, slidesToScroll: 4 } },
        { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 3 } },
        { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    ],
};

// Mobile-first responsive settings
export const mobileFirstResponsiveSettings: ResponsiveSetting[] = [
    { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
    { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 4 } },
    { breakpoint: 1536, settings: { slidesToShow: 5, slidesToScroll: 5 } },
];

// Compact carousel settings (for smaller spaces)
export const compactCarouselSettings = {
    slidesToShow: 3,
    slidesToScroll: 3,
    infinite: true,
    speed: 400,
    responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
        { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
};
