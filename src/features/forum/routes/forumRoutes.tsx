import { lazy, Suspense } from "react";
import { ForumProvider } from "@/features/forum/providers/forumProvider";
import { withProtectedMaintenance } from "@/helpers/routeHelpers";
import type { RouteObject } from "react-router-dom";

// Layout
const ForumLayout = lazy(() =>
    import("../components/Layout").then((m) => ({ default: m.ForumLayout }))
);

// Pages and Components
const ForumHome = lazy(() =>
    import("../pages/ForumHome").then((m) => ({ default: m.ForumHome }))
);
const ForumCategory = lazy(() =>
    import("../components/ForumCategory").then((m) => ({ default: m.ForumCategory }))
);
const ForumThread = lazy(() =>
    import("../components/ForumThread").then((m) => ({ default: m.ForumThread }))
);
const CreateThread = lazy(() =>
    import("../components/CreateThread").then((m) => ({ default: m.CreateThread }))
);
const EditThread = lazy(() =>
    import("../components/EditThread").then((m) => ({ default: m.EditThread }))
);
const EditReply = lazy(() =>
    import("../components/EditReply").then((m) => ({ default: m.EditReply }))
);
const ForumDashboard = lazy(() =>
    import("../components/ForumDashboard").then((m) => ({ default: m.ForumDashboard }))
);
const ForumMyThreads = lazy(() =>
    import("../components/ForumMyThreads").then((m) => ({ default: m.ForumMyThreads }))
);
const ForumRules = lazy(() =>
    import("../components/ForumRules").then((m) => ({ default: m.ForumRules }))
);
const ForumHelp = lazy(() =>
    import("../components/ForumHelp").then((m) => ({ default: m.ForumHelp }))
);

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
                <Suspense>
                    <ForumLayout />
                </Suspense>
            </ForumProvider>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense>
                        <ForumHome />
                    </Suspense>
                ),
            },
            {
                path: "category/:categoryId",
                element: (
                    <Suspense>
                        <ForumCategory />
                    </Suspense>
                ),
            },
            {
                path: "thread/:threadId",
                element: (
                    <Suspense>
                        <ForumThread />
                    </Suspense>
                ),
            },
            {
                path: "dashboard",
                element: (
                    <Suspense>
                        <ForumDashboard />
                    </Suspense>
                ),
            },
            {
                path: "my-threads",
                element: (
                    <Suspense>
                        <ForumMyThreads />
                    </Suspense>
                ),
            },
            {
                path: "rules",
                element: (
                    <Suspense>
                        <ForumRules />
                    </Suspense>
                ),
            },
            {
                path: "help",
                element: (
                    <Suspense>
                        <ForumHelp />
                    </Suspense>
                ),
            },
            {
                path: "new-thread",
                element: withProtectedMaintenance(
                    <Suspense>
                        <CreateThread />
                    </Suspense>
                ),
            },
            {
                path: "thread/:threadId/edit",
                element: withProtectedMaintenance(
                    <Suspense>
                        <EditThread />
                    </Suspense>
                ),
            },
            {
                path: "reply/:replyId/edit",
                element: withProtectedMaintenance(
                    <Suspense>
                        <EditReply />
                    </Suspense>
                ),
            },
        ],
    },
];
