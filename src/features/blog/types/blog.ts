export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: {
        name: string;
        avatar?: string;
    };
    publishedAt: string;
    readTime: number; // in minutes
    tags: string[];
    featured?: boolean;
    imageUrl?: string;
}

export interface BlogFilters {
    search: string;
    tags: string[];
    sortBy: 'newest' | 'oldest' | 'popular';
}
