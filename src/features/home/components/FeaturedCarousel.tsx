import { ReusableCarousel } from "@/features/shared/reusable/carousel/ReusableCarousel";
import { CarouselCard } from "./CarouselCard";
import { featuredCarouselSettings } from "@/features/shared/reusable/carousel/carouselSettings";
import type { CarouselItem } from "../types/carousel";

interface FeaturedCarouselProps {
    items: CarouselItem[];
    title?: string;
    className?: string;
}

export const FeaturedCarousel = ({
    items = [],
    title,
    className = "",
}: FeaturedCarouselProps) => {
    if (items.length === 0) return null;

    return (
        <section className={`py-8 ${className}`}>
            {title && (
                <div className="px-4 mb-6">
                    <h2 className="text-2xl font-bold text-txt-primary">
                        {title}
                    </h2>
                </div>
            )}

            <ReusableCarousel
                items={items}
                renderItem={(item, index) => (
                    <CarouselCard
                        item={item}
                        priority={index < featuredCarouselSettings.slidesToShow}
                        showDescription={false}
                    />
                )}
                {...featuredCarouselSettings}
                className="carousel-section"
                itemClassName="carousel-item"
            />
        </section>
    );
};
