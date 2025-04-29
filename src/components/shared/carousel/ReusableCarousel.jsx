import PropTypes from "prop-types";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slick-overrides.css";

import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const NextArrow = ({ className, style, onClick }) => {
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

const PrevArrow = ({ className, style, onClick }) => {
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

PrevArrow.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
};

NextArrow.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
};

export const ReusableCarousel = ({
    items,
    renderItem,
    slidesToShow = 4,
    slidesToScroll = 4,
    infinite = false,
    speed = 500,
    responsive = [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
    ],
    className = "",
    itemClassName = "",
    containerClassName = "",
}) => {
    // Adjust slidesToShow and slidesToScroll if there are fewer items
    const adjustedSlidesToShow = Math.min(slidesToShow, items.length);
    const adjustedSlidesToScroll = Math.min(slidesToScroll, items.length);

    const settings = {
        infinite,
        speed,
        slidesToShow: adjustedSlidesToShow,
        slidesToScroll: adjustedSlidesToScroll,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        select: false,
        responsive: responsive.map(breakpoint => ({
            ...breakpoint,
            settings: {
                ...breakpoint.settings,
                slidesToShow: Math.min(breakpoint.settings.slidesToShow, items.length),
                slidesToScroll: Math.min(breakpoint.settings.slidesToScroll, items.length),
            }
        })),
    };

    return (
        <section className={`p-2 ${containerClassName}`}>
            <Slider {...settings} className={className}>
                {items.map((item, index) => (
                    <div
                        key={item.id || index}
                        className={`inline-block px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/6 ${itemClassName}`}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </Slider>
        </section>
    );
};

ReusableCarousel.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    renderItem: PropTypes.func.isRequired,
    slidesToShow: PropTypes.number,
    slidesToScroll: PropTypes.number,
    infinite: PropTypes.bool,
    speed: PropTypes.number,
    responsive: PropTypes.arrayOf(
        PropTypes.shape({
            breakpoint: PropTypes.number.isRequired,
            settings: PropTypes.object.isRequired,
        })
    ),
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    containerClassName: PropTypes.string,
};
