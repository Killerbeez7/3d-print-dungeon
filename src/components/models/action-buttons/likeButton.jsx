import { useState, useEffect } from "react";
import { toggleLike, isLiked } from "../../../services/likesService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import PropTypes from "prop-types";

export const LikeButton = ({ modelId, initialLikes, currentUser, openAuthModal }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikes || 0);

    // Check user like status
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

    const handleToggle = async () => {
        if (!currentUser) {
            console.log("No current user");
            openAuthModal && openAuthModal();
            return;
        }
        try {
            const newStatus = await toggleLike(modelId, currentUser.uid);
            setLiked(newStatus);
            setLikesCount((prev) => (newStatus ? prev + 1 : prev - 1));
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const formatLikesCount = (count) => (count === 1 ? "1 Like" : `${count} Likes`);

    return (
        <div className="flex items-center space-x-2">
            <div onClick={handleToggle} className="cursor-pointer">
                <FontAwesomeIcon
                    icon={liked ? solidHeart : regularHeart}
                    className={liked ? "text-red-500 text-xl" : "text-gray-400 text-xl"}
                />
            </div>
            <span className="text-sm">{formatLikesCount(likesCount)}</span>
        </div>
    );
};

LikeButton.propTypes = {
    modelId: PropTypes.string.isRequired,
    initialLikes: PropTypes.number,
    currentUser: PropTypes.object,
    openAuthModal: PropTypes.func,
};
