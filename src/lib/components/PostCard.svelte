<script lang="ts">
  import type { Post } from '$lib/types';
  import { formatReadingTime } from '$lib/utils/readingTime';
  
  export let post: Post;
</script>

<a
  href="/blog/{post.slug}"
  class="post-card not-prose block no-underline text-zinc-100 hover:text-emerald-300 bg-zinc-800 p-6 rounded-lg border border-zinc-700 hover:border-emerald-400 transition-all duration-200"
  aria-labelledby="post-{post.slug}-title"
>
  <article>
    <h2 id="post-{post.slug}-title" class="text-2xl font-bold mb-3">
      {post.title}
    </h2>
    
    <div class="flex items-center gap-4 text-zinc-400 mb-3">
      <span>{post.date}</span>
      {#if post.readingTime && post.readingTime > 0}
        <span>•</span>
        <span>{formatReadingTime(post.readingTime)}</span>
      {/if}
    </div>
    
    <p class="mb-4 text-zinc-300 leading-relaxed">{post.description}</p>
    
    {#if post.tags && post.tags.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each post.tags as tag}
          <span class="bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded text-sm">
            {tag}
          </span>
        {/each}
      </div>
    {/if}
  </article>
</a>
