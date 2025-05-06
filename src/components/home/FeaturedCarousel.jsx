import { Link } from "react-router-dom";
import { ReusableCarousel } from "../shared/carousel/ReusableCarousel";
import PropTypes from "prop-types";

export const FeaturedCarousel = ({ items, itemHeight = 250, slidesToShow = 4 }) => {
    const renderItem = (item) => (
        <Link to={item.link} target="_blank" rel="noopener noreferrer">
            <div className="relative overflow-hidden rounded-xl group">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full object-cover rounded-xl"
                    style={{ height: itemHeight }}
                    onError={(e) => {
                        console.error(`Failed to load image: ${item.image}`);
                        e.target.src = "/assets/images/default-image.png"; // Fallback image
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="text-center">
                        <h3 className="text-white text-xl font-bold mb-1">
                            {item.title}
                        </h3>
                        <p className="text-white text-xs mb-2">{item.subtitle}</p>
                        {item.badge && (
                            <div className="inline-block bg-white text-black text-xs font-semibold px-2 py-1 rounded-full">
                                {item.badge}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <ReusableCarousel
            items={items}
            renderItem={renderItem}
            slidesToShow={slidesToShow}
            slidesToScroll={slidesToShow}
            infinite={false}
            speed={500}
        />
    );
};

FeaturedCarousel.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            subtitle: PropTypes.string,
            badge: PropTypes.string,
            image: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired,
        })
    ).isRequired,
    itemHeight: PropTypes.number,
    slidesToShow: PropTypes.number,
};
