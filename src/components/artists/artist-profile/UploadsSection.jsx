import PropTypes from "prop-types";

export const UploadsSection = ({ artworks }) => (
    <div className="container mx-auto px-4 pb-8 text-txt-primary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artworks.length === 0 ? (
                <p className="text-txt-secondary">No uploads yet.</p>
            ) : (
                artworks.map((art) => (
                    <article
                        key={art.id}  // Use unique ID from art object instead of index
                        className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        <img
                            src={art.primaryRenderUrl || "/default-image.jpg"}  // Add fallback for imageUrl
                            alt={art.name || "Untitled"}  // Fallback for title
                            className="w-full h-auto object-cover"
                        />
                        <div className="p-3">
                            <h2 className="text-lg font-semibold mb-1 text-txt-primary">
                                {art.name || "Untitled"}  {/* Fallback for title */}
                            </h2>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-txt-secondary">
                                    <i className="fas fa-heart text-error mr-1"></i>
                                    {art.likes || 0} {/* Fallback for likes */} Likes
                                </span>
                                <span className="text-txt-secondary">
                                    <i className="fas fa-eye text-txt-highlight mr-1"></i>
                                    {art.views || 0}  {/* Fallback for views */} Views
                                </span>
                            </div>
                        </div>
                    </article>
                ))
            )}
        </div>
    </div>
);

UploadsSection.propTypes = {
    artworks: PropTypes.array.isRequired,  // Ensures that artworks is an array
};
