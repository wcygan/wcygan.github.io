<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
  const Content = data.content;
</script>

<article class="mdsvex-content prose prose-invert prose-emerald max-w-none">
  <!-- Render metadata above the blog content -->
  <h1>{data.meta.title}</h1>
  <p class="text-zinc-400">{data.meta.date}</p>

  <!-- Then render the actual markdown content -->
  <Content />
</article>