import { ForumLayout } from "../components/forum/ForumLayout";
import { ForumHome } from "../components/forum/ForumHome";
import { ForumCategory } from "../components/forum/ForumCategory";
import { ForumThread } from "../components/forum/ForumThread";
import { withProtectedMaintenance } from "../helpers/routeHelpers";

export const forumRoutes = [
    {
        path: "/community/forum",
        element: withProtectedMaintenance(<ForumLayout />, {
            requireAdmin: false,
            authRedirect: "/login",
            maintenanceRedirect: "/maintenance",
            fallback: null
        }),
        children: [
            { path: "", element: <ForumHome /> },
            { path: "category/:categoryId", element: <ForumCategory /> },
            { path: "thread/:threadId", element: <ForumThread /> },
            { 
                path: "new-thread", 
                element: withProtectedMaintenance(<ForumThread isNew={true} />, {
                    requireAdmin: false,
                    authRedirect: "/login",
                    maintenanceRedirect: "/maintenance",
                    fallback: null
                })
            },
        ],
    },
];
