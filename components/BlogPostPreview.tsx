interface BlogPostPreviewProps {
  slug: string;
  title: string;
  summary: string;
  date?: string;
}

export default function BlogPostPreview(
  { slug, title, summary, date }: BlogPostPreviewProps,
) {
  return (
    <div class="blog-post-preview">
      <h3 class="post-title">
        <a href={`/blog/${slug}`}>{title}</a>
      </h3>
      {date && (
        <p class="post-date">
          <small>Date: {date}</small>
        </p>
      )}
      <p class="post-summary">{summary}</p>
      <a href={`/blog/${slug}`} class="read-more">Read more</a>
    </div>
  );
}
