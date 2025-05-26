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
		{
			href: 'https://github.com/wcygan',
			label: 'GitHub',
			external: true,
			icon: '/icons/github-light.svg'
		},
		{
			href: 'https://www.linkedin.com/in/wcygan',
			label: 'LinkedIn',
			external: true,
			icon: '/icons/linkedin.svg'
		}
	];
</script>

<nav class="sticky top-0 z-10 border-b border-zinc-700/50 bg-zinc-800/95 backdrop-blur-sm">
	<div class="mx-auto max-w-3xl px-4 py-6 md:max-w-4xl">
		<div class="flex justify-center gap-6">
			{#each navItems as { href, label, external, icon }}
				<a
					{href}
					class="flex items-center gap-1 text-zinc-100 transition-all duration-200 hover:text-emerald-400"
					target={external ? '_blank' : undefined}
					rel={external ? 'noopener noreferrer' : undefined}
					aria-label={label}
				>
					{#if icon}
						<!-- header icon sizes -->
						<img src={icon} alt="" class="h-7 w-7" />
						<span class="sr-only">{label}</span>
					{:else}
						<!-- header text sizes -->
						<span class="text-lg">{label}</span>
					{/if}
				</a>
			{/each}
		</div>
	</div>
</nav>
