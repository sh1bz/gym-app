<script>
	import { store } from '$lib/store.svelte.js';
	import { supabaseEnabled } from '$lib/supabase.js';
	import Icon from '$lib/components/Icon.svelte';

	const ACCENTS = ['#ff4e27', '#ff9d1b', '#4e7bff', '#36e0a0'];
	const STEPS = ['1.25', '2.5', '5'];

	let email = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let err = $state('');

	async function send() {
		if (!email.trim()) return;
		sending = true;
		err = '';
		const { error } = await store.signIn(email.trim());
		sending = false;
		if (error) err = error;
		else sent = true;
	}

	const syncLabel = $derived(
		{
			local: 'Local only',
			syncing: 'Syncing…',
			synced: 'Synced',
			offline: 'Offline — will retry'
		}[store.syncState] ?? 'Local only'
	);
</script>

<div>
	<button class="backdrop" aria-label="Close" onclick={() => store.closeSettings()}></button>
	<div class="sheet">
		<div class="grab"></div>
		<div class="title">Settings</div>

		<div class="label">Accent</div>
		<div class="accents">
			{#each ACCENTS as hex (hex)}
				<button
					class="swatch"
					class:on={store.accent === hex}
					style="background:{hex};"
					aria-label={hex}
					onclick={() => store.setAccent(hex)}
				>
					{#if store.accent === hex}
						<Icon name="check" size={16} stroke={3.4} style="stroke:var(--on-accent);" />
					{/if}
				</button>
			{/each}
		</div>

		<div class="label">Weight step</div>
		<div class="segmented">
			{#each STEPS as s (s)}
				<button class="seg mono" class:on={store.microStep === s} onclick={() => store.setMicroStep(s)}>
					{s} kg
				</button>
			{/each}
		</div>

		<button class="rowtoggle" onclick={() => store.toggleHaptics()}>
			<div class="rl">
				<div class="rt">Haptics</div>
				<div class="rm">Vibrate on steppers, log & rest end</div>
			</div>
			<span class="switch" class:on={store.haptics}><span class="knob"></span></span>
		</button>

		<div class="label">Account</div>
		{#if !supabaseEnabled}
			<div class="note">
				Cloud sync isn't configured yet. Your data is saved on this device. Add Supabase keys to sync
				across devices.
			</div>
		{:else if store.user}
			<div class="account">
				<div class="acol">
					<div class="rt">{store.user.email ?? 'Signed in'}</div>
					<div class="rm">
						<span class="syncdot" class:ok={store.syncState === 'synced'}></span>{syncLabel}
					</div>
				</div>
				<button class="ghost" onclick={() => store.signOut()}>Sign out</button>
			</div>
		{:else if sent}
			<div class="note">Check your email for a sign-in link, then reopen the app.</div>
		{:else}
			<div class="note">Sign in to back up and sync across devices. No password — we email a link.</div>
			<div class="signin">
				<input
					class="email"
					type="email"
					placeholder="you@email.com"
					bind:value={email}
					autocomplete="email"
				/>
				<button class="send" onclick={send} disabled={sending}>{sending ? '…' : 'Send link'}</button>
			</div>
			{#if err}<div class="err">{err}</div>{/if}
		{/if}

		<button class="done" onclick={() => store.closeSettings()}>Done</button>
	</div>
</div>

<style>
	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(8, 9, 12, 0.6);
		backdrop-filter: blur(3px);
		z-index: 10;
		animation: fadeIn 0.28s ease both;
		border: none;
		cursor: pointer;
	}
	.sheet {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		max-height: 88%;
		overflow: auto;
		background: var(--bg2);
		border-top: 1px solid var(--line);
		border-radius: 28px 28px 0 0;
		padding: 24px 22px max(24px, env(safe-area-inset-bottom));
		z-index: 11;
		animation: sheetUp 0.34s cubic-bezier(0.2, 0.8, 0.25, 1) both;
	}
	.grab {
		width: 40px;
		height: 5px;
		border-radius: 3px;
		background: var(--line);
		margin: 0 auto 18px;
	}
	.title {
		text-align: center;
		font-size: 21px;
		font-weight: 700;
		margin-bottom: 6px;
	}
	.label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--mute);
		margin: 20px 0 10px;
	}
	.accents {
		display: flex;
		gap: 12px;
	}
	.swatch {
		width: 52px;
		height: 52px;
		border-radius: 16px;
		border: 2px solid transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.swatch:active {
		transform: scale(0.92);
	}
	.swatch.on {
		border-color: var(--txt);
	}
	.segmented {
		display: flex;
		gap: 8px;
	}
	.seg {
		flex: 1;
		padding: 12px 0;
		border-radius: 14px;
		background: var(--surface-hi);
		border: 1px solid var(--line);
		color: var(--mute);
		font-weight: 700;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.15s;
	}
	.seg.on {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.rowtoggle {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 14px 16px;
		margin-top: 20px;
		cursor: pointer;
		color: var(--txt);
	}
	.rl {
		flex: 1;
	}
	.rt {
		font-size: 15px;
		font-weight: 600;
	}
	.rm {
		margin-top: 3px;
		font-size: 12px;
		color: var(--mute);
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.switch {
		width: 46px;
		height: 28px;
		border-radius: 999px;
		background: var(--surface-hi);
		border: 1px solid var(--line);
		flex: 0 0 auto;
		position: relative;
		transition: background 0.2s;
	}
	.switch.on {
		background: var(--accent);
		border-color: var(--accent);
	}
	.knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--txt);
		transition: transform 0.2s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.switch.on .knob {
		transform: translateX(18px);
		background: var(--on-accent);
	}
	.note {
		font-size: 13px;
		color: var(--mute);
		font-weight: 500;
		line-height: 1.5;
	}
	.account {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 14px 16px;
	}
	.acol {
		flex: 1;
		min-width: 0;
	}
	.syncdot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--warn);
	}
	.syncdot.ok {
		background: var(--good);
	}
	.signin {
		display: flex;
		gap: 8px;
		margin-top: 10px;
	}
	.email {
		flex: 1;
		min-width: 0;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 0 14px;
		height: 52px;
		color: var(--txt);
		font-size: 15px;
		outline: none;
	}
	.email:focus {
		border-color: var(--accent);
	}
	.send {
		flex: 0 0 auto;
		padding: 0 18px;
		height: 52px;
		border-radius: 14px;
		border: none;
		background: var(--accent);
		color: var(--on-accent);
		font-weight: 700;
		font-size: 14px;
		cursor: pointer;
	}
	.send:disabled {
		opacity: 0.6;
	}
	.ghost {
		flex: 0 0 auto;
		background: var(--surface-hi);
		border: 1px solid var(--line);
		color: var(--txt);
		font-weight: 600;
		font-size: 13px;
		border-radius: 12px;
		padding: 10px 14px;
		cursor: pointer;
	}
	.err {
		margin-top: 8px;
		font-size: 12px;
		color: var(--warn);
		font-weight: 600;
	}
	.done {
		width: 100%;
		height: 56px;
		margin-top: 24px;
		border-radius: 18px;
		border: none;
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--txt);
		font-weight: 700;
		font-size: 15px;
		cursor: pointer;
	}
	.done:active {
		background: var(--surface-hi);
	}
</style>
