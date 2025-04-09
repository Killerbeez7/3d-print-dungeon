import { ForumHome } from "../components/forum/ForumHome";
import { ForumThread } from "../components/forum/ForumThread";
import { ForumCategory } from "../components/forum/ForumCategory";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";

export const forumRoutes = [
    {
        path: "/forum",
        element: <ForumHome />
    },
    {
        path: "/forum/category/:categoryId",
        element: <ForumCategory />
    },
    {
        path: "/forum/thread/:threadId",
        element: <ForumThread />
    },
    {
        path: "/forum/new-thread",
        element: (
            <ProtectedRoute>
                <ForumThread isNew={true} />
            </ProtectedRoute>
        )
    }
]; 