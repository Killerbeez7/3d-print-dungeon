import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForum } from "../../contexts/forumContext";
import { useAuth } from "../../contexts/authContext";
import { MdMessage, MdRemoveRedEye } from "react-icons/md";

export const ForumThread = ({ isNew = false }) => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { 
        getThreadById, 
        createThread, 
        addReply, 
        getThreadReplies,
        incrementThreadViews,
        loading,
        error
    } = useForum();
    
    const [thread, setThread] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        categoryId: "1" // Default to General Discussion
    });

    useEffect(() => {
        if (!isNew && threadId) {
            const fetchThread = async () => {
                try {
                    const threadData = await getThreadById(threadId);
                    setThread(threadData);
                    const threadReplies = await getThreadReplies(threadId);
                    setReplies(threadReplies);
                    await incrementThreadViews(threadId);
                } catch (err) {
                    console.error("Error fetching thread:", err);
                }
            };
            fetchThread();
        }
    }, [threadId, isNew, getThreadById, getThreadReplies, incrementThreadViews]);

    const handleCreateThread = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate("/login");
            return;
        }

        try {
            const newThread = {
                ...formData,
                authorId: currentUser.uid,
                authorName: currentUser.displayName || "Anonymous",
                authorPhotoURL: currentUser.photoURL || "/user.png"
            };
            const threadId = await createThread(newThread);
            navigate(`/community/forum/thread/${threadId}`);
        } catch (err) {
            console.error("Error creating thread:", err);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate("/login");
            return;
        }

        try {
            const replyData = {
                content: replyText,
                authorId: currentUser.uid,
                authorName: currentUser.displayName || "Anonymous",
                authorPhotoURL: currentUser.photoURL || "/user.png"
            };
            await addReply(threadId, replyData);
            setReplyText("");
            // Refresh replies
            const updatedReplies = await getThreadReplies(threadId);
            setReplies(updatedReplies);
        } catch (err) {
            console.error("Error adding reply:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-600">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {isNew ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h1 className="text-3xl font-bold mb-6">Create New Thread</h1>
                    <form onSubmit={handleCreateThread} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                placeholder="Thread title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700"
                            >
                                <option value="1">General Discussion</option>
                                <option value="2">Technical Support</option>
                                <option value="3">Showcase</option>
                                <option value="4">Marketplace</option>
                                <option value="5">Events</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Content</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full p-2 border rounded-lg min-h-[200px] dark:bg-gray-700"
                                placeholder="Write your post..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Create Thread
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-6">{thread?.title}</h1>
                    
                    {/* Original post */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <img 
                                    src={thread?.authorPhotoURL} 
                                    alt={thread?.authorName}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="font-semibold">{thread?.authorName}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {thread?.createdAt?.toDate().toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{thread?.content}</p>
                    </div>

                    {/* Replies */}
                    <div className="space-y-4 mb-6">
                        {replies.map((reply) => (
                            <div key={reply.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <img 
                                            src={reply.authorPhotoURL} 
                                            alt={reply.authorName}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="font-semibold">{reply.authorName}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {reply.createdAt?.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Reply form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-xl font-semibold mb-4">Post a Reply</h3>
                        <form onSubmit={handleReply}>
                            <textarea
                                required
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full p-2 border rounded-lg min-h-[100px] mb-4 dark:bg-gray-700"
                                placeholder="Write your reply..."
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