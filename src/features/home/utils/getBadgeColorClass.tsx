export const getBadgeColorClass = (color?: string) => {
    switch (color) {
        case "primary":
            return "bg-accent/85 text-btn-primary-text border border-accent-hover/30 shadow-accent-sm";
        case "secondary":
            return "bg-bg-inverse/65 text-txt-inverse border border-br-subtle/25";
        case "accent":
            return "bg-accent-soft/90 text-accent-text border border-accent/30";
        case "success":
            return "bg-bg-inverse/70 text-txt-inverse border border-br-subtle/25";
        case "warning":
            return "bg-bg-inverse/70 text-txt-inverse border border-br-subtle/25";
        case "error":
            return "bg-bg-inverse/70 text-txt-inverse border border-br-subtle/25";
        default:
            return "bg-bg-inverse/70 text-txt-inverse border border-br-subtle/25";
    }
};
