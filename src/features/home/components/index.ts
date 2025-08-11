// Carousel Components
export { CarouselCard } from './CarouselCard';
export { FeaturedCarousel } from './FeaturedCarousel';

// Types
export type { CarouselItem, CarouselSection, CarouselConfig } from '../types/carousel';

// Mock Data
export {
    featuredCarouselItems,
} from '../mock/carouselData';

// Carousel Settings
export {
    defaultCarouselSettings,
    featuredCarouselSettings,
    trendingCarouselSettings,
    mobileFirstResponsiveSettings,
    compactCarouselSettings,
    type ResponsiveSetting
} from '@/features/shared/reusable/carousel/carouselSettings';
