<script lang="ts">
interface NavItem {
    href: string;
    label: string;
    external?: boolean;
    icon?: string;
}

const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/will_cygan_resume.pdf', label: 'Resume', external: true },
    { href: 'https://github.com/wcygan', label: 'GitHub', external: true, icon: '/icons/github-light.svg' },
    { href: 'https://www.linkedin.com/in/wcygan', label: 'LinkedIn', external: true, icon: '/icons/linkedin.svg' }
];
</script>

<nav class="mb-16 max-w-3xl mx-auto sticky top-0 bg-zinc-800/80 backdrop-blur-sm z-10 p-4">
    <div class="flex gap-6 justify-center">
        {#each navItems as {href, label, external, icon}}
            <a 
                {href} 
                class="text-zinc-100 hover:text-emerald-400 transition-all duration-200 flex items-center gap-1"
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                aria-label={label}
            >
                {#if icon}
                    <img src={icon} alt="" class="w-8 h-8" />
                    <span class="sr-only">{label}</span>
                {:else}
                    <span class="text-xl">{label}</span>
                {/if}
            </a>
        {/each}
    </div>
</nav>
