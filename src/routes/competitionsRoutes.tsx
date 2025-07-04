import { CompetitionsHome } from "@/components/community/competitions/CompetitionsHome";
import { CompetitionDetails } from "@/components/community/competitions/CompetitionDetails";
import { CompetitionEntryForm } from "@/components/community/competitions/CompetitionEntryForm";
import type { RouteObject } from "react-router-dom";

export const competitionsRoutes: RouteObject[] = [
    {
        path: "/competitions",
        children: [
            { index: true, element: <CompetitionsHome /> },
            { path: ":competitionId", element: <CompetitionDetails /> },
            { path: ":competitionId/enter", element: <CompetitionEntryForm /> },
            //optionally: { path: ":competitionId/entries", element: <MyCompetitionEntries /> },
        ],
    },
];
