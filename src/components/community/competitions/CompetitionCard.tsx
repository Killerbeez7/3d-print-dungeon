interface CompetitionCardProps {
  competition: {
    id: string;
    title: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  onClick?: (id: string) => void;
}

export const CompetitionCard = ({ competition, onClick }: CompetitionCardProps) => (
  <div
    className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
    onClick={() => onClick?.(competition.id)}
    tabIndex={0}
    role="button"
    aria-label={`View details for ${competition.title}`}
    onKeyDown={e => {
      if (e.key === "Enter" || e.key === " ") onClick?.(competition.id);
    }}
  >
    <img src={competition.imageUrl} alt={competition.title} className="h-40 w-full object-cover" />
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">{competition.title}</h3>
      <div className="text-sm text-gray-500 mb-1">
        {competition.startDate} – {competition.endDate}
      </div>
      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${competition.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
        {competition.status}
      </span>
    </div>
  </div>
); 