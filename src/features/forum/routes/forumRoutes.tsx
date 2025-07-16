import { ForumProvider } from "@/features/forum/providers/forumProvider";
import { withProtectedMaintenance } from "@/helpers/routeHelpers";
import type { RouteObject } from "react-router-dom";

//components
import { ForumLayout } from "../components/ForumLayout";
import { ForumHome } from "../pages/ForumHome";
import { ForumCategory } from "../components/ForumCategory";
import { ForumThread } from "../components/ForumThread";
import { ForumDashboard } from "../components/ForumDashboard";
import { ForumMyThreads } from "../components/ForumMyThreads";
import { ForumRules } from "@/features/forum/components/ForumRules";
import { ForumHelp } from "@/features/forum/components/ForumHelp";

// Route constants
const FORUM_ROUTES = {
    FORUM: "/forum",
    FORUM_CATEGORY: "/forum/category/:categoryId",
    FORUM_THREAD: "/forum/thread/:threadId",
    FORUM_NEW_THREAD: "/forum/new-thread",
    FORUM_THREAD_EDIT: "/forum/thread/:threadId/edit",
    FORUM_REPLY_EDIT: "/forum/reply/:replyId/edit",
};

export const forumRoutes: RouteObject[] = [
    {
        path: FORUM_ROUTES.FORUM,
        element: (
            <ForumProvider>
                <ForumLayout />
            </ForumProvider>
        ),
        children: [
            { index: true, element: <ForumHome /> },
            { path: "category/:categoryId", element: <ForumCategory /> },
            { path: "thread/:threadId", element: <ForumThread /> },
            { path: "dashboard", element: <ForumDashboard /> },
            { path: "my-threads", element: <ForumMyThreads /> },
            { path: "rules", element: <ForumRules /> },
            { path: "help", element: <ForumHelp /> },
            {
                path: "new-thread",
                element: withProtectedMaintenance(<ForumThread isNew />),
            },
            {
                path: "thread/:threadId/edit",
                element: withProtectedMaintenance(<ForumThread />),
            },
        ],
    },
];
