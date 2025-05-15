import Layout from "../../components/Layout.tsx";
import BlogPostPreview from "../../components/BlogPostPreview.tsx";

// In a real application, this data would likely come from a CMS or markdown files
const posts = [
  {
    slug: "first-post",
    title: "My First Blog Post",
    summary: "A brief introduction to what this blog will be about. Placeholder content. Lorem ipsum dolor sit amet.",
    date: "2024-01-15"
  },
  {
    slug: "second-post",
    title: "Exploring Deno Fresh",
    summary: "Diving deeper into the features and benefits of the Deno Fresh framework. Consectetur adipiscing elit.",
    date: "2024-01-20"
  },
  {
    slug: "minimalist-design-thoughts",
    title: "Thoughts on Minimalist Web Design",
    summary: "Why less can be more when it comes to web aesthetics and user experience. Sed do eiusmod tempor incididunt.",
    date: "2024-01-25"
  }
];

export default function BlogIndexPage() {
  return (
    <Layout>
      <h2>Blog</h2>
      <div>
        {posts.map(post => (
          <BlogPostPreview 
            slug={post.slug} 
            title={post.title} 
            summary={post.summary} 
            date={post.date} 
          />
        ))}
      </div>
    </Layout>
  );
} 