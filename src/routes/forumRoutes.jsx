import { ForumProvider } from "@/providers/forumProvider";
import { withProtectedMaintenance } from "@/helpers/routeHelpers";

//components
import { ForumLayout } from "@/components/community/forum/ForumLayout";
import { ForumHome } from "@/components/community/forum/ForumHome";
import { ForumCategory } from "@/components/community/forum/ForumCategory";
import { ForumThread } from "@/components/community/forum/ForumThread";
import { ForumDashboard } from "@/components/community/forum/ForumDashboard";
import { ForumMyThreads } from "@/components/community/forum/ForumMyThreads";
import { ForumRules } from "@/components/community/forum/tabs/ForumRules";
import { ForumHelp } from "@/components/community/forum/tabs/ForumHelp";

// Route constants
const FORUM_ROUTES = {
    FORUM: "/forum",
    FORUM_CATEGORY: "/forum/category/:categoryId",
    FORUM_THREAD: "/forum/thread/:threadId",
    FORUM_NEW_THREAD: "/forum/new-thread",
    FORUM_THREAD_EDIT: "/forum/thread/:threadId/edit",
    FORUM_REPLY_EDIT: "/forum/reply/:replyId/edit",
};

export const forumRoutes = [
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
                element: withProtectedMaintenance(<ForumThread isNew />, {
                    redirectTo: "/login",
                }),
            },
            {
                path: "thread/:threadId/edit",
                element: withProtectedMaintenance(<ForumThread isEdit />, {
                    redirectTo: "/login",
                }),
            },
        ],
    },
];
