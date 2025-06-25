<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import MermaidDiagram from './MermaidDiagram.svelte';
	
	export let height = 400;
	export let diagram = '';
	export let rootMargin = '100px'; // Start loading 100px before viewport
	
	let containerElement: HTMLDivElement;
	let shouldRender = false;
	let isIntersecting = false;

	onMount(() => {
		if (!browser || !('IntersectionObserver' in window)) {
			// Fallback for browsers without IntersectionObserver
			shouldRender = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting && !shouldRender) {
						isIntersecting = true;
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
			class="rounded-lg bg-zinc-900 p-4 flex items-center justify-center text-zinc-500" 
			style="min-height: {height}px"
		>
			<div class="text-center">
				<p class="text-sm">Diagram will load when visible</p>
				<p class="text-xs mt-1 opacity-50">Scroll to view</p>
			</div>
		</div>
	{/if}
</div>