<script lang="ts">
	import type { Experience } from '$lib/types.js';

	interface Props {
		experience: Experience;
	}

	let { experience }: Props = $props();
</script>

<li
	class="card-base card-hover list-none border border-zinc-700 hover:border-emerald-400"
	role="listitem"
>
	<header class="mb-3 flex items-baseline justify-between">
		<span class="text-lg font-semibold tracking-wide text-zinc-100">
			{experience.company}
		</span>
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
		<div class="flex flex-wrap gap-2">
			{#each experience.technologies as tech}
				<span class="rounded bg-emerald-600/20 px-2 py-1 text-sm text-emerald-300">
					{tech}
				</span>
			{/each}
		</div>
	{/if}
</li>
