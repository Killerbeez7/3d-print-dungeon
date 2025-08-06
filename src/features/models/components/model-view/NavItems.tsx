import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

// Navigation Arrow
interface NavigationArrowProps {
    direction: "left" | "right";
    onClick: () => void;
}
export const NavigationArrow = ({ direction, onClick }: NavigationArrowProps) => (
    <button
        onClick={onClick}
        className={`absolute ${
            direction === "left" ? "left-4" : "right-4"
        } top-1/2 transform -translate-y-1/2 flex items-center justify-center w-[35px] h-[35px] rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 z-40 group invisible md:visible`}
        aria-label={direction === "left" ? "Previous view" : "Next view"}
        type="button"
    >
        {direction === "left" ? (
            <FaArrowLeft className="text-white text-xl group-hover:scale-110 transition-transform" />
        ) : (
            <FaArrowRight className="text-white text-xl group-hover:scale-110 transition-transform" />
        )}
    </button>
);

// Navigation Dots
interface NavigationDotsProps {
    selectedIndex: number;
    totalItems: number;
    onSelect: (index: number) => void;
}
export const NavigationDots = ({
    selectedIndex,
    totalItems,
    onSelect,
}: NavigationDotsProps) => (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-40 invisible md:visible">
        <button
            onClick={() => onSelect(-1)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
                selectedIndex === -1
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label="View 3D model"
            type="button"
        />
        {Array.from({ length: totalItems }, (_, index) => (
            <button
                key={index}
                onClick={() => onSelect(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                    selectedIndex === index
                        ? "bg-white scale-110"
                        : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`View image ${index + 1}`}
                type="button"
            />
        ))}
    </div>
);
