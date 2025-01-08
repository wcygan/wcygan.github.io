<script lang="ts">
    import type { PageData } from './$types';
    import PostCard from '$lib/components/PostCard.svelte';
    
    export let data: PageData;
</script>

<article class="mdsvex-content prose prose-invert prose-emerald max-w-none">
    <h1>Welcome!</h1>
    <p class="mb-4 text-zinc-100">
        Hi, I'm <strong>Will</strong>.
    </p>
    <p class="mb-8 text-zinc-300">
        I'm a Software Engineer interested in distributed systems & application design
    </p>
</article>

<article class="mdsvex-content prose prose-invert prose-emerald max-w-none">
    <h2>Posts</h2>
    <div class="space-y-6">
        {#each data.posts as post}
            <PostCard {post} />
        {/each}
    </div>
    <div class="mt-8">
        <a href="/blog" class="text-emerald-400 hover:text-emerald-300">View all posts →</a>
    </div>
</article>
