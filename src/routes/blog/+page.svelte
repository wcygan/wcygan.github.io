<script lang="ts">
    import { posts } from '$lib/posts';
    import PostCard from '$lib/components/PostCard.svelte';
    import SearchBox from '$lib/components/SearchBox.svelte';
    import Seo from '$lib/components/Seo.svelte';
    import type { Post } from '$lib/types';
    
    let filteredPosts: Post[] = posts;
    
    function handleSearchResults(results: Post[]) {
        filteredPosts = results;
    }
</script>

<Seo title="Blog Posts" description="My Articles" />

<div class="mdsvex-content prose prose-invert prose-emerald max-w-none">
    <h1>Blog Posts</h1>
    
    <SearchBox posts={posts} onResults={handleSearchResults} />
    
    <div class="space-y-6">
        {#each filteredPosts as post}
            <PostCard {post} />
        {/each}
        
        {#if filteredPosts.length === 0}
            <div class="text-center py-8">
                <p class="text-zinc-400">No posts found matching your search.</p>
            </div>
        {/if}
    </div>
</div>
