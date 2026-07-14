<script>
	import Icon from './Icon.svelte';
	// Accent CTA reused for Log set / Start next set / Confirm / Save.
	let {
		label,
		icon = 'check',
		onclick,
		sweepTick = 0,
		breathe = false,
		height = 72,
		fontSize = 19,
		children = undefined
	} = $props();
</script>

<button
	class="cta"
	class:breathe
	style="height:{height}px;font-size:{fontSize}px;"
	{onclick}
>
	{#key sweepTick}
		{#if sweepTick}
			<span class="sweep"></span>
		{/if}
	{/key}
	{#if icon}
		<Icon name={icon} size={22} stroke={3.2} style="stroke:var(--on-accent);" />
	{/if}
	{#if children}{@render children()}{:else}{label}{/if}
</button>

<style>
	.cta {
		position: relative;
		overflow: hidden;
		width: 100%;
		border-radius: 20px;
		border: none;
		cursor: pointer;
		background: var(--accent);
		color: var(--on-accent);
		font-weight: 700;
		letter-spacing: 0.04em;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		box-shadow: 0 8px 30px -8px var(--accent-glow);
		transition: transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.cta.breathe {
		animation: glowBreathe 2.8s ease-in-out infinite;
	}
	.cta:active {
		transform: scale(0.97);
	}
	.sweep {
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0.35);
		transform: translateX(-101%);
		animation: sweep 0.5s ease;
	}
</style>
