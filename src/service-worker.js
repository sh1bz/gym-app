/// <reference types="@sveltejs/kit" />
// Offline-first service worker. Precache the app shell + assets so Session
// launches with no signal. Strategy:
//   • immutable hashed build assets → cache-first (fast, content-addressed)
//   • everything else (navigations, prerendered shell, static files) →
//     network-first with cache fallback, so new deploys apply on the next load
//     instead of a version behind, while still working fully offline.
import { build, files, prerendered, version } from '$service-worker';

const CACHE = `session-${version}`;
const PRECACHE = [...build, ...files, ...prerendered];
const IMMUTABLE = new Set(build); // hashed filenames — safe to serve from cache forever

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
	// Never intercept cross-origin (Supabase auth/sync, Google Fonts).
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Immutable hashed build assets: cache-first.
			if (IMMUTABLE.has(url.pathname)) {
				const hit = await cache.match(url.pathname);
				if (hit) return hit;
				const res = await fetch(request);
				if (res.ok) cache.put(url.pathname, res.clone());
				return res;
			}

			// Navigations, the prerendered shell, and static files: network-first.
			try {
				const res = await fetch(request);
				if (res.ok && res.type === 'basic') cache.put(request, res.clone());
				return res;
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
