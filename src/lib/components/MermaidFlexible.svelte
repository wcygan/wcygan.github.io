<script lang="ts">
	import MermaidDiagram from './MermaidDiagram.svelte';
	import MermaidViewport from './MermaidViewport.svelte';

	export let height = 400;
	export let diagram: string | undefined = undefined;
	export let lazy = false;
	export let viewport = false;

	// If diagram prop is not provided, use slot content
	let slotContent = '';

	$: finalDiagram = diagram || slotContent;
</script>

<!-- Hidden div to capture slot content -->
<div style="display: none" contenteditable="true" bind:textContent={slotContent}>
	<slot />
</div>

{#if viewport}
	<MermaidViewport {height} diagram={finalDiagram} />
{:else if lazy}
	{#await import('./MermaidLazy.svelte') then { default: MermaidLazy }}
		<MermaidLazy {height} diagram={finalDiagram} />
	{/await}
{:else}
	<MermaidDiagram {height} diagram={finalDiagram} />
{/if}
