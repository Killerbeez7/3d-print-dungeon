import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getBadgeColorClass } from "../utils/getBadgeColorClass";
import type { CarouselItem } from "../types/carousel";

interface CarouselCardProps {
    item: CarouselItem;
    height?: number;
    priority?: boolean;
    showDescription?: boolean;
    className?: string;
    onCardClick?: (item: CarouselItem) => void;
}

export const CarouselCard = ({
    item,
    height = 200,
    priority = false,
    showDescription = false,
}: CarouselCardProps) => {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const [isHidden, setIsHidden] = useState(false);

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
            aria-hidden={isHidden ? "true" : undefined}
            className="group block"
        >
            <div
                className="relative overflow-hidden rounded-xl bg-bg-surface 
                border border-br-subtle/70 shadow-token-sm transition-all duration-300 
                hover:border-accent/30 hover:shadow-token-lg"
                style={{ height }}
            >
                {/* Image */}
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 select-none group-hover:scale-105"
                    loading={priority ? "eager" : "lazy"}
                    fetchPriority={priority ? "high" : undefined}
                    decoding="async"
                    draggable="false"
                    style={{
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                    }}
                />

                {/* Base gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-page/82 via-bg-page/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-bg-page/12 via-transparent to-transparent pointer-events-none" />
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(var(--accent-rgb),0.1),transparent_58%)] pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Badge */}
                {item.badge && (
                    <div
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase leading-none pointer-events-none backdrop-blur-md ${getBadgeColorClass(
                            item.badgeColor
                        )}`}
                    >
                        {item.badge}
                    </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-txt-highlight pointer-events-none">
                    <div className="max-w-[92%]">
                        <h3 className="mb-1 line-clamp-2 text-[1.05rem] font-bold leading-[1.12] text-txt-highlight drop-shadow md:text-[1.15rem]">
                            {item.title}
                        </h3>

                        {item.subtitle && (
                            <p className="text-sm font-medium leading-tight text-txt-highlight/80">
                                {item.subtitle}
                            </p>
                        )}

                        {showDescription && item.description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-txt-highlight/65">
                                {item.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};
