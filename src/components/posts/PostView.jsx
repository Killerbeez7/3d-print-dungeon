import { useEffect } from "react";
import { useViewTracker } from "../../services/viewService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useState } from "react";
import PropTypes from "prop-types";

export const PostView = ({ postId }) => {
    const { trackView } = useViewTracker();
    const [viewCount, setViewCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Track view when component mounts
    useEffect(() => {
        trackView(postId);
    }, [postId, trackView]);

    // Listen to view count changes
    useEffect(() => {
        const postRef = doc(db, 'posts', postId);
        const unsubscribe = onSnapshot(postRef, (doc) => {
            if (doc.exists()) {
                setViewCount(doc.data().viewCount || 0);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [postId]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="post-view">
            <div className="view-count">
                Views: {viewCount}
            </div>
            {/* Rest of your post content */}
        </div>
    );
};

PostView.propTypes = {
    postId: PropTypes.string.isRequired
}; 