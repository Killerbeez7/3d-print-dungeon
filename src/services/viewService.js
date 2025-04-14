import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, Timestamp, increment } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { useEffect } from 'react';
import { useAuth } from "../contexts/authContext";

const VIEW_COOLDOWN_MINUTES = 30; // Cooldown period in minutes
const ANONYMOUS_USER_KEY = 'anonymous_user_id';
const ANONYMOUS_DOC_ID = 'anonymous_views';

/**
 * Get or create a unique anonymous user ID
 * @returns {string} The anonymous user ID
 */
const getAnonymousUserId = () => {
    let anonymousId = localStorage.getItem(ANONYMOUS_USER_KEY);
    if (!anonymousId) {
        // Generate a new UUID v4
        anonymousId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem(ANONYMOUS_USER_KEY, anonymousId);
    }
    return anonymousId;
};

/**
 * Check if user has recently viewed the model
 */
const hasRecentView = async (modelId, userId) => {
    try {
        const viewsRef = collection(db, 'viewTrackers');
        const timeThreshold = Timestamp.fromDate(new Date(Date.now() - VIEW_COOLDOWN_MINUTES * 60 * 1000));

        const q = query(
            viewsRef,
            where('modelId', '==', modelId),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return false;

        // Check if any of the views are within the cooldown period
        return querySnapshot.docs.some(doc => {
            const data = doc.data();
            const viewTimestamp = data.timestamp;
            if (!viewTimestamp) return false;
            return viewTimestamp.toMillis() > timeThreshold.toMillis();
        });
    } catch (error) {
        console.error('Error checking recent views:', error);
        return false;
    }
};

/**
 * Track a view for a specific model
 * @param {string} modelId - The ID of the model being viewed
 */
export const trackView = async (modelId) => {
    try {
        const user = auth.currentUser;
        const userId = user ? user.uid : ANONYMOUS_DOC_ID;
        const userDisplayName = user ? (user.displayName || user.email || 'Unknown User') : 'Anonymous';
        const timestamp = new Date().getTime();
        const viewId = `${modelId}_${userId}_${timestamp}`;

        // Check for recent views
        const hasRecent = await hasRecentView(modelId, userId);
        if (hasRecent) {
            console.log('Recent view exists, skipping...');
            return false;
        }

        // For anonymous users, we'll use a single document with a counter
        if (!user) {
            const anonymousRef = doc(db, 'viewTrackers', ANONYMOUS_DOC_ID);
            await setDoc(anonymousRef, {
                modelId,
                userId: ANONYMOUS_DOC_ID,
                userDisplayName: 'Anonymous',
                timestamp: serverTimestamp(),
                isAnonymous: true,
                viewCount: increment(1),
                lastViewerId: getAnonymousUserId() // Store the last viewer's ID for reference
            }, { merge: true });
        } else {
            // For logged-in users, create individual documents
            await setDoc(doc(db, 'viewTrackers', viewId), {
                modelId,
                userId,
                userDisplayName,
                timestamp: serverTimestamp(),
                isAnonymous: false
            });
        }
        
        console.log(`View tracked for model ${modelId} by user ${userDisplayName}`);
        return true;
    } catch (error) {
        console.error('Error tracking view:', error);
        throw error;
    }
};

/**
 * Hook to track views of a model
 * @param {string} modelId - The ID of the model to track
 */
export const useViewTracker = (modelId) => {
    const { user } = useAuth();
    
    useEffect(() => {
        if (modelId) {
            trackView(modelId).catch(console.error);
        }
    }, [modelId, user]);
}; 