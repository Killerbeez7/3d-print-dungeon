import React, { useRef, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
// Import slick carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slick-overrides.css";

import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

// Custom Next Arrow component
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

// Custom Prev Arrow component
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
  const sliderRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    // Disable built-in dragging so our custom pointer events work instead
    draggable: false,
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

  // Pointer event handlers
  const handlePointerDown = (e) => {
    setDragging(true);
    setStartX(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    const delta = e.clientX - startX;
    const threshold = 100; // pixels needed for a slide change
    const slideChange = Math.round(delta / threshold);
    // Attempt to get current slide index via slickCurrentSlide or innerSlider
    const currentSlide =
      (sliderRef.current?.slickCurrentSlide && sliderRef.current.slickCurrentSlide()) ||
      (sliderRef.current?.innerSlider?.state?.currentSlide ?? 0);
    const newSlide = currentSlide - slideChange;
    if (sliderRef.current?.slickGoTo) {
      sliderRef.current.slickGoTo(newSlide);
    } else if (sliderRef.current?.innerSlider?.slickGoTo) {
      sliderRef.current.innerSlider.slickGoTo(newSlide);
    }
  };

  const handlePointerMove = (e) => {
    // (Optional: Real-time dragging feedback can be added here)
  };

  const handlePointerLeave = (e) => {
    if (dragging) {
      handlePointerUp(e);
    }
  };

  // Example featured items – update with your actual content
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
    {
      id: "portfolio",
      title: "Portfolio",
      image: "/image.png",
      link: "/portfolio",
    },
  ];

  return (
    <section className="px-4 mb-8">
      {/* Container with pointer event handlers */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ userSelect: "none" }}
      >
        <Slider ref={sliderRef} {...settings}>
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
      </div>
    </section>
  );
};

export default FeaturedCarousel;
