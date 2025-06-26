<script lang="ts">
	import { onMount } from 'svelte';
	import MermaidDiagram from './MermaidDiagram.svelte';

	export let height = 400;
	export let diagram = '';
	export let rootMargin = '100px'; // Start loading 100px before viewport

	let containerElement: HTMLDivElement;
	let shouldRender = false;

	onMount(() => {
		if (!('IntersectionObserver' in window)) {
			// Fallback for browsers without IntersectionObserver
			shouldRender = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !shouldRender) {
						shouldRender = true;
						observer.disconnect();
						console.log('[MermaidViewport] Diagram entering viewport, starting render');
					}
				});
			},
			{
				rootMargin,
				threshold: 0
			}
		);

		observer.observe(containerElement);

		return () => {
			observer.disconnect();
		};
	});
</script>

<div bind:this={containerElement}>
	{#if shouldRender}
		<MermaidDiagram {height} {diagram} />
	{:else}
		<div
			class="flex items-center justify-center rounded-lg bg-zinc-900 p-4 text-zinc-500"
			style="min-height: {height}px"
		>
			<div class="text-center">
				<p class="text-sm">Diagram will load when visible</p>
				<p class="mt-1 text-xs opacity-50">Scroll to view</p>
			</div>
		</div>
	{/if}
</div>
