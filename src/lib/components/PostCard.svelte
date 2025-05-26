<script lang="ts">
	import type { Post } from '$lib/types';
	import { formatReadingTime } from '$lib/utils/readingTime';

	export let post: Post;
</script>

<a
	href="/blog/{post.slug}"
	class="post-card not-prose block rounded-lg border border-zinc-700 bg-zinc-800 p-6 text-zinc-100 no-underline transition-all duration-200 hover:border-emerald-400 hover:text-emerald-300"
	aria-labelledby="post-{post.slug}-title"
>
	<article>
		<h2 id="post-{post.slug}-title" class="mb-3 text-2xl font-bold">
			{post.title}
		</h2>

		<div class="mb-3 flex items-center gap-4 text-zinc-400">
			<span>{post.date}</span>
			{#if post.readingTime && post.readingTime > 0}
				<span>•</span>
				<span>{formatReadingTime(post.readingTime)}</span>
			{/if}
		</div>

		<p class="mb-4 leading-relaxed text-zinc-300">{post.description}</p>

		{#if post.tags && post.tags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each post.tags as tag}
					<span class="rounded bg-emerald-600/20 px-2 py-1 text-sm text-emerald-300">
						{tag}
					</span>
				{/each}
			</div>
		{/if}
	</article>
</a>
