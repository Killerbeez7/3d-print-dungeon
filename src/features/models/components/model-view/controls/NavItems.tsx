import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationArrowProps {
  direction: "left" | "right";
  onClick: () => void;
}

export function NavigationArrow({ direction, onClick }: NavigationArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chamfer group absolute top-1/2 z-40 hidden size-10 -translate-y-1/2 items-center justify-center bg-scrim/55 text-on-scrim backdrop-blur-sm transition-colors duration-200 [--cut:8px] hover:bg-btn-primary md:flex ${
        direction === "left" ? "left-4" : "right-4"
      }`}
      aria-label={direction === "left" ? "Previous view" : "Next view"}
    >
      {direction === "left" ? (
        <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      ) : (
        <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
        className={`h-1 rounded-full transition-all duration-300 ${
          selectedIndex === -1 ? "w-6 bg-on-scrim" : "w-3 bg-on-scrim/45 hover:bg-on-scrim/70"
        }`}
        aria-label="View 3D model"
      />

      {Array.from({ length: totalItems }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          className={`h-1 rounded-full transition-all duration-300 ${
            selectedIndex === index ? "w-6 bg-on-scrim" : "w-3 bg-on-scrim/45 hover:bg-on-scrim/70"
          }`}
          aria-label={`View image ${index + 1}`}
        />
      ))}
    </div>
  );
}
