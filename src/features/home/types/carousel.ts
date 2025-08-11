export interface CarouselItem {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    badge?: string;
    badgeColor?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
    image: string;
    link: string;
    external?: boolean;
    category?: string;
    priority?: number;
    featured?: boolean;
}

export interface CarouselSection {
    id: string;
    title: string;
    subtitle?: string;
    items: CarouselItem[];
    maxItems?: number;
    autoPlay?: boolean;
    showArrows?: boolean;
    showDots?: boolean;
}

export interface CarouselConfig {
    items: CarouselItem[];
    itemHeight?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    infinite?: boolean;
    speed?: number;
    autoplay?: boolean;
    autoplaySpeed?: number;
    responsive?: Array<{
        breakpoint: number;
        settings: {
            slidesToShow: number;
            slidesToScroll: number;
        };
    }>;
}

export interface CarouselSlideProps {
    item: CarouselItem;
    itemHeight: number;
    priority?: boolean; // mark first visible slide for high fetch priority
}