import { BlogGrid } from "../components/BlogGrid";
import { mockBlogPosts } from "../mock/mockBlogPosts";

export const BlogPage = () => (
    <section className="w-full py-12 px-4">
        <BlogGrid 
            posts={mockBlogPosts} 
            title="Community Blog" 
            showFilters={true}
        />
    </section>
);
