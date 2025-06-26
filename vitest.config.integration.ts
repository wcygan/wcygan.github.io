import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		globals: true,
		include: ['tests/integration/**/*.{test,spec}.{js,ts}'],
		testTimeout: 30000,
		hookTimeout: 30000,
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true
			}
		}
	},
	resolve: {
		alias: {
			mermaid: 'mermaid/dist/mermaid.esm.min.mjs'
		}
	}
});