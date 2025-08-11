import { useState } from "react";
import { BlogCard } from "./BlogCard";
import { ExpandedBlogCard } from "./ExpandedBlogCard";
import type { BlogPost } from "../types/blog";

interface BlogGridProps {
    posts: BlogPost[];
    title?: string;
    showFilters?: boolean;
}

export const BlogGrid = ({ posts, title = "Latest Articles", showFilters = false }: BlogGridProps) => {
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Get all unique tags
    const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

    // Filter posts based on search and tags
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = selectedTags.length === 0 || 
                           selectedTags.some(tag => post.tags.includes(tag));
        return matchesSearch && matchesTags;
    });

    const handleTogglePost = (postId: string) => {
        setExpandedPost(expandedPost === postId ? null : postId);
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-txt-primary mb-2">{title}</h1>
                <p className="text-txt-secondary">
                    Discover insights, tutorials, and updates from the 3D printing community
                </p>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="mb-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedTags.includes(tag)
                                        ? 'bg-accent text-white'
                                        : 'bg-bg-tertiary text-txt-secondary hover:bg-bg-surface'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-txt-muted">
                        Showing {filteredPosts.length} of {posts.length} articles
                    </p>
                </div>
            )}

            {/* Featured Posts */}
            {showFilters && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-txt-primary mb-4">Featured Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.filter(post => post.featured).slice(0, 2).map(post => (
                            <BlogCard
                                key={post.id}
                                post={post}
                                isExpanded={expandedPost === post.id}
                                onToggle={handleTogglePost}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* All Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                    <BlogCard
                        key={post.id}
                        post={post}
                        isExpanded={expandedPost === post.id}
                        onToggle={handleTogglePost}
                    />
                ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-bg-tertiary rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-txt-primary mb-2">No articles found</h3>
                    <p className="text-txt-secondary">
                        Try adjusting your search terms or filters
                    </p>
                </div>
            )}

            {/* Expanded Blog Card Modal */}
            {expandedPost && (
                <ExpandedBlogCard
                    post={posts.find(post => post.id === expandedPost)!}
                    onClose={() => setExpandedPost(null)}
                />
            )}
        </div>
    );
};
