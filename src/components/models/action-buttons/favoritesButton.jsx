import { useState, useEffect } from "react";
import { toggleFavorite, getFavoritesForUser } from "../../../services/favoritesService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

export const FavoritesButton = ({ modelId, currentUser, openAuthModal }) => {
    const [favorited, setFavorited] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if the model is favorited by the user
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (currentUser) {
                try {
                    const favs = await getFavoritesForUser(currentUser.uid);
                    setFavorited(favs.includes(modelId));
                } catch (error) {
                    console.error("Error checking favorite status:", error);
                }
            } else {
                setFavorited(false);
            }
        };
        checkFavoriteStatus();
    }, [modelId, currentUser]);

    const handleToggle = async () => {
        if (!currentUser) {
            openAuthModal && openAuthModal();
            return;
        }
        setLoading(true);
        try {
            const newStatus = await toggleFavorite(currentUser.uid, modelId);
            setFavorited(newStatus);
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center space-x-2">
            <div onClick={handleToggle} className="cursor-pointer">
                <FontAwesomeIcon
                    icon={favorited ? solidStar : regularStar}
                    className={
                        favorited ? "text-yellow-500 text-xl" : "text-gray-400 text-xl"
                    }
                />
            </div>
            <span className="text-sm">{favorited ? "Favorited" : "Favorite"}</span>
        </div>
    );
};
