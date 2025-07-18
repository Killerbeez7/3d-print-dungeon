interface AuthButtonsProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
    isLoading: boolean;
}

export const AuthButtons = ({ onLoginClick, onSignUpClick, isLoading }: AuthButtonsProps) => {
    if (isLoading) {
        return (
            <div className="hidden md:flex items-center space-x-4 animate-pulse">
                <div className="bg-gray-300 rounded-full h-7 w-7"></div>
                <div className="bg-gray-300 rounded-full h-7 w-7"></div>
                <div className="bg-gray-300 rounded-full h-7 w-7"></div>
            </div>
        )
    }
    return (
        <>
            {/* Desktop Version */}
            <div className="hidden md:flex items-center space-x-4">
                <button className="cta-button px-4 py-1.5" onClick={onLoginClick}>
                    Sign In
                </button>
                <button className="secondary-button px-4 py-1.5" onClick={onSignUpClick}>
                    Sign Up
                </button>
            </div>

            {/* Mobile Version */}
            <div className="md:hidden flex flex-row gap-2">
                <button className="cta-button px-4 py-1.5 text-sm" onClick={onLoginClick}>
                    Sign In
                </button>
            </div>
        </>
    );
};
