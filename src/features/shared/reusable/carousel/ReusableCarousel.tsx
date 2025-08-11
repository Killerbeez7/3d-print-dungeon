import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slick-overrides.css";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
// import { useRef, useCallback } from "react";
import { defaultCarouselSettings } from "./carouselSettings";

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
        className = "",
        itemClassName = "",
        containerClassName = "",
        slidesToShow = defaultCarouselSettings.slidesToShow,
        slidesToScroll = defaultCarouselSettings.slidesToScroll,
        infinite = defaultCarouselSettings.infinite,
        speed = defaultCarouselSettings.speed,
        responsive = defaultCarouselSettings.responsive,
    } = props;

    // const sliderRef = useRef<Slider>(null);
    // const dragStartX = useRef<number>(0);
    // const dragDistance = useRef<number>(0);
    // const isDragging = useRef<boolean>(false);
    // const currentSlideRef = useRef<number>(0);

    const adjustedSlidesToShow = Math.min(slidesToShow, items.length);
    const adjustedSlidesToScroll = Math.min(slidesToScroll, items.length);

    // Calculate the nearest slide based on drag distance
    // const calculateNearestSlide = useCallback(
    //     (dragDistance: number, currentSlide: number) => {
    //         if (!sliderRef.current) return currentSlide;

    //         const slideWidth = 100 / adjustedSlidesToShow;
    //         const dragPercentage = (dragDistance / window.innerWidth) * 100;
    //         const slidesMoved = Math.round(dragPercentage / slideWidth);

    //         const currentGroup = Math.floor(currentSlide / adjustedSlidesToScroll);
    //         const slidesMovedInGroups = Math.round(slidesMoved / adjustedSlidesToScroll);
    //         const targetGroup = currentGroup - slidesMovedInGroups;

    //         let targetSlide = targetGroup * adjustedSlidesToScroll;

    //         if (!infinite) {
    //             targetSlide = Math.max(
    //                 0,
    //                 Math.min(targetSlide, items.length - adjustedSlidesToShow)
    //             );
    //         }

    //         return targetSlide;
    //     },
    //     [adjustedSlidesToShow, adjustedSlidesToScroll, infinite, items.length]
    // );

    // Handle mouse/touch events for drag detection
    // const handleMouseDown = useCallback(
    //     (e: React.MouseEvent | React.TouchEvent) => {
    //         if (!enableDrag) return;
    //         isDragging.current = true;
    //         const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    //         dragStartX.current = clientX;
    //         dragDistance.current = 0;
    //     },
    //     [enableDrag]
    // );

    // const handleMouseMove = useCallback(
    //     (e: React.MouseEvent | React.TouchEvent) => {
    //         if (!isDragging.current || !enableDrag) return;

    //         const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    //         dragDistance.current = dragStartX.current - clientX;
    //     },
    //     [enableDrag]
    // );

    // const handleMouseUp = useCallback(() => {
    //     if (!isDragging.current || !enableSnapToNearest || !enableDrag) {
    //         isDragging.current = false;
    //         return;
    //     }

    //     const currentSlide = currentSlideRef.current;
    //     const nearestSlide = calculateNearestSlide(dragDistance.current, currentSlide);

    //     const slideWidth = 100 / adjustedSlidesToShow;
    //     const minDragThreshold = slideWidth * 0.15;
    //     const dragPercentage = Math.abs((dragDistance.current / window.innerWidth) * 100);

    //     if (dragPercentage > minDragThreshold && nearestSlide !== currentSlide) {
    //         sliderRef.current?.slickGoTo(nearestSlide);
    //         currentSlideRef.current = nearestSlide;
    //     }

    //     isDragging.current = false;
    //     dragDistance.current = 0;
    // }, [enableSnapToNearest, enableDrag, calculateNearestSlide, adjustedSlidesToShow]);

    const settings = {
        infinite,
        speed,
        slidesToShow: adjustedSlidesToShow,
        slidesToScroll: adjustedSlidesToScroll,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        draggable: true,
        swipe: true,
        touchMove: true,
        swipeToSlide: false,
        touchThreshold: 10,
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
        <section
            className={`p-2 ${containerClassName}`}
            // onMouseDown={handleMouseDown}
            // onMouseMove={handleMouseMove}
            // onMouseUp={handleMouseUp}
            // onMouseLeave={handleMouseUp}
            // onTouchStart={handleMouseDown}
            // onTouchMove={handleMouseMove}
            // onTouchEnd={handleMouseUp}
        >
            {/* <Slider ref={sliderRef} {...settings} className={className}> */}
            <Slider {...settings} className={className}>
                {items.map((item, index) => (
                    <div
                        key={(item as { id?: string | number })?.id ?? index}
                        className={`inline-block px-2 ${itemClassName}`}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </Slider>
        </section>
    );
}
