import { useState } from "react";
import type { BlogPost } from "../types/blog";

interface BlogCardProps {
    post: BlogPost;
    isExpanded?: boolean;
    onToggle?: (postId: string) => void;
}

export const BlogCard = ({ post, isExpanded = false, onToggle }: BlogCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleToggle = () => {
        onToggle?.(post.id);
    };

    return (
        <>
            {/* Skeleton Placeholder when expanded */}
            {isExpanded && (
                <div className="bg-bg-secondary border border-br-secondary rounded-xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-bg-tertiary"></div>
                    <div className="p-6 space-y-4">
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-bg-tertiary rounded-full"></div>
                            <div className="h-6 w-20 bg-bg-tertiary rounded-full"></div>
                            <div className="h-6 w-24 bg-bg-tertiary rounded-full"></div>
                        </div>
                        <div className="h-6 bg-bg-tertiary rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-bg-tertiary rounded w-full"></div>
                            <div className="h-4 bg-bg-tertiary rounded w-5/6"></div>
                            <div className="h-4 bg-bg-tertiary rounded w-4/6"></div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-br-secondary">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-bg-tertiary rounded-full"></div>
                                <div className="space-y-1">
                                    <div className="h-3 w-20 bg-bg-tertiary rounded"></div>
                                    <div className="h-2 w-16 bg-bg-tertiary rounded"></div>
                                </div>
                            </div>
                            <div className="h-3 w-16 bg-bg-tertiary rounded"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Normal Card */}
            <article 
                className={`bg-bg-secondary border border-br-secondary rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    isExpanded ? 'hidden' : ''
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleToggle}
            >
                {/* Image */}
                {post.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                                isHovered ? 'scale-105' : 'scale-100'
                            }`}
                        />
                        {post.featured && (
                            <div className="absolute top-3 left-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Featured
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-bg-tertiary text-txt-secondary text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-txt-primary mb-3 line-clamp-2">
                        {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-txt-secondary mb-4 line-clamp-3">
                        {post.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-br-secondary">
                        <div className="flex items-center space-x-3">
                            <img
                                src={post.author.avatar || "/assets/images/user.png"}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-sm font-medium text-txt-primary">
                                    {post.author.name}
                                </p>
                                <p className="text-xs text-txt-muted">
                                    {formatDate(post.publishedAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-txt-muted">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs">{post.readTime} min read</span>
                        </div>
                    </div>

                    {/* Expand Indicator */}
                    <div className="flex justify-center mt-3">
                        <div className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center">
                            <svg className="w-3 h-3 text-txt-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
};
