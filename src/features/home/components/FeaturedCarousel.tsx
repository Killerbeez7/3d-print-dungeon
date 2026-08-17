import { ReusableCarousel } from "@/features/shared/reusable/carousel/ReusableCarousel";
import { CarouselCard } from "./CarouselCard";
import type { CarouselItem } from "../types/carousel";
import { defaultCarouselSettings } from "@/features/shared/reusable/carousel/carouselSettings";

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
    <section className={`relative pb-5 pt-6 lg:pt-7 ${className}`}>
      {title && (
        <div className="mb-5 px-4">
          <h2 className="text-2xl text-txt-primary">{title}</h2>
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
        containerClassName="px-2 md:px-4 lg:px-6"
      />
    </section>
  );
};
