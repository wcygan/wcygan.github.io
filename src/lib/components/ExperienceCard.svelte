<script lang="ts">
	import type { Experience } from '$lib/types.js';

	interface Props {
		experience: Experience;
	}

	let { experience }: Props = $props();

	// Detect current role (contains "Present" in period)
	const isCurrent = $derived(experience.period.toLowerCase().includes('present'));

	// Categorize technologies by type for better visual organization
	function getTechCategory(
		tech: string
	): 'language' | 'framework' | 'database' | 'tool' | 'platform' {
		const techLower = tech.toLowerCase();

		// Languages
		if (['java', 'python', 'javascript', 'typescript'].includes(techLower)) {
			return 'language';
		}

		// Frameworks/Libraries
		if (['spring boot', 'rest.li', 'ember.js', 'opencv'].includes(techLower)) {
			return 'framework';
		}

		// Databases
		if (['mysql', 'hdfs', 'venice'].includes(techLower)) {
			return 'database';
		}

		// Big Data/Streaming Tools
		if (['kafka', 'spark', 'beam', 'flink', 'airflow', 'temporal', 'grpc'].includes(techLower)) {
			return 'tool';
		}

		// Default to platform/tool
		return 'platform';
	}

	function getTechStyles(category: string): string {
		switch (category) {
			case 'language':
				return 'bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/30 hover:bg-blue-600/30';
			case 'framework':
				return 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/30 hover:bg-purple-600/30';
			case 'database':
				return 'bg-orange-600/20 text-orange-300 ring-1 ring-orange-500/30 hover:bg-orange-600/30';
			case 'tool':
				return 'bg-green-600/20 text-green-300 ring-1 ring-green-500/30 hover:bg-green-600/30';
			default:
				return 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-600/30';
		}
	}
</script>

<li
	class="card-base card-hover list-none border border-zinc-700 hover:border-emerald-400"
	role="listitem"
>
	<header class="mb-3 flex items-baseline justify-between">
		<div class="flex items-center gap-2">
			<span class="text-lg font-semibold tracking-wide text-zinc-100">
				{experience.company}
			</span>
			{#if isCurrent}
				<span
					class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-300 ring-1 ring-yellow-500/30"
				>
					Current
				</span>
			{/if}
		</div>
		<time class="text-sm text-zinc-400" datetime={experience.period}>
			{experience.period}
		</time>
	</header>

	<h3 class="mb-2 text-base font-medium text-emerald-400">
		{experience.title}
	</h3>

	{#if experience.location}
		<p class="mb-2 text-sm text-zinc-400">
			{experience.location}
		</p>
	{/if}

	<p class="mb-4 text-sm leading-relaxed text-zinc-300">
		{experience.summary}
	</p>

	{#if experience.achievements && experience.achievements.length > 0}
		<div class="mb-4">
			<h4 class="mb-2 text-sm font-medium text-zinc-100">Key Achievements:</h4>
			<ul class="list-inside list-disc space-y-1">
				{#each experience.achievements as achievement}
					<li class="text-sm text-zinc-300">{achievement}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if experience.technologies && experience.technologies.length > 0}
		<div class="flex flex-wrap gap-2.5">
			{#each experience.technologies as tech}
				{@const category = getTechCategory(tech)}
				<span
					class="rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm {getTechStyles(
						category
					)}"
					title="Category: {category}"
				>
					{tech}
				</span>
			{/each}
		</div>
	{/if}
</li>
