import { ForumHome } from "../components/forum/ForumHome";
import { ForumThread } from "../components/forum/ForumThread";
import { ForumCategory } from "../components/forum/ForumCategory";
import { withProtectedMaintenance } from "../helpers/routeHelpers";

export const forumRoutes = [
    {
        path: "/forum",
        element: withProtectedMaintenance(<ForumHome />),
        children: [
            { path: "", element: <ForumHome /> },
            { path: "category/:categoryId", element: <ForumCategory /> },
            { path: "thread/:threadId", element: <ForumThread /> },
            { path: "new-thread", element: <ForumThread isNew={true} /> },
        ],
    },
];
