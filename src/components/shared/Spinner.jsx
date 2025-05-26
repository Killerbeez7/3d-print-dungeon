import PropTypes from "prop-types";

export function Spinner({ size = 24, className = "" }) {
    const ring = `${size}px`;
    const thickness = size / 8;

    return (
        <span
            className={`inline-block animate-spin ${className}`}
            style={{
                width: ring,
                height: ring,
                borderStyle: "solid",
                borderWidth: thickness,
                borderColor: "var(--bg-primary)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
            }}
            role="status"
            aria-label="Loading"
        />
    );
}

Spinner.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
};
