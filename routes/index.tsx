import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/Layout.tsx";
import BlogPostPreview from "../components/BlogPostPreview.tsx";
import { getPosts, Post } from "../utils/posts.ts"; // Import from utils

interface HomeProps {
  latestPosts: Post[];
}

export const handler: Handlers<HomeProps> = {
  async GET(_req, ctx) {
    const allPosts = await getPosts();
    const latestPosts = allPosts.slice(0, 3);
    return ctx.render({ latestPosts });
  },
};

export default function Home({ data }: PageProps<HomeProps>) {
  const { latestPosts } = data;
  return (
    <Layout>
      <section>
        <h2>About Me</h2>
        <p>
          Hello! I'm [Your Name], a passionate developer interested in [Your
          Interests/Technologies]. This is a placeholder biography. I enjoy
          building cool things and learning new technologies. Lorem ipsum dolor
          sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </section>

      {/* Latest Blog Posts Section */}
      <section class="latest-posts-section">
        <h2>Latest from the Blog</h2>
        <div class="blog-posts-grid">
          {/* You can reuse .projects-grid or create a new one like .blog-posts-grid */}
          {latestPosts.map((post) => (
            <BlogPostPreview
              key={post.slug} // Add key for list rendering
              slug={post.slug}
              title={post.title}
              summary={post.snippet} // Use snippet
              date={post.publishedAt.toISOString().split("T")[0]} // Format Date
            />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a href="/blog" class="button">View All Posts</a>
        </div>
      </section>
    </Layout>
  );
}
