import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slick-overrides.css";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
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
      background: "var(--surface-overlay)",
      border: "1px solid var(--br-subtle)",
      borderRadius: "50%",
      width: "35px",
      height: "35px",
      right: "10px",
      zIndex: 2,
      cursor: "pointer",
      backdropFilter: "blur(8px)",
    }}
    onClick={onClick}
  >
    <FaArrowRight className="text-xl text-white" />
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
      background: "var(--surface-overlay)",
      border: "1px solid var(--br-subtle)",
      borderRadius: "50%",
      width: "35px",
      height: "35px",
      left: "10px",
      zIndex: 2,
      cursor: "pointer",
      backdropFilter: "blur(8px)",
    }}
    onClick={onClick}
  >
    <FaArrowLeft className="text-xl text-white" />
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

  const adjustedSlidesToShow = Math.min(slidesToShow, items.length);
  const adjustedSlidesToScroll = Math.min(slidesToScroll, items.length);

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
        slidesToScroll: Math.min(breakpoint.settings.slidesToScroll, items.length),
      },
    })),
  };

  return (
    <section className={`py-1 ${containerClassName || "px-2"}`}>
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
