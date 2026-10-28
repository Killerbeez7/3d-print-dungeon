import { useFilters } from "@/features/search/hooks/useFilters";

export const AiToggleFilter = () => {
  const { filters, setFilters } = useFilters();
  const checked = filters.hideAI ?? false;

  return (
    <label className="inline-flex h-9 cursor-pointer select-none items-center gap-2.5 text-sm text-txt-secondary">
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        onChange={(event) =>
          setFilters({ ...filters, hideAI: event.target.checked ? true : undefined })
        }
      />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 rounded-full bg-br-input transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-page after:transition-transform after:duration-300 after:ease-forge peer-checked:bg-btn-primary peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
      />
      Hide AI-made
    </label>
  );
};
