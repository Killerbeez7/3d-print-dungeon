import { useAuth } from "../../../contexts/authContext"
import { useState } from "react";

export const Profile = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState("uploads");

    const tabs = [
        { id: "uploads", label: "Uploads" },
        { id: "likes", label: "Likes" },
        { id: "collections", label: "Collections" }
    ];

    const artworks = [
        {
            id: 1,
            title: "Cyber Samurai",
            artist: "Jane Doe",
            category: "3D",
            imageUrl: "https://source.unsplash.com/random/400x300?cyber",
            likes: 234,
            views: 3214,
        },
        {
            id: 2,
            title: "Fantasy Landscape",
            artist: "John Smith",
            category: "Concept",
            imageUrl: "https://source.unsplash.com/random/400x300?fantasy",
            likes: 120,
            views: 2100,
        },
        {
            id: 3,
            title: "Sci-Fi Mech",
            artist: "Ali Chen",
            category: "3D",
            imageUrl: "https://source.unsplash.com/random/400x300?robot",
            likes: 89,
            views: 1002,
        },
        {
            id: 4,
            title: "Character Design",
            artist: "Emily Brown",
            category: "2D",
            imageUrl: "https://source.unsplash.com/random/400x300?character",
            likes: 500,
            views: 6000,
        }
    ]

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-6 bg-bg-surface shadow-md rounded-lg">
                <img
                    src={currentUser?.photoURL || "/user.png"}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full border-2 border-br-primary"
                />
                <div>
                    <h1 className="text-2xl font-semibold text-txt-primary">{currentUser?.displayName || "Anonymous"}</h1>
                    <p className="text-txt-secondary">{currentUser?.bio || "No bio available"}</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex mt-6 border-b border-br-primary">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium text-lg ${activeTab === tab.id ? "border-b-2 border-accent text-txt-primary" : "text-txt-secondary hover:text-txt-highlighted"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <div className="mt-6">
                {activeTab === "uploads" && <UploadsSection artworks={artworks} />}
                {activeTab === "likes" && <LikesSection />}
                {activeTab === "collections" && <CollectionsSection />}
            </div>
        </div>
    );
};

const UploadsSection = ({ artworks }) => (

    <div className="container mx-auto px-4 pb-8 text-txt-primary">
        <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Replace with actual uploaded models */}
            {artworks.map((art) => (
                <article
                    key={art.id}
                    className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                    {/* Artwork image */}
                    <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-auto object-cover"
                    />

                    {/* Info area */}
                    <div className="p-3">
                        <h2 className="text-lg font-semibold mb-1 text-txt-primary">
                            {art.title}
                        </h2>
                        <p className="text-txt-secondary text-sm mb-2">
                            By {art.artist}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-txt-secondary">
                                <i className="fas fa-heart text-error mr-1"></i>
                                {art.likes}
                            </span>
                            <span className="text-txt-secondary">
                                <i className="fas fa-eye text-txt-highlight mr-1"></i>
                                {art.views}
                            </span>
                        </div>
                    </div>
                </article>
            ))}
        </div >
    </div >
);

const LikesSection = () => <p className="text-txt-primary">Liked models will be shown here.</p>;
const CollectionsSection = () => <p className="text-txt-primary">User collections will be shown here.</p>;
