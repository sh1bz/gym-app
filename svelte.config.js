import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// This is a client-side state-machine app; prerender the shell.
		alias: {
			$lib: 'src/lib'
		}
	}
};

export default config;
