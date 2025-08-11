import type { BlogPost } from "../types/blog";

interface ExpandedBlogCardProps {
    post: BlogPost;
    onClose: () => void;
}

export const ExpandedBlogCard = ({ post, onClose }: ExpandedBlogCardProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal content - smaller size to fit on desktop */}
            <div className="relative bg-bg-secondary border border-br-secondary rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-3 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white hover:text-white transition-all duration-200 z-10 shadow-lg"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Scrollable content container */}
                <div className="max-h-[80vh] overflow-y-auto">
                    {/* Image */}
                    {post.imageUrl && (
                        <div className="relative h-48 md:h-56 overflow-hidden rounded-t-2xl">
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            {post.featured && (
                                <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    Featured
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-bg-tertiary text-txt-secondary text-sm rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-txt-primary mb-4">
                            {post.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-br-secondary">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={post.author.avatar || "/assets/images/user.png"}
                                    alt={post.author.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-base font-medium text-txt-primary">
                                        {post.author.name}
                                    </p>
                                    <p className="text-sm text-txt-muted">
                                        {formatDate(post.publishedAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-txt-muted">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">{post.readTime} min read</span>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="mb-4">
                            <p className="text-base text-txt-secondary leading-relaxed">
                                {post.excerpt}
                            </p>
                        </div>

                        {/* Full Content - condensed */}
                        <div className="mb-6">
                            <p className="text-txt-secondary leading-relaxed mb-4">
                                {post.content}
                            </p>
                            <p className="text-txt-secondary leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-4 pt-4 border-t border-br-secondary">
                            <button className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors duration-200">
                                Read Full Article
                            </button>
                            <button className="px-6 py-2 bg-bg-tertiary hover:bg-bg-surface text-txt-primary rounded-lg font-semibold transition-colors duration-200">
                                Share Article
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
