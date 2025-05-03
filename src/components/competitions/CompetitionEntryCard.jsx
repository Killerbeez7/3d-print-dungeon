import PropTypes from "prop-types";

export const CompetitionEntryCard = ({ entry }) => (
  <div className="bg-[var(--bg-surface)] rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
    <img src={entry.imageUrl} alt={entry.userName} className="h-32 w-full object-cover" />
    <div className="p-3 flex-1 flex flex-col">
      <div className="font-semibold text-[var(--txt-primary)] mb-1">{entry.userName}</div>
      <div className="text-xs text-[var(--txt-secondary)] line-clamp-2">{entry.description}</div>
    </div>
  </div>
);

CompetitionEntryCard.propTypes = {
  entry: PropTypes.shape({
    imageUrl: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
}; 