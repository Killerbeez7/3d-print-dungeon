import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { pickRandomModelId } from "@/features/models/services/modelsFetchService";
import { Die } from "@/features/shared/components/Die";
import { useSystemAlert } from "@/features/system-alerts";

// How long the die tumbles before the page changes (a throw lasts 1.1 s).
const THROW_MS = 1_000;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface RollButtonProps {
  /** Roll within this category; all models when omitted. */
  categoryId?: string;
  categoryName?: string;
}

/** "Roll for a model": throws the die and opens a random model. */
export const RollButton = ({ categoryId, categoryName }: RollButtonProps) => {
  const navigate = useNavigate();
  const { error } = useSystemAlert();
  const [signal, setSignal] = useState(0);
  const [rolling, setRolling] = useState(false);

  const roll = async () => {
    if (rolling) return;
    setRolling(true);
    setSignal((n) => n + 1);
    const wait = new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 0 : THROW_MS));
    try {
      const [id] = await Promise.all([pickRandomModelId(categoryId), wait]);
      if (id) navigate(`/model/${id}`);
      else
        error(
          categoryName ? `No ${categoryName.toLowerCase()} to roll for yet.` : "No models yet.",
        );
    } catch {
      error("Couldn't roll right now. Try again in a moment.");
    } finally {
      // Ready again, also when Back returns to a page that was kept alive.
      setRolling(false);
    }
  };

  const label = categoryName
    ? `Roll for a random ${categoryName.toLowerCase()} model`
    : "Roll for a random model";

  return (
    <button
      type="button"
      onClick={roll}
      disabled={rolling}
      aria-label={label}
      title={label}
      className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-medium text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary disabled:cursor-wait"
    >
      <Die edge={12} rollSignal={signal} />
      <span className="max-sm:sr-only">Roll</span>
    </button>
  );
};
