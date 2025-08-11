export const defaultCarouselSettings = {
    slidesToShow: 5,
    slidesToScroll: 5,
    infinite: false,
    speed: 500,
    responsive: [
        { breakpoint: 1536, settings: { slidesToShow: 5, slidesToScroll: 5 } },
        { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 4 } },
        { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
        { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
        { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
    enableDrag: true,
    enableSnapToNearest: false,
};
