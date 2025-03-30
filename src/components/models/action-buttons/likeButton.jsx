import { useState, useEffect } from "react";
import { toggleLike, isLiked } from "../../../services/likesService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

export const LikeButton = ({ modelId, initialLikes, currentUser, openAuthModal }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikes || 0);
    const [loading, setLoading] = useState(false);

    // Check if the user already liked the model
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (currentUser) {
                try {
                    const status = await isLiked(modelId, currentUser.uid);
                    setLiked(status);
                } catch (error) {
                    console.error("Error checking like status:", error);
                }
            } else {
                setLiked(false);
            }
        };
        checkLikeStatus();
    }, [modelId, currentUser]);

    const formatLikeCount = (count) => (count === 1 ? "1 Like" : `${count} Likes`);

    const handleToggle = async () => {
        if (!currentUser) {
            openAuthModal && openAuthModal();
            return;
        }
        setLoading(true);
        try {
            const newStatus = await toggleLike(modelId, currentUser.uid);
            setLiked(newStatus);
            setLikeCount((prev) => (newStatus ? prev + 1 : prev - 1));
        } catch (error) {
            console.error("Error toggling like:", error);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center space-x-2">
            <div onClick={handleToggle} className="cursor-pointer">
                <FontAwesomeIcon
                    icon={liked ? solidHeart : regularHeart}
                    className={liked ? "text-red-500 text-xl" : "text-gray-400 text-xl"}
                />
            </div>
            <span className="text-sm">{formatLikeCount(likeCount)}</span>
        </div>
    );
};
