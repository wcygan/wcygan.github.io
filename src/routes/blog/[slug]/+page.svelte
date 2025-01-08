<script lang="ts">
  let { data } = $props();
  // Use a regular const in the script block
  const Content = data.content;
</script>

<article class="mdsvex-content prose prose-invert prose-emerald max-w-none">
  <Content />
</article>
