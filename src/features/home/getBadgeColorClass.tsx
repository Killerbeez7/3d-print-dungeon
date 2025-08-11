export const getBadgeColorClass = (color?: string) => {
    switch (color) {
        case "primary":
            return "bg-primary text-white";
        case "secondary":
            return "bg-secondary text-white";
        case "accent":
            return "bg-accent text-white";
        case "success":
            return "bg-green-500 text-white";
        case "warning":
            return "bg-yellow-500 text-black";
        case "error":
            return "bg-red-500 text-white";
        default:
            return "bg-accent text-white";
    }
};