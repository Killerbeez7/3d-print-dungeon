import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
// Import slick styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
                background: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                right: "10px",
                zIndex: 2,
            }}
            onClick={onClick}
        >
            <i className="fas fa-chevron-right text-white text-xl"></i>
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
                background: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                left: "10px",
                zIndex: 2,
            }}
            onClick={onClick}
        >
            <i className="fas fa-chevron-left text-white text-xl"></i>
        </div>
    );
};

export const FeaturedCarousel = () => {
    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
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

    // Define your featured items here
    const featuredItems = [
        {
            id: "news",
            title: "News",
            image: "/image.png", // Replace with your actual image path
            link: "/news",
        },
        {
            id: "featured",
            title: "Featured Models",
            image: "/image.png",
            link: "/featured",
        },
        {
            id: "business",
            title: "For Business",
            image: "/image.png",
            link: "/business",
        },
    ];

    return (
        <section className="px-4 mb-8">
            <Slider {...settings}>
                {featuredItems.map((item) => (
                    <div key={item.id} className="px-2">
                        <Link to={item.link}>
                            <div className="relative overflow-hidden rounded-lg shadow-lg">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-[300px] object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <h3 className="text-white text-2xl font-bold">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </Slider>
        </section>
    );
};
