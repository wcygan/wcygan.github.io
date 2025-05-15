import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../../components/Layout.tsx";
import BlogPostPreview from "../../components/BlogPostPreview.tsx";
import { getPosts, Post } from "../../utils/posts.ts"; // Use new posts utility

export const handler: Handlers<Post[]> = {
  async GET(_req, ctx) {
    const posts = await getPosts();
    return ctx.render(posts);
  },
};

export default function BlogIndexPage({ data: posts }: PageProps<Post[]>) {
  return (
    <Layout>
      <h2>Blog</h2>
      <div>
        {posts.map((post) => (
          <BlogPostPreview
            key={post.slug}
            slug={post.slug}
            title={post.title}
            summary={post.snippet} // Use snippet from new Post interface
            date={post.publishedAt.toISOString().split("T")[0]} // Format Date to string
          />
        ))}
      </div>
    </Layout>
  );
}
