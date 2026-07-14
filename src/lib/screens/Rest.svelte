<script>
	import { onMount } from 'svelte';
	import { store } from '$lib/store.svelte.js';
	import { fmtTime, RING_C } from '$lib/logic.js';
	import Icon from '$lib/components/Icon.svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';

	let ringEl = $state(null);
	let countEl = $state(null);
	let raf = 0;

	onMount(() => {
		const tick = () => {
			if (store.screen !== 'rest') {
				raf = 0;
				return;
			}
			const remain = store.restRemaining();
			const frac = store.restTotal > 0 ? Math.min(1, remain / store.restTotal) : 0;
			if (ringEl) ringEl.style.strokeDashoffset = String(RING_C * (1 - frac));
			if (countEl) countEl.textContent = fmtTime(remain);
			const ending = remain <= 10 && remain > 0;
			if (ending !== store.ending) store.ending = ending;
			if (remain <= 0) {
				raf = 0;
				store.onRestComplete();
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<div class="screen">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<button class="back" onclick={() => store.goHome()}>
			<Icon name="chevron-left" size={14} style="stroke:var(--mute);" />
			Resting
		</button>
		<div class="clock mono"><span class="dot"></span><span>{store.elapsed}</span></div>
	</div>

	<div class="body" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .09s both;">
		<div class="ring" style="animation:ringIn .5s cubic-bezier(.2,.8,.3,1.2) both;">
			<svg viewBox="0 0 270 270" style="width:100%;height:100%;transform:rotate(-90deg);">
				<circle cx="135" cy="135" r="125" style="fill:none;stroke:var(--surface-hi);stroke-width:14;" />
				<circle
					bind:this={ringEl}
					cx="135"
					cy="135"
					r="125"
					style="fill:none;stroke:{store.ending
						? 'var(--warn)'
						: 'var(--accent)'};stroke-width:14;stroke-linecap:round;stroke-dasharray:{RING_C};filter:drop-shadow(0 0 10px var(--accent-glow));transition:stroke .3s;"
				/>
			</svg>
			<div class="center">
				<div class="count mono" class:beat={store.ending} bind:this={countEl}>0:00</div>
				<div class="restlabel">rest</div>
			</div>
		</div>

		<div class="logged">
			<div class="chip">
				<span class="tick"><Icon name="check" size={11} stroke={3.4} style="stroke:var(--on-accent);" /></span>
				logged <b class="mono">{store.loggedText}</b>
			</div>
			<div class="lname">{store.loggedName}</div>
		</div>
	</div>

	<div class="controls" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .15s both;">
		<div class="adjust">
			<button class="adjbtn mono" onclick={() => store.minus15()}>−15s</button>
			<button class="adjbtn mono" onclick={() => store.plus15()}>+15s</button>
		</div>
		<PrimaryButton label="Start next set" icon="chevron-right" onclick={() => store.skipRest()} />
		<div class="next">up next · <b>{store.nextLabel}</b></div>
	</div>
</div>

<style>
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 32px;
		flex: 0 0 auto;
	}
	.back {
		display: flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.18em;
		color: var(--accent);
		text-transform: uppercase;
		padding: 4px 0;
	}
	.clock {
		display: flex;
		align-items: center;
		gap: 7px;
		font-weight: 500;
		font-size: 13px;
		color: var(--mute);
		letter-spacing: 0.04em;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		animation: pulse 2.4s infinite;
	}
	.body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 28px;
	}
	.ring {
		position: relative;
		width: 270px;
		height: 270px;
	}
	.center {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
	}
	.count {
		font-weight: 800;
		font-size: 72px;
		line-height: 1;
		letter-spacing: -0.03em;
	}
	.count.beat {
		animation: beat 0.8s infinite;
	}
	.restlabel {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.logged {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 9px 16px;
		border-radius: 999px;
		font-size: 14px;
		font-weight: 600;
	}
	.chip b {
		font-weight: 800;
	}
	.tick {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.lname {
		font-size: 18px;
		font-weight: 700;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 13px;
		flex: 0 0 auto;
	}
	.adjust {
		display: flex;
		gap: 12px;
	}
	.adjbtn {
		flex: 1;
		height: 56px;
		border-radius: 16px;
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--txt);
		font-weight: 700;
		font-size: 16px;
		cursor: pointer;
		transition:
			transform 0.12s,
			background 0.15s;
	}
	.adjbtn:active {
		transform: scale(0.95);
		background: var(--surface-hi);
	}
	.next {
		text-align: center;
		font-size: 13px;
		color: var(--mute);
		font-weight: 600;
		letter-spacing: 0.04em;
	}
	.next b {
		color: var(--txt);
	}
</style>
