import { CompetitionsHome } from "@/components/competitions/CompetitionsHome";
import { CompetitionDetails } from "@/components/competitions/CompetitionDetails";

// Placeholder for CompetitionEntryForm
const CompetitionEntryForm = () => (
  <div className="max-w-xl mx-auto py-8 text-center">
    <h2 className="text-2xl font-bold mb-4">Competition Entry Form</h2>
    <p className="text-[var(--txt-secondary)]">(Form coming soon...)</p>
  </div>
);

export const competitionsRoutes = [
  {
    path: "/competitions",
    children: [
      { index: true, element: <CompetitionsHome /> },
      { path: ":competitionId", element: <CompetitionDetails /> },
      { path: ":competitionId/enter", element: <CompetitionEntryForm /> },
      // Optionally: { path: "my-entries", element: <MyCompetitionEntries /> },
    ],
  },
]; 