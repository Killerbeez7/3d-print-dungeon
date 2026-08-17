import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface NavigationArrowProps {
  direction: "left" | "right";
  onClick: () => void;
}

export function NavigationArrow({ direction, onClick }: NavigationArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group absolute top-1/2 z-40 hidden size-[35px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 transition-colors duration-200 hover:bg-black/70 md:flex ${
        direction === "left" ? "left-4" : "right-4"
      }`}
      aria-label={direction === "left" ? "Previous view" : "Next view"}
    >
      {direction === "left" ? (
        <FaArrowLeft
          className="text-xl text-white transition-transform group-hover:scale-110"
          aria-hidden="true"
        />
      ) : (
        <FaArrowRight
          className="text-xl text-white transition-transform group-hover:scale-110"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

interface NavigationDotsProps {
  selectedIndex: number;
  totalItems: number;
  onSelect: (index: number) => void;
}

export function NavigationDots({
  selectedIndex,
  totalItems,
  onSelect,
}: NavigationDotsProps) {
  return (
    <div className="absolute top-4 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 md:flex">
      <button
        type="button"
        onClick={() => onSelect(-1)}
        className={`size-2.5 rounded-full transition-all ${
          selectedIndex === -1 ? "scale-110 bg-white" : "bg-white/50 hover:bg-white/70"
        }`}
        aria-label="View 3D model"
      />

      {Array.from({ length: totalItems }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          className={`size-2.5 rounded-full transition-all ${
            selectedIndex === index
              ? "scale-110 bg-white"
              : "bg-white/50 hover:bg-white/70"
          }`}
          aria-label={`View image ${index + 1}`}
        />
      ))}
    </div>
  );
}
