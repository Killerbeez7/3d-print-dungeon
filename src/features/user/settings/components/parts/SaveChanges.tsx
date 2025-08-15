interface SaveChangesProps {
    hasChanges: boolean;
    loading: boolean;
    onSave: () => void;
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
    resetText = "Reset"
}: SaveChangesProps) => {
    if (!hasChanges) return null;

    return (
        <div className="flex justify-end gap-2 pt-4">
            <button
                onClick={onReset}
                disabled={loading}
                className="px-4 py-2 text-sm border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50"
            >
                {resetText}
            </button>
            <button
                onClick={onSave}
                disabled={loading}
                className="px-4 py-2 cta-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Saving..." : saveText}
            </button>
        </div>
    );
};
