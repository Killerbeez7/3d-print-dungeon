import { Link } from "react-router-dom";

interface Competition {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  status: "ongoing" | "upcoming" | "ended";
  prizes: string;
}

const mockCompetitions: Competition[] = [
  {
    id: "spring2024",
    title: "Spring 2024 Print-Off",
    description: "Show off your best spring-themed 3D print!",
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    status: "ongoing",
    prizes: "1st: $100 Filament Voucher, 2nd: $50, 3rd: $25",
  },
  {
    id: "summer2024",
    title: "Summer Maker Challenge",
    description: "Create something useful for summer!",
    bannerUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    status: "upcoming",
    prizes: "1st: 3D Printer, 2nd: $100, 3rd: $50",
  },
  {
    id: "retro2023",
    title: "Retro Print Throwback",
    description: "Print something inspired by the 80s or 90s!",
    bannerUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    startDate: "2023-11-01",
    endDate: "2023-11-30",
    status: "ended",
    prizes: "1st: $200, 2nd: $100, 3rd: $50",
  },
];

const statusColors: Record<Competition["status"], string> = {
  ongoing: "bg-green-100 text-green-700",
  upcoming: "bg-yellow-100 text-yellow-700",
  ended: "bg-gray-200 text-gray-500",
};

export const CompetitionsHome = () => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Competitions & Events</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockCompetitions.map((comp) => (
          <div key={comp.id} className="bg-[var(--bg-surface)] rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
            <img src={comp.bannerUrl} alt={comp.title} className="h-40 w-full object-cover" />
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-bold text-xl mb-2 text-[var(--txt-primary)]">{comp.title}</h2>
              <div className="mb-2 text-sm text-[var(--txt-secondary)] line-clamp-2">{comp.description}</div>
              <div className="mb-2 text-xs text-[var(--txt-muted)]">{comp.startDate} - {comp.endDate}</div>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${statusColors[comp.status]}`}>{comp.status}</div>
              <div className="text-xs text-[var(--txt-highlight)] mb-2">Prizes: {comp.prizes}</div>
              <Link
                to={`/competitions/${comp.id}`}
                className="mt-auto inline-block px-4 py-2 rounded bg-[var(--accent)] text-[var(--txt-highlight)] font-semibold hover:bg-[var(--accent-hover)] text-center"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 