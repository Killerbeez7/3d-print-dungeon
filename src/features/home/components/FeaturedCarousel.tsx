import { ReusableCarousel } from "@/features/shared/reusable/carousel/ReusableCarousel";
import { CarouselCard } from "./CarouselCard";
import type { CarouselItem } from "../types/carousel";
import { defaultCarouselSettings } from "@/features/shared/reusable/carousel/carouselSettings";
import { H2 } from "@/components/ResponsiveHeading";

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
                    <H2 size="2xl" className="text-txt-primary">{title}</H2>
                </div>
            )}

            <ReusableCarousel
                items={items}
                renderItem={(item, index) => (
                    <CarouselCard
                        item={item}
                        priority={index < defaultCarouselSettings.slidesToShow}
                        showDescription={false}
                    />
                )}
                {...defaultCarouselSettings}
                className="carousel-section"
                itemClassName="carousel-item"
            />
        </section>
    );
};
