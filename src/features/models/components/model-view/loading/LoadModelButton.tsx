import { FiBox } from "react-icons/fi";

interface LoadModelButtonProps {
  handleLoadModel: () => void;
}

export const LoadModelButton = ({ handleLoadModel }: LoadModelButtonProps) => {
  return (
    <>
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <button
          type="button"
          onClick={handleLoadModel}
          className="group inline-flex items-center justify-center gap-3 rounded-lg bg-linear-to-br from-accent-dark to-btn-primary px-8 py-4 font-semibold text-btn-primary-text shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:from-btn-primary hover:to-btn-primary-hover hover:shadow-xl"
        >
          <FiBox
            className="size-6 transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          />

          <span>Load 3D Model</span>
        </button>
      </div>
    </>
  );
};
