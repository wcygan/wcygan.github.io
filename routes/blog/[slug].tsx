import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Layout from "../../components/Layout.tsx";
import { getPost, Post } from "../../utils/posts.ts"; // Use new posts utility
import { CSS, render } from "$gfm"; // Import GFM CSS and render function

export const handler: Handlers<Post | null> = {
  async GET(_req, ctx) {
    const post = await getPost(ctx.params.slug);
    // No specific error for not found here, render will handle if post is null
    return ctx.render(post);
  },
};

export default function PostPage({ data: post }: PageProps<Post | null>) {
  if (!post) {
    // It's good practice to provide a clear 404 experience.
    // The Deno Fresh tutorial uses ctx.renderNotFound() in the handler,
    // but for that to work effectively, the handler type might need to be just Post,
    // and we'd throw or return a Response for not found.
    // For simplicity matching the existing structure, we check for null here.
    return (
      <Layout>
        <h1>Post Not Found</h1>
        <p>Sorry, the post you are looking for does not exist.</p>
        <a href="/blog" class="button">Back to Blog</a>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        {/* deno-lint-ignore react-no-danger */}
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <article class="blog-post-full markdown-body">
        {/* Added markdown-body class for GFM styles */}
        <h1>{post.title}</h1>
        <p class="post-meta">
          <small>
            Published on: {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </small>
        </p>
        {/* Render the raw Markdown content using GFM */}
        {/* deno-lint-ignore react-no-danger */}
        <div
          class="post-content"
          dangerouslySetInnerHTML={{ __html: render(post.content) }}
        />
        <hr />
        <a href="/blog" class="button">Back to Blog Index</a>
      </article>
    </Layout>
  );
}
