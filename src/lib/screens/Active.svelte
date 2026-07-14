<script>
	import { store } from '$lib/store.svelte.js';
	import { fmt } from '$lib/logic.js';
	import Icon from '$lib/components/Icon.svelte';
	import RollNumber from '$lib/components/RollNumber.svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';

	const w = $derived(store.curEx);
	const rec = $derived(store.currentRec);
	const isBW = $derived(w.start === 0);
	const weightText = $derived(isBW ? 'BW' : fmt(store.weight));
	const weightSize = $derived(
		(weightText.length <= 4 ? 104 : weightText.length === 5 ? 92 : 76) + 'px'
	);
	const step = $derived(store.stepVal);
	const segs = $derived(
		Array.from({ length: w.sets }, (_, i) => ({
			state: i < store.setIdx ? 'done' : i === store.setIdx ? 'current' : 'pending'
		}))
	);
	const doneCount = $derived(Math.min(store.setIdx, w.sets));
</script>

<div class="screen">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<button class="back" onclick={() => store.goHome()}>
			<Icon name="chevron-left" size={14} style="stroke:var(--mute);" />
			<b>{store.program[store.day].split}</b>
		</button>
		<div class="clock mono">
			<span class="dot"></span><span>{store.elapsed}</span>
		</div>
	</div>

	{#key store.exTick}
		<div class="exblock" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .09s both;">
			<div class="exname" style="animation:exIn .45s cubic-bezier(.2,.8,.3,1.1);">{w.name}</div>
			<div class="pillrow">
				<div class="lastpill">last time&nbsp;<span class="mono val">{store.lastTimeFor(w)}</span></div>
				{#if rec.kind === 'progress' && w.start !== 0}
					<div class="rectag up"><Icon name="trend-up" size={12} stroke={3} /> +2.5 kg</div>
				{:else if rec.kind === 'deload'}
					<div class="rectag down"><Icon name="trend-down" size={12} stroke={3} /> deload</div>
				{/if}
			</div>
		</div>
	{/key}

	<div class="hero" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .15s both;">
		<div class="segwrap">
			<div class="segs">
				{#each segs as s, i (i)}
					<div class="seg {s.state}"></div>
				{/each}
			</div>
			<div class="seglabel"><b class="mono">{doneCount}</b> of {w.sets} sets done</div>
		</div>

		<div class="weightbox">
			{#key store.pulseTick}
				{#if store.pulseTick}<span class="pulse"></span>{/if}
			{/key}
			<RollNumber value={weightText} tick={store.wTick} dir={store.wDir} size={weightSize} />
		</div>
		<div class="unit">{isBW ? 'bodyweight' : 'kg'}</div>
		<div class="target">
			target <b class="mono">{w.reps}</b><span class="reps">reps</span>
		</div>

		<div class="stepper" style="opacity:{isBW ? 0.3 : 1};">
			<button
				class="stepbtn"
				onpointerdown={() => store.holdStart(-step)}
				onpointerup={() => store.holdEnd()}
				onpointerleave={() => store.holdEnd()}
				onpointercancel={() => store.holdEnd()}
				disabled={isBW}
			>
				<Icon name="minus" size={26} stroke={3} />{fmt(step)}
			</button>
			<button
				class="stepbtn"
				onpointerdown={() => store.holdStart(step)}
				onpointerup={() => store.holdEnd()}
				onpointerleave={() => store.holdEnd()}
				onpointercancel={() => store.holdEnd()}
				disabled={isBW}
			>
				{fmt(step)}<Icon name="plus" size={26} stroke={3} />
			</button>
		</div>
	</div>

	<div class="actions" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .21s both;">
		<PrimaryButton
			label="Log set"
			icon="check"
			breathe
			sweepTick={store.sweepTick}
			onclick={() => store.logSet()}
		/>
		<div class="textrow">
			<button onclick={() => store.skipSet()}>Skip set</button>
			<button onclick={() => store.warmup()}>Warm-up set</button>
			<button class="warn" onclick={() => store.endSession()}>End session</button>
		</div>
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
		font-weight: 600;
		letter-spacing: 0.18em;
		color: var(--mute);
		text-transform: uppercase;
		padding: 4px 0;
	}
	.back b {
		color: var(--txt);
		font-weight: 700;
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
	.exblock {
		margin-top: 30px;
		flex: 0 0 auto;
	}
	.exname {
		font-size: 32px;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1;
	}
	.pillrow {
		margin-top: 11px;
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.lastpill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--mute);
		font-weight: 500;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 6px 12px;
		border-radius: 999px;
	}
	.rectag {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.03em;
		padding: 6px 11px;
		border-radius: 999px;
	}
	.rectag.up {
		color: var(--accent);
		background: var(--accent-soft);
		border: 1px solid var(--accent);
	}
	.rectag.down {
		color: var(--warn);
		background: color-mix(in srgb, var(--warn) 12%, transparent);
		border: 1px solid var(--warn);
	}
	.lastpill .val {
		color: var(--txt);
		font-weight: 700;
	}
	.hero {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
	.segwrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 9px;
		margin-bottom: 6px;
	}
	.segs {
		display: flex;
		gap: 8px;
	}
	.seg {
		height: 9px;
		width: 30px;
		border-radius: 4px;
		transition: all 0.35s;
		background: var(--line);
	}
	.seg.done {
		background: var(--accent);
		box-shadow: 0 0 14px var(--accent-glow);
		transform: scaleY(1.15);
		animation: segPop 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
	}
	.seg.current {
		background: repeating-linear-gradient(
			90deg,
			var(--accent),
			var(--accent) 4px,
			transparent 4px,
			transparent 8px
		);
		opacity: 0.6;
	}
	.seglabel {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.seglabel b {
		color: var(--accent);
	}
	.weightbox {
		position: relative;
		width: 100%;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.pulse {
		position: absolute;
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background: radial-gradient(circle, var(--accent-soft), transparent 70%);
		opacity: 0;
		pointer-events: none;
		animation: radialPulse 0.5s ease-out;
	}
	.unit {
		font-size: 17px;
		font-weight: 600;
		color: var(--mute);
		margin-top: -4px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
	}
	.target {
		margin-top: 12px;
		font-size: 15px;
		color: var(--txt);
		font-weight: 600;
		letter-spacing: 0.04em;
	}
	.target b {
		color: var(--accent);
		font-size: 18px;
	}
	.target .reps {
		color: var(--mute);
		margin: 0 4px;
	}
	.stepper {
		width: 100%;
		margin-top: 24px;
		display: flex;
		gap: 12px;
		transition: opacity 0.3s;
	}
	.stepbtn {
		flex: 1;
		height: 56px;
		border-radius: 16px;
		background: var(--surface);
		border: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		cursor: pointer;
		color: var(--txt);
		font-family: 'JetBrains Mono', monospace;
		font-weight: 700;
		font-size: 15px;
		touch-action: none;
		transition:
			transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1),
			background 0.15s,
			border-color 0.15s;
	}
	.stepbtn:active:not(:disabled) {
		transform: scale(0.95);
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.actions {
		display: flex;
		flex-direction: column;
		gap: 13px;
		flex: 0 0 auto;
		margin-top: 4px;
	}
	.textrow {
		display: flex;
		justify-content: center;
		gap: 26px;
	}
	.textrow button {
		background: none;
		border: none;
		color: var(--mute);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		padding: 4px;
	}
	.textrow button:active {
		color: var(--txt);
	}
	.textrow button.warn:active {
		color: var(--warn);
	}
</style>
