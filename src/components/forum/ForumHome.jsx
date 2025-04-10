import { Link } from "react-router-dom";

export const ForumHome = () => {
    // This is a placeholder for forum categories - in a real app, you'd fetch these from your backend
    const categories = [
        { id: 1, name: "General Discussion", description: "General topics about 3D printing", threadCount: 150 },
        { id: 2, name: "Technical Support", description: "Get help with technical issues", threadCount: 89 },
        { id: 3, name: "Showcase", description: "Show off your 3D prints", threadCount: 234 },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Community Forum</h1>
            
            <div className="space-y-4">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <Link 
                            to={`/forum/category/${category.id}`}
                            className="text-xl font-semibold hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            {category.name}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">{category.description}</p>
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            {category.threadCount} threads
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 