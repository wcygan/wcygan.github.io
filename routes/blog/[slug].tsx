import { PageProps } from "$fresh/server.ts";
import Layout from "../../components/Layout.tsx";

// In a real app, you would fetch post content based on the slug
// For this example, we'll use placeholder data and find the post by slug
const postsData: Record<string, { title: string; content: string; date: string }> = {
  "first-post": {
    title: "My First Blog Post",
    date: "2024-01-15",
    content: "This is the full content of my first blog post. It's still placeholder text, but imagine it filled with insightful thoughts and ideas. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  "second-post": {
    title: "Exploring Deno Fresh",
    date: "2024-01-20",
    content: "Detailed exploration of Deno Fresh. We cover its architecture, benefits, and how to get started. This placeholder content represents a deep dive into the framework. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  "minimalist-design-thoughts": {
    title: "Thoughts on Minimalist Web Design",
    date: "2024-01-25",
    content: "Discussing the principles of minimalist web design. Why it's effective and how to achieve it. This is more placeholder text. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  }
};

export default function BlogPostPage(props: PageProps) {
  const { slug } = props.params;
  const post = postsData[slug];

  if (!post) {
    // Optionally, you could redirect to a 404 page
    // For now, just render a message
    return (
      <Layout>
        <h1>Post not found</h1>
        <p>Sorry, we couldn't find a post with the slug: {slug}</p>
        <a href="/blog">Back to Blog</a>
      </Layout>
    );
  }

  return (
    <Layout>
      <article>
        <h1>{post.title}</h1>
        <p><small>Published on: {post.date}</small></p>
        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
        <hr />
        <a href="/blog">Back to Blog Index</a>
      </article>
    </Layout>
  );
} 