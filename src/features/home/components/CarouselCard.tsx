import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getBadgeColorClass } from "../getBadgeColorClass";
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
            className="group"
        >
            <div
                className="relative overflow-hidden rounded-xl group 
                bg-bg-surface border border-br-secondary transition-all duration-300 
                hover:shadow-lg"
                style={{ height }}
            >
                {/* Image */}
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-500 select-none group-hover:scale-115"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t
                 from-black/35 via-black/15 to-transparent 
                pointer-events-none opacity-0 group-hover:opacity-100 transition-all 
                 ease-in-out transform translate-y-full group-hover:translate-y-0" />

                {/* Badge */}
                {item.badge && (
                    <div
                        className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold pointer-events-none ${getBadgeColorClass(
                            item.badgeColor
                        )}`}
                    >
                        {item.badge}
                    </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-token-4 text-white pointer-events-none">
                    <div className="gap-token-3">
                        <h3 className="text-token-2xl font-bold leading-token-tight mb-[5px]">{item.title}</h3>

                        {item.subtitle && (
                            <p className="text-token-sm text-gray-200 leading-token-tight">
                                {item.subtitle}
                            </p>
                        )}

                        {showDescription && item.description && (
                            <p className="text-token-xs text-gray-300 leading-token-relaxed line-clamp-2">
                                {item.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};
