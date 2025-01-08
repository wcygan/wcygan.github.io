<script lang="ts">
interface NavItem {
    href: string;
    label: string;
    external?: boolean;
}

const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/will_cygan_resume.pdf', label: 'Resume', external: true },
    { href: 'https://github.com/wcygan', label: 'GitHub', external: true },
    { href: 'https://www.linkedin.com/in/wcygan', label: 'LinkedIn', external: true }
];
</script>

<nav class="mb-16 max-w-3xl mx-auto sticky top-0 bg-zinc-800/80 backdrop-blur-sm z-10 p-4">
    <div class="flex gap-6 justify-center">
        {#each navItems as {href, label, external}}
            <a 
                {href} 
                class="text-zinc-100 hover:text-emerald-400 transition-all duration-200"
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
            >
                {label}
            </a>
        {/each}
    </div>
</nav>
