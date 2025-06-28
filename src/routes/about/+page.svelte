<script lang="ts">
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';
	import { experiences } from '$lib/data/experiences.js';
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 text-4xl font-bold">About</h1>
	<div class="prose prose-emerald prose-invert max-w-none">
		<div class="mb-8">
			<img
				src="/wcygan.jpeg"
				alt="Will Cygan"
				class="mx-auto mb-6 h-48 w-48 rounded-lg object-cover"
			/>
		</div>

		<p class="mb-6 text-lg text-center">
		Software Engineer from Chicago, Illinois
		</p>

		<h2>Experience</h2>
		<section id="experience" aria-labelledby="exp-heading" class="not-prose mb-8">
			<ul class="grid gap-6 md:grid-cols-1">
				{#each experiences as experience (experience.id)}
					<ExperienceCard {experience} />
				{/each}
			</ul>
		</section>

		<h2>Connect</h2>
		<p>
			Feel free to reach out if you'd like to discuss technology, system design, or potential
			collaboration opportunities. You can find me on <a
				href="https://github.com/wcygan"
				target="_blank"
				rel="noopener noreferrer"
				class="text-emerald-400 hover:text-emerald-300">GitHub</a
			>
			or
			<a
				href="https://linkedin.com/in/wcygan"
				target="_blank"
				rel="noopener noreferrer"
				class="text-emerald-400 hover:text-emerald-300">LinkedIn</a
			>.
		</p>
	</div>
</div>
