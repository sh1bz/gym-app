<script>
	import { store } from '$lib/store.svelte.js';
	import { fmt, fmtMin, exSecs } from '$lib/logic.js';
	import Icon from '$lib/components/Icon.svelte';

	const ed = $derived(store.program[store.edDay] ?? store.program[0]);

	const subMeta = $derived(
		ed.workout.length +
			' exercises · ' +
			fmtMin(ed.workout.reduce((a, x) => a + exSecs(x), 0))
	);

	const delDayOp = $derived(store.program.length > 1 ? 1 : 0.35);

	const rows = $derived(
		ed.workout.map((x, i) => ({
			i,
			name: x.name,
			meta:
				(x.cat || '—') +
				' · ' +
				x.sets +
				' sets · ' +
				x.reps +
				' reps · ' +
				(x.start === 0 ? 'BW' : fmt(x.start) + ' kg') +
				' · ' +
				fmtMin(exSecs(x)),
			hasBorder: i < ed.workout.length - 1,
			remOp: ed.workout.length <= 1 ? 0.35 : 1
		}))
	);
</script>

<div class="screen">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<button class="back" onclick={() => store.goHome()}>
			<Icon name="chevron-left" size={14} stroke={2.6} style="stroke:var(--mute);" />
			Done
		</button>
		<button
			class="delday"
			style="opacity:{delDayOp};"
			onclick={() => store.deleteDay()}>Delete day</button
		>
	</div>

	<div class="scroll" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .09s both;">
		<div class="titleblock">
			<div class="titlerow">
				<input
					class="title"
					value={ed.split}
					oninput={(e) => store.renameDay(e.currentTarget.value)}
					placeholder="Name this day"
				/>
				<Icon name="pencil" size={15} stroke={2.2} style="stroke:var(--mute);flex:0 0 auto;" />
			</div>
			<div class="sub">{subMeta} · tap the name to rename · changes save automatically</div>
		</div>

		<div class="body">
			<div class="card">
				{#each rows as r (r.i)}
					<div class="row" style="border-bottom:{r.hasBorder ? '1px solid var(--line)' : 'none'};">
						<div
							class="rowmid"
							onclick={() => store.openDetail(store.edDay, r.i, 'editDay')}
							role="button"
							tabindex="0"
						>
							<div class="rowname">{r.name}</div>
							<div class="rowmeta">{r.meta}</div>
						</div>
						<button class="cta swap" onclick={() => store.openSwapEx(r.i)} aria-label="Swap exercise">
							<Icon name="swap" size={17} stroke={2.6} />
						</button>
						<button
							class="cta remove"
							style="opacity:{r.remOp};"
							onclick={() => store.removeEx(r.i)}
							aria-label="Remove exercise"
						>
							<Icon name="x" size={16} stroke={2.8} />
						</button>
					</div>
				{/each}
			</div>
			<button class="addex" onclick={() => store.openAddEx()}>+ Add exercise</button>
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
	.delday {
		background: none;
		border: none;
		color: var(--mute);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		padding: 4px;
	}
	.delday:active {
		color: var(--warn);
	}
	.scroll {
		flex: 1;
		min-height: 0;
		overflow: auto;
		margin-top: 8px;
	}
	.titleblock {
		padding: 16px 0 0;
	}
	.titlerow {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	.title {
		flex: 1;
		min-width: 0;
		background: none;
		border: none;
		outline: none;
		border-bottom: 1px dashed var(--line);
		color: var(--txt);
		font-family: 'Space Grotesk', system-ui, sans-serif;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.01em;
		padding: 0 0 2px;
	}
	.sub {
		margin-top: 6px;
		font-size: 13px;
		color: var(--mute);
		font-weight: 500;
	}
	.body {
		margin-top: 18px;
	}
	.card {
		background: var(--surface);
		border-radius: 20px;
		overflow: hidden;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
	}
	.rowmid {
		flex: 1;
		min-width: 0;
		cursor: pointer;
	}
	.rowname {
		font-size: 15px;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rowmeta {
		margin-top: 2px;
		font-size: 12px;
		color: var(--mute);
		font-weight: 500;
	}
	.cta {
		flex: 0 0 auto;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: var(--surface-hi);
		border: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.cta.swap {
		color: var(--txt);
		transition:
			transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1),
			background 0.15s,
			border-color 0.15s;
	}
	.cta.swap:active {
		transform: scale(0.9);
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.cta.remove {
		color: var(--mute);
		transition:
			transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1),
			color 0.15s;
	}
	.cta.remove:active {
		transform: scale(0.9);
		color: var(--warn);
	}
	.addex {
		width: 100%;
		margin-top: 12px;
		padding: 16px;
		border-radius: 18px;
		background: var(--accent-soft);
		border: 1px solid var(--accent);
		color: var(--accent);
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.03em;
		cursor: pointer;
		transition: transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.addex:active {
		transform: scale(0.98);
	}
</style>
