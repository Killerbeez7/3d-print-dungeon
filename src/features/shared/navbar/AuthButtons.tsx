import { Button } from "@/components";
import { LogIn, UserPlus } from "lucide-react";

interface AuthButtonsProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
    isLoading: boolean;
}

export const AuthButtons = ({ onLoginClick, onSignUpClick, isLoading }: AuthButtonsProps) => {
    if (isLoading) {
        return (
            <div
                className="hidden md:flex items-center space-x-3 animate-pulse"
                role="status"
                aria-label="Loading authentication actions"
            >
                <span className="sr-only">Loading authentication actions</span>
                <div className="bg-bg-muted rounded-md h-8 w-20" aria-hidden="true"></div>
                <div className="bg-bg-muted rounded-md h-8 w-20" aria-hidden="true"></div>
            </div>
        );
    }
    return (
        <>
            {/* Desktop Version */}
            <div className="hidden md:flex items-center gap-3">
                <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
                    onClick={onSignUpClick}
                >
                    Sign Up
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<LogIn className="h-4 w-4" aria-hidden="true" />}
                    onClick={onLoginClick}
                >
                    Sign In
                </Button>
            </div>

            {/* Mobile Version */}
            <div className="md:hidden flex flex-row gap-2">
                <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<LogIn className="h-4 w-4" aria-hidden="true" />}
                    onClick={onLoginClick}
                >
                    Sign In
                </Button>
            </div>
        </>
    );
};
