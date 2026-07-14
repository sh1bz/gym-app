# Session — Workout Tracker

A dead-simple, one-set-at-a-time mobile workout logger. You see exactly one set at a time:
the suggested weight, the rep target, big ± controls, and a Log button. Log a set → confirm
reps → rest ring → next set. Built to be operated mid-set, sweaty, one-handed.

Ported from the "Session" design handoff. **Mobile-only, portrait.** Offline-first with optional
cloud sync.

## Stack

- **SvelteKit + Vite** (Svelte 5 runes), rendered as a client-side SPA.
- **Offline-first persistence**: the whole app state is cached in `localStorage` on every mutation,
  so a refresh mid-set restores exactly (screen, set index, weight, timestamps). The rest timer is
  **timestamp-based**, so it stays accurate across backgrounding.
- **Supabase (Postgres + Auth)** for cross-device sync — optional. When configured, the app syncs
  the state blob to `app_state` and appends every set to `set_logs`. Sign-in is passwordless
  (magic-link email). Without Supabase keys the app runs fully local.
- **Cloudflare Pages** for hosting (`@sveltejs/adapter-cloudflare`).

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

The app works immediately with local storage only — no backend needed.

## Enable cloud sync (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) (creates `app_state` +
   `set_logs` with row-level security so each user sees only their own data).
3. In **Authentication → Providers**, ensure **Email** is enabled (magic link is on by default).
4. Copy `.env.example` to `.env` and fill in from **Settings → API**:
   ```
   PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart `npm run dev`. Open **Settings** (cog, top-right) → **Sign in** with your email.

> The `anon` key is safe to ship to the browser — access is enforced by row-level security, not the key.

## Deploy to Cloudflare Pages

**Option A — connect the Git repo (recommended):**

1. Push this repo to GitHub/GitLab.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings:
   - Framework preset: **SvelteKit**
   - Build command: `npm run build`
   - Build output directory: `.svelte-kit/cloudflare`
4. Add the two `PUBLIC_SUPABASE_*` environment variables (Settings → Environment variables).
5. In Supabase **Authentication → URL Configuration**, add your Pages URL to **Redirect URLs**
   so magic-link sign-in returns to the deployed app.

**Option B — direct upload from the CLI:**

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare
```

## Project layout

```
src/
  app.css                 design tokens, fonts, keyframes
  lib/
    seed.js               seed program + exercise library
    logic.js              pure helpers (formatting, streak, chart history, progression rule)
    supabase.js           Supabase client (guarded; null when unconfigured)
    store.svelte.js       central state machine + persistence + sync (the app's brain)
    components/           Icon, RollNumber (odometer), PrimaryButton
    screens/              Home, Active, Rest, Detail, Performance, DayEditor, Library
    sheets/               RepSheet, EndSheet, AddDaySheet, SettingsSheet, Toast
  routes/                 +layout (SPA), +page (frame + screen switch)
supabase/schema.sql       database schema + RLS policies
```

## What's real vs. seeded

Per the design handoff, historical data (per-lift trend, chart history, "times performed" counts,
streak history) is **seeded** so the UI looks alive from day one. Every logged set is now written to
`set_logs`, so this can be swapped for real derived data over time. The weight-recommendation rule
(progress +2.5 kg when all sets hit top of range; hold otherwise) is implemented in
`logic.js → suggestNextWeight` and ready to wire to logged history (spec §5: deload + variation
rotation are the next steps).
