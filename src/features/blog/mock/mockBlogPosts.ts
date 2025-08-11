import type { BlogPost } from "../types/blog";

export const mockBlogPosts: BlogPost[] = [
    {
        id: "1",
        title: "Getting Started with 3D Printing: A Beginner's Guide",
        excerpt: "Learn the fundamentals of 3D printing, from choosing your first printer to creating your first successful print. This comprehensive guide covers everything you need to know to start your 3D printing journey.",
        content: "3D printing has revolutionized the way we create and prototype objects. Whether you're a hobbyist, designer, or engineer, understanding the basics of 3D printing can open up a world of possibilities...",
        author: {
            name: "Sarah Chen",
            avatar: "/assets/images/user.png"
        },
        publishedAt: "2024-01-15T10:00:00Z",
        readTime: 8,
        tags: ["3D Printing", "Beginner", "Tutorial"],
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop"
    },
    {
        id: "2",
        title: "Advanced Modeling Techniques in Blender",
        excerpt: "Master advanced modeling techniques in Blender to create stunning 3D models. From hard-surface modeling to organic sculpting, discover professional workflows used by industry experts.",
        content: "Blender is one of the most powerful 3D modeling software available today, and mastering its advanced features can significantly improve your modeling workflow...",
        author: {
            name: "Marcus Rodriguez",
            avatar: "/assets/images/user.png"
        },
        publishedAt: "2024-01-12T14:30:00Z",
        readTime: 12,
        tags: ["Blender", "Modeling", "Advanced"],
        imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop"
    },
    {
        id: "3",
        title: "Optimizing 3D Models for Print: Best Practices",
        excerpt: "Discover essential techniques for optimizing your 3D models to ensure successful prints. Learn about mesh optimization, support structures, and print preparation strategies.",
        content: "Creating a beautiful 3D model is just the first step. To ensure successful printing, you need to optimize your model for the printing process...",
        author: {
            name: "Emma Thompson",
            avatar: "/assets/images/user.png"
        },
        publishedAt: "2024-01-10T09:15:00Z",
        readTime: 6,
        tags: ["Optimization", "Printing", "Best Practices"],
        imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop"
    },
    {
        id: "4",
        title: "The Future of 3D Printing in Manufacturing",
        excerpt: "Explore how 3D printing is transforming manufacturing industries worldwide. From rapid prototyping to mass production, discover the latest trends and innovations.",
        content: "3D printing technology has evolved far beyond its origins as a prototyping tool. Today, it's revolutionizing manufacturing processes across multiple industries...",
        author: {
            name: "David Kim",
            avatar: "/assets/images/user.png"
        },
        publishedAt: "2024-01-08T16:45:00Z",
        readTime: 10,
        tags: ["Manufacturing", "Industry", "Innovation"],
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop"
    }
];
