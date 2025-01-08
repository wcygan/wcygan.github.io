<script lang="ts">
  import type { Post } from '$lib/types';
  export let post: Post;
</script>

<a
  href="/blog/{post.slug}"
  class="post-card not-prose block no-underline text-zinc-100 hover:text-emerald-300"
  aria-labelledby="post-{post.slug}-title"
>
  <article>
    <h2 id="post-{post.slug}-title" class="text-2xl font-bold mb-2">
      {post.title}
    </h2>
    <div class="text-zinc-400 mb-2">{post.date}</div>
    <p class="mb-4 text-zinc-300">{post.description}</p>
  </article>
</a>