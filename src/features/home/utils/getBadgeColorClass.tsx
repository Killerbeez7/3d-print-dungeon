export const getBadgeColorClass = (color?: string) => {
    switch (color) {
        case "primary":
            return "bg-gradient-to-r from-accent-dark to-accent text-btn-primary-text shadow-accent-sm";
        case "secondary":
            return "bg-btn-secondary text-txt-primary border border-br-secondary";
        case "accent":
            return "bg-accent-soft text-accent-text border border-accent/30 shadow-accent-sm";
        case "success":
            return "bg-success text-txt-inverse";
        case "warning":
            return "bg-warning text-txt-inverse";
        case "error":
            return "bg-error text-txt-inverse";
        default:
            return "bg-accent-soft text-accent-text border border-accent/30 shadow-accent-sm";
    }
};
