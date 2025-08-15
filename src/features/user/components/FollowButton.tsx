import { useState } from "react";
import { useFollow } from "@/features/user/hooks/useFollow";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface FollowButtonProps {
    targetUserId: string;
    targetUserName?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "outline";
    showCount?: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
    openAuthModal?: () => void;
}

export const FollowButton = ({
    targetUserId,
    targetUserName,
    className = "",
    size = "md",
    variant = "primary",
    showCount = false,
    onFollowChange,
    openAuthModal,
}: FollowButtonProps) => {
    const { currentUser } = useAuth();
    const { isFollowing, followersCount, loading, error, toggleFollow, canFollow } = useFollow(targetUserId);
    const [localLoading, setLocalLoading] = useState(false);

    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
    } as const;
    const variantClasses = {
        primary: "bg-accent hover:bg-accent-hover text-white",
        secondary: "bg-bg-secondary hover:bg-bg-tertiary text-txt-primary",
        outline: "border border-br-primary hover:bg-bg-secondary text-txt-primary",
    } as const;

    const handleClick = async () => {
        if (!currentUser) {
            if (openAuthModal) openAuthModal();
            return;
        }
        if (!canFollow) return;
        setLocalLoading(true);
        try {
            await toggleFollow();
            onFollowChange?.(!isFollowing);
        } finally {
            setLocalLoading(false);
        }
    };

    if (!canFollow) return null;
    const isBusy = loading || localLoading;

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleClick}
                disabled={isBusy}
                className={`
                    flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200
                    ${sizeClasses[size]}
                    ${variantClasses[variant]}
                    ${isBusy ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                    ${className}
                `}
                title={isFollowing ? `Unfollow ${targetUserName || "user"}` : `Follow ${targetUserName || "user"}`}
            >
                <span>{isFollowing ? "Following" : "Follow"}</span>
            </button>
            {showCount && (
                <span className="text-xs text-txt-secondary mt-1">
                    {followersCount} {followersCount === 1 ? "follower" : "followers"}
                </span>
            )}
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
};


