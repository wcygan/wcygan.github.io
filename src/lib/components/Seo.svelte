<script lang="ts">
    export let title = 'Will Cygan | Blog';
    export let description = 'Software Engineer interested in distributed systems, web applications, and system design.';
    export let url = 'https://wcygan.github.io/';
    export let image = '/wcygan.jpeg';
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{url}" />
    <meta property="og:image" content="{image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="{url}" />
    <meta name="twitter:image" content="{image}" />
</svelte:head>
