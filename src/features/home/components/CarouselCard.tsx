import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import type { CarouselItem } from "../types/carousel";

interface CarouselCardProps {
    item: CarouselItem;
    height?: number;
    priority?: boolean;
    showDescription?: boolean;
    className?: string;
    onCardClick?: (item: CarouselItem) => void;
}

const getBadgeColorClass = (color?: string) => {
    switch (color) {
        case "primary":
            return "bg-primary text-white";
        case "secondary":
            return "bg-secondary text-white";
        case "accent":
            return "bg-accent text-white";
        case "success":
            return "bg-green-500 text-white";
        case "warning":
            return "bg-yellow-500 text-black";
        case "error":
            return "bg-red-500 text-white";
        default:
            return "bg-accent text-white";
    }
};

export const CarouselCard = ({
    item,
    height = 200,
    priority = false,
    showDescription = false,
    className = "",
    onCardClick,
}: CarouselCardProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
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

    const handleImageLoad = () => {
        setIsLoaded(true);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = (e: React.MouseEvent) => {
        if (onCardClick) {
            e.preventDefault();
            e.stopPropagation();
            onCardClick(item);
        }
    };

    const cardContent = (
        <div
            className="relative overflow-hidden rounded-xl bg-bg-surface border border-br-secondary transition-all duration-300 hover:shadow-lg hover:border-accent"
            style={{ height }}
        >
            {/* Image */}
            <div className="relative w-full h-full">
                <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                        isLoaded ? "opacity-100" : "opacity-0"
                    } ${isHovered ? "scale-105" : "scale-100"}`}
                    loading={priority ? "eager" : "lazy"}
                    fetchPriority={priority ? "high" : undefined}
                    decoding="async"
                    onLoad={handleImageLoad}
                    draggable={false}
                />

                {/* Loading placeholder */}
                {!isLoaded && (
                    <div className="absolute inset-0 bg-bg-tertiary animate-pulse" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Badge */}
            {item.badge && (
                <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColorClass(
                        item.badgeColor
                    )}`}
                >
                    {item.badge}
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="space-y-2">
                    {/* Title */}
                    <h3 className="text-lg font-bold leading-tight group-hover:text-accent transition-colors duration-200">
                        {item.title}
                    </h3>

                    {/* Subtitle */}
                    {item.subtitle && (
                        <p className="text-sm text-gray-200 leading-tight">
                            {item.subtitle}
                        </p>
                    )}

                    {/* Description (optional) */}
                    {showDescription && item.description && (
                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                            {item.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Hover indicator */}
            <div
                className={`absolute inset-0 border-2 border-accent rounded-xl transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                }`}
            />
        </div>
    );

    if (item.external) {
        return (
            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                ref={linkRef}
                tabIndex={isHidden ? -1 : undefined}
                aria-hidden={isHidden ? "true" : undefined}
                className={`block group pointer-events-none ${className}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {cardContent}
            </a>
        );
    }

    return (
        <Link
            to={item.link}
            ref={linkRef}
            tabIndex={isHidden ? -1 : undefined}
            aria-hidden={isHidden ? "true" : undefined}
            className={`block group pointer-events-none ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {cardContent}
        </Link>
    );
};
