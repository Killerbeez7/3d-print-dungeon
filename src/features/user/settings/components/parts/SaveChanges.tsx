import { Button } from "@/components";

interface SaveChangesProps {
  hasChanges: boolean;
  loading: boolean;
  onSave: () => void | Promise<void>;
  onReset: () => void;
  saveText?: string;
  resetText?: string;
}

export const SaveChanges = ({
  hasChanges,
  loading,
  onSave,
  onReset,
  saveText = "Save Changes",
  resetText = "Reset",
}: SaveChangesProps) => {
  if (!hasChanges) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-10 flex justify-end gap-2 rounded-xl border border-br-secondary bg-surface-elevated/95 p-3 shadow-popover backdrop-blur">
      <Button variant="ghost" onClick={onReset} disabled={loading}>
        {resetText}
      </Button>

      <Button onClick={onSave} isLoading={loading}>
        {loading ? "Saving…" : saveText}
      </Button>
    </div>
  );
};
