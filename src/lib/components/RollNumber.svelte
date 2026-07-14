<script>
	// Mechanical odometer roll: replays a vertical roll whenever `tick` changes.
	// Skips the animation on first mount so screen-entrance isn't doubled up.
	let { value, tick = 0, dir = 'up', size = '104px', color = 'var(--txt)' } = $props();

	let mounted = $state(false);
	$effect(() => {
		tick; // track
		if (!mounted) {
			mounted = true;
		}
	});
</script>

{#key tick}
	<div
		class="roll {mounted && tick ? (dir === 'up' ? 'up' : 'down') : ''}"
		style="font-size:{size};color:{color};"
	>
		{value}
	</div>
{/key}

<style>
	.roll {
		position: relative;
		font-family: 'JetBrains Mono', monospace;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.04em;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		will-change: transform, opacity;
	}
	.roll.up {
		animation: rollUp 0.16s ease;
	}
	.roll.down {
		animation: rollDown 0.16s ease;
	}
</style>
