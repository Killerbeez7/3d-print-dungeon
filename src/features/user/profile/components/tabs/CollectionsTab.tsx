import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { getThumbnailUrl } from "@/utils/imageUtils";
import { LazyImage } from "@/features/shared/reusable/LazyImage";

interface CollectionsTabProps {
    userId: string;
}

interface Model {
    id: string;
    name: string;
    renderPrimaryUrl?: string;
    likes?: number;
    views?: number;
    category?: string;
}

interface UserCollection {
    id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    modelCount: number;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const CollectionsTab = ({ userId }: CollectionsTabProps) => {
    const [collections, setCollections] = useState<UserCollection[]>([]);
    const [userModels, setUserModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCollection, setNewCollection] = useState({
        name: "",
        description: "",
        isPublic: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                
                // Fetch user's models
                const modelsRef = collection(db, "models");
                const modelsQuery = query(modelsRef, where("uploaderId", "==", userId));
                const modelsSnapshot = await getDocs(modelsQuery);
                
                const models: Model[] = modelsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUserModels(models);

                // Fetch user's collections
                const collectionsRef = collection(db, "collections");
                const collectionsQuery = query(collectionsRef, where("userId", "==", userId));
                const collectionsSnapshot = await getDocs(collectionsQuery);
                
                const userCollections: UserCollection[] = collectionsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
                }));
                setCollections(userCollections);
            } catch (error) {
                console.error("Error fetching collections:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleCreateCollection = async () => {
        if (!newCollection.name.trim()) return;

        try {
            const collectionData = {
                userId,
                name: newCollection.name.trim(),
                description: newCollection.description.trim(),
                isPublic: newCollection.isPublic,
                modelCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await addDoc(collection(db, "collections"), collectionData);
            
            setNewCollection({ name: "", description: "", isPublic: true });
            setShowCreateModal(false);
            
            // Refresh collections
            const collectionsRef = collection(db, "collections");
            const collectionsQuery = query(collectionsRef, where("userId", "==", userId));
            const collectionsSnapshot = await getDocs(collectionsQuery);
            
            const userCollections: UserCollection[] = collectionsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            }));
            setCollections(userCollections);
        } catch (error) {
            console.error("Error creating collection:", error);
        }
    };

    const getCollectionCoverImage = (collectionId: string): string => {
        // In a real app, you'd have a separate collection_models collection
        // For now, we'll use a placeholder or the first model's image
        const firstModel = userModels.find(model => model.id === collectionId);
        return firstModel?.renderPrimaryUrl 
            ? getThumbnailUrl(firstModel.renderPrimaryUrl, "MEDIUM") || "/default-image.jpg"
            : "/default-image.jpg";
    };

    if (loading) {
        return (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-txt-secondary">Loading collections...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-txt-primary">Collections</h3>
                    <p className="text-txt-secondary">Organize your models into collections</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="cta-button px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i>
                    New Collection
                </button>
            </div>

            {/* Collections Grid */}
            {collections.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-folder text-2xl text-txt-secondary"></i>
                    </div>
                    <h4 className="text-lg font-semibold text-txt-primary mb-2">No Collections Yet</h4>
                    <p className="text-txt-secondary mb-6">Create your first collection to organize your models</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="cta-button px-6 py-3 rounded-lg"
                    >
                        Create Collection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((collection) => (
                        <div
                            key={collection.id}
                            className="bg-bg-secondary rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                        >
                            <div className="relative h-48">
                                <LazyImage
                                    src={getCollectionCoverImage(collection.id)}
                                    alt={collection.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        collection.isPublic
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}>
                                        {collection.isPublic ? "Public" : "Private"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-semibold text-txt-primary mb-2">{collection.name}</h4>
                                {collection.description && (
                                    <p className="text-sm text-txt-secondary mb-3 line-clamp-2">
                                        {collection.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-sm text-txt-secondary">
                                    <span>{collection.modelCount} models</span>
                                    <span>{new Date(collection.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Collection Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-bg-surface rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-txt-primary mb-4">Create New Collection</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-txt-secondary mb-2">
                                    Collection Name
                                </label>
                                <input
                                    type="text"
                                    value={newCollection.name}
                                    onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-br-primary rounded-lg bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none"
                                    placeholder="Enter collection name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-txt-secondary mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newCollection.description}
                                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-br-primary rounded-lg bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none"
                                    rows={3}
                                    placeholder="Describe your collection"
                                />
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={newCollection.isPublic}
                                    onChange={(e) => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
                                    className="mr-2"
                                />
                                <label htmlFor="isPublic" className="text-sm text-txt-secondary">
                                    Make collection public
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-br-primary rounded-lg text-txt-primary hover:bg-bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCollection}
                                disabled={!newCollection.name.trim()}
                                className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};