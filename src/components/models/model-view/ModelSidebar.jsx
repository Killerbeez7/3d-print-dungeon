import PropTypes from "prop-types";
import { Link } from "react-router-dom";
//components
import { ModelComments } from "./ModelComments";
import { LikeButton } from "../action-buttons/likeButton";
import { FavoritesButton } from "../action-buttons/favoritesButton";
//contexts
import { CommentsProvider } from "@/providers/commentsProvider";
import { STATIC_ASSETS } from "@/config/assetsConfig";

export const ModelSidebar = ({
    model,
    uploader,
    viewCount,
    currentUser,
    openAuthModal,
}) => {
    return (
        <aside className="w-full lg:w-[400px] bg-white dark:bg-gray-800 flex flex-col h-full">
            {/* Creator Info Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <img
                        src={uploader?.photoURL || STATIC_ASSETS.DEFAULT_AVATAR}
                        alt={uploader?.displayName || "Unknown User"}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-txt-primary">
                            {uploader?.displayName || "Anonymous"}
                        </h2>
                        <p className="text-sm text-txt-secondary mt-1">
                            Senior 3D Artist
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                                Follow
                            </button>
                            <span className="text-sm text-txt-secondary">
                                {viewCount} views
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Model Info Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-txt-primary mb-3">{model.name}</h1>
                <p className="text-txt-secondary mb-4">{model.description}</p>

                {/* Tags */}
                {model.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {model.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-txt-secondary"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-4 mb-4">
                    <LikeButton
                        modelId={model.id}
                        initialLikes={model.likes}
                        currentUser={currentUser}
                        openAuthModal={openAuthModal}
                    />
                    <FavoritesButton
                        modelId={model.id}
                        currentUser={currentUser}
                        openAuthModal={openAuthModal}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {model.originalFileUrl && (
                        <button
                            onClick={() => window.open(model.originalFileUrl, "_blank")}
                            className="flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Download (STL)
                        </button>
                    )}
                    {model.convertedFileUrl &&
                        model.convertedFileUrl !== model.originalFileUrl && (
                            <button
                                onClick={() =>
                                    window.open(model.convertedFileUrl, "_blank")
                                }
                                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Download (glTF)
                            </button>
                        )}
                </div>

                {/* Edit Button for Owner */}
                {currentUser && currentUser.uid === model.uploaderId && (
                    <Link
                        to={`/model/${model.id}/edit`}
                        className="flex items-center justify-center gap-2 w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Model
                    </Link>
                )}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-6">
                <CommentsProvider modelId={model.id}>
                    <ModelComments openAuthModal={openAuthModal} />
                </CommentsProvider>
            </div>
        </aside>
    );
};

ModelSidebar.propTypes = {
    model: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        likes: PropTypes.number,
        uploaderId: PropTypes.string,
        originalFileUrl: PropTypes.string,
        convertedFileUrl: PropTypes.string,
    }).isRequired,
    uploader: PropTypes.shape({
        photoURL: PropTypes.string,
        displayName: PropTypes.string,
    }),
    viewCount: PropTypes.number.isRequired,
    currentUser: PropTypes.object,
    openAuthModal: PropTypes.func.isRequired,
};
