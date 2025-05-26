import PropTypes from "prop-types";

export const AuthButtons = ({ onLoginClick, onSignUpClick }) => {
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

AuthButtons.propTypes = {
    onLoginClick: PropTypes.func.isRequired,
    onSignUpClick: PropTypes.func.isRequired,
};
