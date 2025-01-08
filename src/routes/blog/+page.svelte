<script lang="ts">
    import { posts } from '$lib/posts';
    import PostCard from '$lib/components/PostCard.svelte';
    import Seo from '$lib/components/Seo.svelte';
</script>

<Seo title="Blog Posts" description="My Articles" />

<div class="mdsvex-content prose prose-invert prose-emerald max-w-none">
    <h1>Blog Posts</h1>
    <div class="space-y-6">
        {#each posts as post}
            <PostCard {post} />
        {/each}
    </div>
</div>
