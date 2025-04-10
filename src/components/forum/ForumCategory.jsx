import { Link, useParams } from "react-router-dom";

export const ForumCategory = () => {
    const { categoryId } = useParams();

    // This is a placeholder for threads - in a real app, you'd fetch these based on categoryId
    const threads = [
        { 
            id: 1, 
            title: "Getting started with 3D printing", 
            author: "PrintMaster", 
            replies: 23,
            lastActivity: "2024-03-15T10:30:00Z"
        },
        { 
            id: 2, 
            title: "Best settings for PLA+", 
            author: "TechGuru", 
            replies: 45,
            lastActivity: "2024-03-14T15:20:00Z"
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Forum Category</h1>
                <Link
                    to="/forum/new-thread"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                >
                    New Thread
                </Link>
            </div>

            <div className="space-y-4">
                {threads.map((thread) => (
                    <div key={thread.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <Link 
                            to={`/forum/thread/${thread.id}`}
                            className="text-xl font-semibold hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            {thread.title}
                        </Link>
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex gap-4">
                            <span>By: {thread.author}</span>
                            <span>Replies: {thread.replies}</span>
                            <span>Last activity: {new Date(thread.lastActivity).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 