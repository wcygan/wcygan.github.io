<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import Loading from './Loading.svelte';
	import { getCachedSVG, setCachedSVG } from '$lib/utils/mermaid-cache';

	export let height = 400;
	export let diagram = '';

	let container: HTMLDivElement;
	let rendered = false;
	let error = false;
	let errorMessage = '';
	let status = 'initializing';
	let isMounted = false;

	async function loadMermaid() {
		try {
			// Use the standard import which Vite will handle with the alias
			console.log('[MermaidDiagram] Loading Mermaid module...');
			const mod = await import('mermaid');
			const mermaid = mod.default || mod;
			console.log('[MermaidDiagram] Mermaid loaded successfully');
			return mermaid;
		} catch (e) {
			console.error('[MermaidDiagram] Failed to load Mermaid:', e);
			throw new Error(
				`Failed to load Mermaid module: ${e instanceof Error ? e.message : String(e)}`
			);
		}
	}

	async function renderDiagram() {
		try {
			// Wait for container to be available
			if (!container) {
				await tick();
				// Give DOM more time to mount the container
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			// Check cache first
			const cachedSVG = getCachedSVG(diagram);
			if (cachedSVG && container) {
				console.log('[MermaidDiagram] Using cached SVG');
				container.innerHTML = cachedSVG;

				// Add accessibility attributes to cached SVG as well
				const svgElement = container.querySelector('svg');
				if (svgElement) {
					svgElement.setAttribute('role', 'img');
					svgElement.setAttribute(
						'aria-label',
						`Mermaid diagram: ${diagram.split('\n')[0].trim()}`
					);
				}

				rendered = true;
				status = 'complete';
				return;
			}

			// Import Mermaid
			status = 'loading module';
			const mermaid = await loadMermaid();

			if (!mermaid || typeof mermaid.initialize !== 'function') {
				throw new Error('Mermaid loaded but missing expected methods');
			}

			console.log(
				'[MermaidDiagram] Mermaid version:',
				(mermaid as { version?: string }).version || 'unknown'
			);

			// Initialize
			status = 'initializing';
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'loose',
				logLevel: 'debug',
				flowchart: {
					useMaxWidth: true,
					htmlLabels: true,
					curve: 'basis'
				}
			});

			// Ensure container exists
			await tick();
			if (!container) {
				// Wait a bit more if container isn't ready
				await new Promise((resolve) => setTimeout(resolve, 50));
				await tick();
			}

			if (!container) {
				throw new Error('Container element not available');
			}

			// Generate unique ID
			const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

			// Clean the diagram text
			const cleanDiagram = diagram.trim();

			console.log('[MermaidDiagram] Rendering with ID:', id);
			status = 'rendering';

			// Render the diagram
			const renderResult = await mermaid.render(id, cleanDiagram);

			if (!renderResult || !renderResult.svg) {
				throw new Error('No SVG returned from render');
			}

			console.log('[MermaidDiagram] SVG generated, length:', renderResult.svg.length);

			// Cache the rendered SVG
			setCachedSVG(diagram, renderResult.svg);

			// Insert SVG
			container.innerHTML = renderResult.svg;

			// Add accessibility attributes to the SVG
			const svgElement = container.querySelector('svg');
			if (svgElement) {
				svgElement.setAttribute('role', 'img');
				svgElement.setAttribute('aria-label', `Mermaid diagram: ${diagram.split('\n')[0].trim()}`);
			}

			rendered = true;
			status = 'complete';

			console.log('[MermaidDiagram] Render complete!');

			// Clean up any orphaned elements
			setTimeout(() => {
				const orphans = document.querySelectorAll(`[id^="d${id}"]`);
				orphans.forEach((el) => {
					if (!container.contains(el)) {
						el.remove();
					}
				});
			}, 100);
		} catch (e) {
			console.error('[MermaidDiagram] Error:', e);
			error = true;
			errorMessage = e instanceof Error ? e.message : String(e);
			status = 'error';
			rendered = true;
		}
	}

	onMount(() => {
		// onMount only runs in the browser, so we don't need to check $app/environment
		isMounted = true;

		if (!diagram || diagram.trim() === '') {
			error = true;
			errorMessage = 'No diagram content provided';
			rendered = true;
			return;
		}

		console.log('[MermaidDiagram] Component mounted');
		console.log('[MermaidDiagram] Diagram preview:', diagram.substring(0, 50) + '...');

		status = 'starting';

		// Add a small delay to ensure DOM is fully ready
		const timeoutId = setTimeout(async () => {
			// Double-check container is available
			await tick();
			renderDiagram();
		}, 100);

		// Cleanup on unmount
		return () => {
			clearTimeout(timeoutId);
		};
	});
</script>

<div
	class="mermaid-container relative overflow-x-auto rounded-lg bg-zinc-900 p-4"
	style="min-height: {height}px"
>
	{#if !rendered && isMounted}
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center">
				<Loading />
				<p class="mt-2 text-sm text-zinc-400">Status: {status}</p>
			</div>
		</div>
	{/if}

	{#if error}
		<div
			transition:fade={{ duration: 200 }}
			class="flex flex-col items-center justify-center text-red-400"
			style="height: {height}px"
		>
			<p class="font-bold">Error rendering diagram</p>
			<p class="mt-2 text-sm">{errorMessage}</p>
			<details class="mt-4 w-full max-w-2xl">
				<summary class="cursor-pointer">Diagram Source</summary>
				<pre class="mt-2 overflow-x-auto rounded bg-zinc-800 p-2 text-xs">{diagram}</pre>
			</details>
			<details class="mt-2 w-full max-w-2xl">
				<summary class="cursor-pointer">Debug Info</summary>
				<div class="mt-2 rounded bg-zinc-800 p-2 text-xs">
					<p>Status: {status}</p>
					<p>Component mounted: {isMounted}</p>
					<p>Diagram length: {diagram.length}</p>
				</div>
			</details>
		</div>
	{/if}

	<!-- Container for rendered diagram -->
	<div
		bind:this={container}
		class="mermaid-render-container"
		class:hidden={!rendered || error}
		transition:fade={{ duration: 300 }}
	></div>

	{#if !isMounted}
		<div class="flex items-center justify-center" style="height: {height}px">
			<p class="text-zinc-400">Loading diagram...</p>
		</div>
	{/if}
</div>

<style>
	.mermaid-container {
		margin: 1.5rem 0;
	}

	.hidden {
		display: none;
	}

	:global(.mermaid-render-container svg) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 0 auto;
	}

	/* Dark theme styles */
	:global(.mermaid-render-container) {
		color: #e4e4e7;
	}

	:global(.mermaid-render-container text) {
		fill: #e4e4e7 !important;
		font-family: 'Inter', system-ui, sans-serif !important;
	}

	:global(.mermaid-render-container .node rect),
	:global(.mermaid-render-container .node circle),
	:global(.mermaid-render-container .node ellipse),
	:global(.mermaid-render-container .node polygon),
	:global(.mermaid-render-container .node path) {
		fill: #27272a !important;
		stroke: #52525b !important;
		stroke-width: 2px;
	}

	:global(.mermaid-render-container .label) {
		color: #e4e4e7 !important;
		fill: #e4e4e7 !important;
	}

	:global(.mermaid-render-container .edgePath .path) {
		stroke: #71717a !important;
		stroke-width: 2px !important;
		fill: none !important;
	}

	:global(.mermaid-render-container .edgeLabel) {
		background-color: #18181b !important;
		fill: #e4e4e7 !important;
	}

	:global(.mermaid-render-container .cluster rect) {
		fill: #18181b !important;
		stroke: #3f3f46 !important;
	}

	:global(.mermaid-render-container .cluster text) {
		fill: #a1a1aa !important;
	}

	/* State diagram specific */
	:global(.mermaid-render-container .statediagram-state rect) {
		fill: #27272a !important;
		stroke: #52525b !important;
	}

	/* Sequence diagram specific */
	:global(.mermaid-render-container .actor) {
		fill: #27272a !important;
		stroke: #52525b !important;
	}

	:global(.mermaid-render-container .actor-line) {
		stroke: #52525b !important;
	}

	:global(.mermaid-render-container .messageLine0),
	:global(.mermaid-render-container .messageLine1) {
		stroke: #71717a !important;
	}

	:global(.mermaid-render-container .messageText) {
		fill: #e4e4e7 !important;
	}

	/* Git graph specific */
	:global(.mermaid-render-container .commit) {
		fill: #34d399 !important;
		stroke: #10b981 !important;
	}

	/* Flowchart specific */
	:global(.mermaid-render-container .flowchart-link) {
		stroke: #71717a !important;
		fill: none !important;
	}

	/* Error styles */
	details {
		cursor: pointer;
	}

	details summary:hover {
		text-decoration: underline;
	}
</style>
