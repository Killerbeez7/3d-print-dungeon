import { Link } from "react-router-dom";
import { ReusableCarousel } from "@/features/shared/reusable/carousel/ReusableCarousel";
import type { FC } from "react";
import { useRef, useEffect, useState } from "react";

export interface FeaturedCarouselItem {
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    image: string;
    link: string;
}

export interface FeaturedCarouselProps {
    items: FeaturedCarouselItem[];
    itemHeight?: number;
    slidesToShow?: number;
}

interface FeaturedCarouselSlideProps {
    item: FeaturedCarouselItem;
    itemHeight: number;
    priority?: boolean; // mark first visible slide for high fetch priority
}

const FeaturedCarouselSlide: FC<FeaturedCarouselSlideProps> = ({ item, itemHeight, priority = false }) => {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const [isHidden, setIsHidden] = useState<boolean>(false);

    useEffect(() => {
        if (linkRef.current) {
            const slide = linkRef.current.closest("[aria-hidden]");
            if (slide) {
                setIsHidden(slide.getAttribute("aria-hidden") === "true");
            }
        }
    }, [linkRef]);

    return (
        <Link
            to={item.link}
            target="_blank"
            rel="noopener noreferrer"
            ref={linkRef}
            tabIndex={isHidden ? -1 : undefined}
            aria-hidden={isHidden ? "true" : undefined}
        >
            <div className="relative overflow-hidden rounded-xl group">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full object-cover rounded-xl"
                    style={{ height: itemHeight }}
                    loading={priority ? "eager" : "lazy"}
                    fetchPriority={priority ? "high" : undefined}
                    decoding="async"
                    width="100%"
                    height={itemHeight}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="text-center">
                        <h3 className="text-white text-xl font-bold mb-1">
                            {item.title}
                        </h3>
                        {item.subtitle && (
                            <p className="text-white text-xs mb-2">{item.subtitle}</p>
                        )}
                        {item.badge && (
                            <div className="inline-block bg-white text-black text-xs font-semibold px-2 py-1 rounded-full">
                                {item.badge}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const FeaturedCarousel: FC<FeaturedCarouselProps> = ({
    items,
    itemHeight = 250,
    slidesToShow = 4,
}) => {
    return (
        <ReusableCarousel<FeaturedCarouselItem>
            items={items}
            renderItem={(item, idx) => (
                <FeaturedCarouselSlide
                    item={item}
                    itemHeight={itemHeight}
                    priority={idx < slidesToShow}
                />
            )}
            slidesToShow={slidesToShow}
            slidesToScroll={slidesToShow}
            infinite={false}
            speed={500}
        />
    );
};
