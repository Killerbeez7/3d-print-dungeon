import { useNavigate } from "react-router-dom";
import { CompetitionCard } from "./CompetitionCard";

const competitions = [
  {
    id: "comp1",
    title: "Spring 3D Print Challenge",
    imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    status: "ongoing",
  },
  {
    id: "comp2",
    title: "Miniatures Mastery",
    imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    status: "upcoming",
  },
  {
    id: "comp3",
    title: "Summer Print-Off",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    status: "completed",
  },
];

export const CompetitionsHome = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Competitions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {competitions.map((comp) => (
          <CompetitionCard
            key={comp.id}
            competition={comp}
            onClick={() => navigate(`/competitions/${comp.id}`)}
          />
        ))}
      </div>
    </div>
  );
}; 