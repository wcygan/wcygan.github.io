<script lang="ts">
	interface Props {
		title: string;
		children: any;
	}

	let { title, children }: Props = $props();
</script>

<div class="rounded-lg bg-emerald-900/20 border border-emerald-400/30 p-4 my-6">
	<h4 class="text-emerald-400 font-semibold mb-2">✨ {title}</h4>
	<div class="text-zinc-100">
		{@render children()}
	</div>
</div>