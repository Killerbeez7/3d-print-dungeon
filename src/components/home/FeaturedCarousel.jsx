import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slick-overrides.css"; // Your custom overrides

import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{
                ...style,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                right: "10px",
                zIndex: 2,
                cursor: "pointer",
            }}
            onClick={onClick}
        >
            <FaArrowRight style={{ color: "#fff", fontSize: "20px" }} />
        </div>
    );
};

const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{
                ...style,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                left: "10px",
                zIndex: 2,
                cursor: "pointer",
            }}
            onClick={onClick}
        >
            <FaArrowLeft style={{ color: "#fff", fontSize: "20px" }} />
        </div>
    );
};

export const FeaturedCarousel = () => {
    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 3,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        select: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2 },
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 1 },
            },
        ],
    };

    // items change with list from databse later on

    const featuredItems = [
        {
            id: "marketplace",
            title: "Spring Sale",
            subtitle: "Shop up to 70% off",
            badge: "MARKETPLACE",
            image: "https://cdna.artstation.com/p/top_row_items/images/000/002/710/20250328093732/original/artstation-marketplace-spring-sale-toprow-890x500.png?1743172652",
            link: "https://www.artstation.com/marketplace",
        },
        {
            id: "news",
            title: "Scheduled Projects",
            subtitle: "Development Update",
            badge: "NEWS",
            image: "https://cdnb.artstation.com/p/top_row_items/images/000/002/711/20250328132708/original/magazine-cover-1920x1080-pd.jpg?1743186428",
            link: "https://magazine.artstation.com/2025/03/scheduled-projects/",
        },
        {
            id: "artblast",
            title: "Ubisoft Assassin’s Creed Shadows Art Blast",
            subtitle: "Discover the Art of Assassin's Creed Shadows",
            badge: "ART BLAST",
            image: "https://cdnb.artstation.com/p/top_row_items/images/000/002/709/20250327120422/original/ac-artblast-magazinearticle-1280x720-notext.jpg?1743095062",
            link: "https://magazine.artstation.com/2025/03/ubisoft-assassins-creed-shadows-art-blast/",
        },
        {
            id: "news",
            title: "Scheduled Projects",
            subtitle: "Development Update",
            badge: "NEWS",
            image: "https://cdnb.artstation.com/p/top_row_items/images/000/002/711/20250328132708/original/magazine-cover-1920x1080-pd.jpg?1743186428",
            link: "https://magazine.artstation.com/2025/03/scheduled-projects/",
        },
        {
            id: "artblast",
            title: "Ubisoft Assassin’s Creed Shadows Art Blast",
            subtitle: "Discover the Art of Assassin's Creed Shadows",
            badge: "ART BLAST",
            image: "https://cdnb.artstation.com/p/top_row_items/images/000/002/709/20250327120422/original/ac-artblast-magazinearticle-1280x720-notext.jpg?1743095062",
            link: "https://magazine.artstation.com/2025/03/ubisoft-assassins-creed-shadows-art-blast/",
        },
        {
            id: "marketplace",
            title: "Spring Sale",
            subtitle: "Shop up to 70% off",
            badge: "MARKETPLACE",
            image: "https://cdna.artstation.com/p/top_row_items/images/000/002/710/20250328093732/original/artstation-marketplace-spring-sale-toprow-890x500.png?1743172652",
            link: "https://www.artstation.com/marketplace",
        },
    ];

    return (
        <section className="px-4 mb-8">
            <Slider {...settings}>
                {featuredItems.map((item) => (
                    <div
                        key={item.id}
                        className="inline-block px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/6"
                    >
                        <Link to={item.link} target="_blank" rel="noopener noreferrer">
                            <div className="relative overflow-hidden rounded-xl group">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    draggable={false}
                                    onDragStart={(e) => e.preventDefault()}
                                    className="w-full h-[200px] object-cover rounded-xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="text-center">
                                        <h3 className="text-white text-xl font-bold mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-white text-xs mb-2">
                                            {item.subtitle}
                                        </p>
                                        {item.badge && (
                                            <div className="inline-block bg-white text-black text-xs font-semibold px-2 py-1 rounded-full">
                                                {item.badge}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </Slider>
        </section>
    );
};
