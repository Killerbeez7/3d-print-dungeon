import { Link } from "react-router-dom";
import { ReusableCarousel } from "../shared/carousel/ReusableCarousel";
import type { FC } from "react";

export interface TrendingCarouselItem {
    id: string;
    title: string;
    image: string;
    link: string;
    price: number;
    rating: number;
    ratingCount: number;
    reviewCount: number;
    creatorName: string;
    creatorAvatar: string;
    mature?: boolean;
}

export interface TrendingCarouselProps {
    items: TrendingCarouselItem[];
}

export const TrendingCarousel: FC<TrendingCarouselProps> = ({ items }) => {
    const renderItem = (item: TrendingCarouselItem) => (
        <Link to={item.link} target="_blank" rel="noopener noreferrer">
            <div className="relative overflow-hidden rounded-xl group h-[80px] w-[120px]">
                {/* Image Container */}
                <div className="relative w-full h-full">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-xl"
                    />
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {/* Top Content - Mature Badge */}
                    {item.mature && (
                        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded self-start">
                            MATURE CONTENT
                        </div>
                    )}

                    {/* Bottom Content */}
                    <div className="text-white">
                        <h3 className="text-lg font-bold mb-1 line-clamp-2">
                            {item.title}
                        </h3>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                                {item.rating.toFixed(1)}
                            </span>
                            <span className="text-xs opacity-90">
                                {item.ratingCount}{" "}
                                {item.ratingCount === 1 ? "rating" : "ratings"}
                            </span>
                        </div>

                        {/* Creator and Price */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img
                                    src={item.creatorAvatar}
                                    alt={item.creatorName}
                                    className="w-5 h-5 rounded-full"
                                />
                                <span className="text-sm">by {item.creatorName}</span>
                            </div>
                            <span className="font-medium">
                                USD ${item.price.toFixed(2)}+
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="relative w-4/6 ml-auto py-8">
            <div className="px-4 mb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-txt-primary">
                        Trending on the Marketplace
                    </h2>
                    <Link
                        to="/marketplace"
                        className="text-accent hover:text-accent-hover text-sm"
                    >
                        View more Products
                    </Link>
                </div>
            </div>
            <ReusableCarousel<TrendingCarouselItem>
                items={items}
                renderItem={renderItem}
                slidesToShow={8}
                slidesToScroll={8}
                infinite={false}
                speed={500}
                responsive={[
                    {
                        breakpoint: 1536,
                        settings: { slidesToShow: 4, slidesToScroll: 4 },
                    },
                    {
                        breakpoint: 1280,
                        settings: { slidesToShow: 3, slidesToScroll: 3 },
                    },
                    {
                        breakpoint: 768,
                        settings: { slidesToShow: 2, slidesToScroll: 2 },
                    },
                ]}
            />
        </div>
    );
};
