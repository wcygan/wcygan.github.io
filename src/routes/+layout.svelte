<script lang="ts">
    import '../app.css';
    let { children } = $props();
</script>

<div class="min-h-screen px-4 py-8">
    <nav class="mb-16 max-w-3xl mx-auto sticky top-0 bg-zinc-800/80 backdrop-blur-sm z-10 p-4">
        <div class="flex gap-6 justify-center">
            <a href="/" class="text-zinc-100 hover:text-emerald-400 transition-all duration-200">Home</a>
            <a href="/blog" class="text-zinc-100 hover:text-emerald-400 transition-all duration-200">Blog</a>
            <a href="/will_cygan_resume.pdf" class="text-zinc-100 hover:text-emerald-400 transition-all duration-200" target="_blank" rel="noopener noreferrer">Resume</a>
            <a href="https://github.com/wcygan" class="text-zinc-100 hover:text-emerald-400 transition-all duration-200" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/wcygan" class="text-zinc-100 hover:text-emerald-400 transition-all duration-200" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
    </nav>

    <main class="max-w-3xl mx-auto border-2 border-white rounded-lg p-8">
        {@render children()}
    </main>
</div>
