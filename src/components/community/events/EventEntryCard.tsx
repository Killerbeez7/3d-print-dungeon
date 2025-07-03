interface EventEntryCardProps {
  entry: {
    imageUrl: string;
    userName: string;
    description: string;
  };
}

export const EventEntryCard = ({ entry }: EventEntryCardProps) => (
  <div className="bg-[var(--bg-surface)] rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
    <img src={entry.imageUrl} alt={entry.userName} className="h-32 w-full object-cover" />
    <div className="p-3 flex-1 flex flex-col">
      <div className="font-semibold text-[var(--txt-primary)] mb-1">{entry.userName}</div>
      <div className="text-xs text-[var(--txt-secondary)] line-clamp-2">{entry.description}</div>
    </div>
  </div>
);