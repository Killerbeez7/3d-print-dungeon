import { ForumLayout } from "../components/forum/ForumLayout";
import { ForumHome } from "../components/forum/ForumHome";
import { ForumCategory } from "../components/forum/ForumCategory";
import { ForumThread } from "../components/forum/ForumThread";
import { ForumProvider } from "../contexts/forumContext";
import { withProtectedMaintenance } from "../helpers/routeHelpers";

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
      { 
        path: "new-thread", 
        element: withProtectedMaintenance(<ForumThread isNew />, { 
          redirectTo: "/login"
        }) 
      },
      { 
        path: "thread/:threadId/edit", 
        element: withProtectedMaintenance(<ForumThread isEdit />, { 
          redirectTo: "/login"
        }) 
      },
    ],
  },
]; 