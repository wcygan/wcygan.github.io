<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';
	import { formatReadingTime } from '$lib/utils/readingTime';

	export let data: PageData;
	const Content = data.content;

	// Convert date to ISO format for SEO
	const publishedTime = new Date(data.meta.date).toISOString();
</script>

<Seo
	title={data.meta.title}
	description={data.meta.description}
	url="/blog/{data.slug}"
	type="article"
	{publishedTime}
	tags={data.meta.tags || []}
/>

<article class="mdsvex-content prose prose-emerald prose-invert max-w-none">
	<!-- Enhanced metadata header -->
	<header class="mb-8 border-b border-zinc-700 pb-6">
		<h1 class="mb-4">{data.meta.title}</h1>

		<div class="mb-4 flex flex-wrap items-center gap-4 text-zinc-400">
			<span>{data.meta.date}</span>
			{#if data.meta.readingTime}
				<span>•</span>
				<span>{formatReadingTime(data.meta.readingTime)}</span>
			{/if}
		</div>

		{#if data.meta.tags && data.meta.tags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each data.meta.tags as tag}
					<span class="rounded bg-emerald-600/20 px-2 py-1 text-sm text-emerald-300">
						{tag}
					</span>
				{/each}
			</div>
		{/if}
	</header>

	<!-- Render the actual markdown content -->
	<Content />
</article>
