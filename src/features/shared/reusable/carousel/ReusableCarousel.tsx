import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slick-overrides.css";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

interface ArrowProps {
    className?: string;
    style?: object;
    onClick?: () => void;
}

const NextArrow = ({ className, style, onClick }: ArrowProps) => (
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

const PrevArrow = ({ className, style, onClick }: ArrowProps) => (
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

interface ResponsiveSetting {
    breakpoint: number;
    settings: {
        slidesToShow: number;
        slidesToScroll: number;
        [key: string]: unknown;
    };
}

interface ReusableCarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    slidesToShow?: number;
    slidesToScroll?: number;
    infinite?: boolean;
    speed?: number;
    responsive?: ResponsiveSetting[];
    className?: string;
    itemClassName?: string;
    containerClassName?: string;
}

export function ReusableCarousel<T = { id?: string | number }>(
    props: ReusableCarouselProps<T>
) {
    const {
        items,
        renderItem,
        slidesToShow = 4,
        slidesToScroll = 4,
        infinite = false,
        speed = 500,
        responsive = [
            { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
        ],
        className = "",
        itemClassName = "",
        containerClassName = "",
    } = props;

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
        responsive: responsive.map((breakpoint) => ({
            ...breakpoint,
            settings: {
                ...breakpoint.settings,
                slidesToShow: Math.min(breakpoint.settings.slidesToShow, items.length),
                slidesToScroll: Math.min(
                    breakpoint.settings.slidesToScroll,
                    items.length
                ),
            },
        })),
    };

    return (
        <section className={`p-2 ${containerClassName}`}>
            <Slider {...settings} className={className}>
                {items.map((item, index) => (
                    <div
                        key={(item as { id?: string | number })?.id ?? index}
                        className={`inline-block px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/6 ${itemClassName}`}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </Slider>
        </section>
    );
}
