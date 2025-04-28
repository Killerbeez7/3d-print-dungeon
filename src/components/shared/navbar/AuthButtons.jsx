import PropTypes from "prop-types";

export const AuthButtons = ({ onLoginClick, onSignUpClick }) => {
    return (
        <>
            {/* Desktop Version */}
            <div className="hidden md:flex items-center space-x-4">
                <button
                    className="cta-gradient font-medium px-4 py-1.5 rounded-lg text-md"
                    onClick={onLoginClick}
                >
                    Sign In
                </button>
                <button
                    className="bg-btn-secondary text-txt-primary font-medium px-4 py-1.5 rounded-lg hover:bg-btn-secondary-hover text-md"
                    onClick={onSignUpClick}
                >
                    Sign Up
                </button>
            </div>

            {/* Mobile Version */}
            <div className="md:hidden flex flex-row gap-2">
                <button
                    className="cta-gradient font-small px-2 py-1 rounded-lg text-sm"
                    onClick={onLoginClick}
                >
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
