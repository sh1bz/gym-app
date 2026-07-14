/// <reference types="@sveltejs/kit" />
// Offline-first service worker: precache the app shell + assets so Session
// launches and runs with no signal (a gym is a dead-zone). Data already lives
// in localStorage; this caches the code so the whole PWA works offline.
import { build, files, prerendered, version } from '$service-worker';

const CACHE = `session-${version}`;
const PRECACHE = [...build, ...files, ...prerendered];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	// Never intercept cross-origin (Supabase auth/sync, Google Fonts) — let them hit the network.
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Cache-first for immutable build assets.
			if (PRECACHE.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}

			// Network-first for everything else, falling back to cache, then the app shell.
			try {
				const response = await fetch(request);
				if (response.ok && response.type === 'basic') cache.put(request, response.clone());
				return response;
			} catch {
				const cached = await cache.match(request);
				if (cached) return cached;
				if (request.mode === 'navigate') {
					const shell = (await cache.match('/')) || (await cache.match('/index.html'));
					if (shell) return shell;
				}
				throw new Error('offline and not cached');
			}
		})()
	);
});
