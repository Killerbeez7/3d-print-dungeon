import { useParams } from "react-router-dom";
import { useState } from "react";

export const ForumThread = ({ isNew = false }) => {
    const { threadId } = useParams();
    const [replyText, setReplyText] = useState("");
    
    // This is placeholder data - in a real app, you'd fetch this based on threadId
    const thread = isNew ? null : {
        id: threadId,
        title: "Getting started with 3D printing",
        author: "PrintMaster",
        content: "Hello everyone! I'm new to 3D printing and would love some advice...",
        createdAt: "2024-03-15T10:30:00Z",
        replies: [
            {
                id: 1,
                author: "TechGuru",
                content: "Welcome to the community! Here are some tips...",
                createdAt: "2024-03-15T11:00:00Z"
            }
        ]
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd handle the form submission here
        console.log("Form submitted:", { replyText });
        setReplyText("");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {isNew ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h1 className="text-3xl font-bold mb-6">Create New Thread</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                placeholder="Thread title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Content</label>
                            <textarea
                                className="w-full p-2 border rounded-lg min-h-[200px] dark:bg-gray-700"
                                placeholder="Write your post..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                        >
                            Create Thread
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-6">{thread.title}</h1>
                    
                    {/* Original post */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <span className="font-semibold">{thread.author}</span>
                            <span className="text-sm text-gray-500">
                                {new Date(thread.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{thread.content}</p>
                    </div>

                    {/* Replies */}
                    <div className="space-y-4 mb-6">
                        {thread.replies.map((reply) => (
                            <div key={reply.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-semibold">{reply.author}</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Reply form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-xl font-semibold mb-4">Post a Reply</h3>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                className="w-full p-2 border rounded-lg min-h-[100px] mb-4 dark:bg-gray-700"
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                            >
                                Post Reply
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}; 