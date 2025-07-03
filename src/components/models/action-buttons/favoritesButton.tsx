import { useState, useEffect } from "react";
import { toggleFavorite, getFavoritesForUser } from "../../../services/favoritesService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

/**
 * Minimal user type for favorites button context
 */
export interface FavoritesButtonUser {
    uid: string;
    [key: string]: unknown;
}

/**
 * Props for FavoritesButton component
 */
export interface FavoritesButtonProps {
    modelId: string;
    currentUser?: FavoritesButtonUser | null;
    openAuthModal?: () => void;
}

/**
 * FavoritesButton component
 * Allows users to favorite/unfavorite a model and displays the status.
 */
export const FavoritesButton = ({ modelId, currentUser, openAuthModal }: FavoritesButtonProps) => {
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
            if (openAuthModal) openAuthModal();
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