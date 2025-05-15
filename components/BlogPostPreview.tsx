interface BlogPostPreviewProps {
  slug: string;
  title: string;
  summary: string;
  date?: string; 
}

export default function BlogPostPreview({ slug, title, summary, date }: BlogPostPreviewProps) {
  return (
    <div class="blog-post-preview">
      <h3><a href={`/blog/${slug}`}>{title}</a></h3>
      {date && <p><small>Date: {date}</small></p>}
      <p>{summary}</p>
      <a href={`/blog/${slug}`}>Read more...</a>
    </div>
  );
} 