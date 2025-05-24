<script lang="ts">
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    let { children } = $props();
</script>

<svelte:head>
    <link rel="alternate" type="application/rss+xml" title="Will Cygan | Blog RSS Feed" href="/rss.xml" />
</svelte:head>

<div class="min-h-screen px-4 py-8">
    <Navbar />
    <main class="max-w-3xl md:max-w-4xl mx-auto border-2 border-white rounded-lg p-8">
        {@render children()}
    </main>
</div>
