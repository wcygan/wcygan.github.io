<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	let { children } = $props();

	// Selective redirect: only redirect root path to wcygan.net
	if (browser && $page.url.pathname === '/' && $page.url.search === '') {
		window.location.href = 'https://wcygan.net/';
	}
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Will Cygan | Blog RSS Feed"
		href="/rss.xml"
	/>
</svelte:head>

<div class="min-h-screen">
	<Navbar />
	<main class="mx-auto max-w-3xl px-4 py-8 md:max-w-4xl">
		<div class="rounded-lg border-2 border-white p-8">
			{@render children()}
		</div>
	</main>
</div>
