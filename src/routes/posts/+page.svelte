<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<div class="max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold mb-6">Blog Posts</h1>
    <div class="space-y-6">
        {#each data.posts as post}
            <article class="post-card">
                <h2 class="text-2xl font-bold mb-2 text-emerald-400">
                    <a href="/blog/{post.slug}" class="text-emerald-400 hover:text-emerald-300">
                        {post.title}
                    </a>
                </h2>
                <div class="text-zinc-400 mb-2">{post.date}</div>
                <p class="mb-4 text-zinc-300">{post.description}</p>
            </article>
        {/each}
    </div>
</div>
