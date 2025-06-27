<script lang="ts">
	interface Props {
		type: 'concept' | 'insight';
		title: string;
		children: any;
	}

	let { type, title, children }: Props = $props();

	const isKeyConceptType = $derived(type === 'concept');
	const boxStyles = $derived(isKeyConceptType
		? 'rounded-lg bg-emerald-900/20 border border-emerald-400/30 p-4 my-6'
		: 'rounded-lg bg-zinc-700/50 border border-zinc-600 p-4 my-6');
	const titleStyles = $derived(isKeyConceptType
		? 'text-emerald-400 font-semibold mb-2'
		: 'text-zinc-100 font-semibold mb-2');
	const contentStyles = $derived(isKeyConceptType ? 'text-zinc-100' : 'text-zinc-300');
	const icon = $derived(isKeyConceptType ? '✨' : '💡');
</script>

<div class={boxStyles}>
	<h4 class={titleStyles}>{icon} {title}</h4>
	<div class={contentStyles}>
		{@render children()}
	</div>
</div>