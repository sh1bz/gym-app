<script>
	import { store } from '$lib/store.svelte.js';
	import { genHistory, weekDateLabel, fmt, fmtMin, setSecs, exSecs } from '$lib/logic.js';
	import Icon from '$lib/components/Icon.svelte';

	const dx = $derived.by(() => {
		const dwk = store.program[store.detDay] ? store.program[store.detDay].workout : [];
		return dwk[store.detIdx] || dwk[0] || { name: '—', sets: 3, reps: 8, start: 0, rest: 60, trend: 'flat' };
	});
	const dBW = $derived(dx.start === 0);
	const nW = $derived(store.chartWeeks || 8);
	const step = $derived(store.stepVal);

	// back bar
	const detBackLabel = $derived(
		store.detFrom === 'perf' ? 'Performance' : store.detFrom === 'editDay' ? 'Editor' : 'Overview'
	);

	// name block
	const detName = $derived(dx.name);
	const detMeta = $derived(
		dx.sets +
			' sets · ' +
			dx.reps +
			' rep target · rest ' +
			dx.rest +
			's' +
			(dBW ? ' · bodyweight' : '') +
			' · ~' +
			setSecs(dx) +
			's a set + rest · ' +
			fmtMin(exSecs(dx)) +
			' total incl. rest'
	);
	const detCount = $derived(store.timesDone(dx.name));

	// history + chart
	const hist = $derived(genHistory(dx, nW));
	const hMin = $derived(Math.min(...hist));
	const hMax = $derived(Math.max(...hist));
	const hRange = $derived(hMax - hMin || 1);
	const pts = $derived(
		hist.map((v, k) => ({
			x: (16 + k * (288 / (nW - 1))).toFixed(1),
			y: (118 - ((v - hMin) / hRange) * 92).toFixed(1)
		}))
	);
	const chartPts = $derived(pts.map((p) => p.x + ',' + p.y).join(' '));
	const chartDots = $derived(
		pts
			.filter((_, k) => nW <= 8 || k === nW - 1)
			.map((p, idx, arr) => ({
				x: p.x,
				y: p.y,
				r: idx === arr.length - 1 ? '5' : '3',
				fill: idx === arr.length - 1 ? 'var(--accent)' : 'var(--surface-hi)'
			}))
	);

	const hDelta = $derived(hist[nW - 1] - hist[0]);
	const dUnit = $derived(dBW ? ' reps' : ' kg');
	const detDelta = $derived(
		(hDelta === 0 ? '0' : (hDelta > 0 ? '+' : '−') + fmt(Math.abs(hDelta))) + dUnit + ' · ' + nW + ' wk'
	);
	const detDeltaColor = $derived(hDelta > 0 ? '#36e0a0' : hDelta < 0 ? 'var(--warn)' : 'var(--mute)');
	const detNow = $derived(fmt(hist[nW - 1]) + dUnit);

	const chartXLabels = $derived(
		[nW - 1, Math.round(((nW - 1) * 2) / 3), Math.round((nW - 1) / 3), 0].map((back) => ({
			t: weekDateLabel(back)
		}))
	);
	const rangeChips = $derived(
		[8, 16, 26].map((n) => {
			const on = n === nW;
			return {
				n,
				label: n + 'W',
				bg: on ? 'var(--accent-soft)' : 'var(--surface-hi)',
				border: on ? 'var(--accent)' : 'var(--line)',
				color: on ? 'var(--accent)' : 'var(--mute)'
			};
		})
	);
	function setRange(n) {
		store.buzz(6);
		store.chartWeeks = n;
	}

	// edit rows
	const editRows = $derived([
		{
			label: 'Sets',
			val: String(dx.sets),
			minus: () => store.editField('sets', -1, 1, 10),
			plus: () => store.editField('sets', 1, 1, 10),
			op: '1',
			bb: '1px solid var(--line)'
		},
		{
			label: 'Rep target',
			val: String(dx.reps),
			minus: () => store.editField('reps', -1, 1, 60),
			plus: () => store.editField('reps', 1, 1, 60),
			op: '1',
			bb: '1px solid var(--line)'
		},
		{
			label: 'Weight',
			val: dBW ? 'BW' : fmt(dx.start),
			minus: dBW ? () => {} : () => store.editField('start', -step, 0, 500),
			plus: dBW ? () => {} : () => store.editField('start', step, 0, 500),
			op: dBW ? '0.35' : '1',
			bb: '1px solid var(--line)'
		},
		{
			label: 'Rest',
			val: dx.rest + 's',
			minus: () => store.editField('rest', -15, 15, 600),
			plus: () => store.editField('rest', 15, 15, 600),
			op: '1',
			bb: 'none'
		}
	]);
</script>

<div class="screen" style="overflow:auto;">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<button class="back" onclick={() => store.detBack()}>
			<Icon name="chevron-left" size={14} style="stroke:var(--mute);" />
			{detBackLabel}
		</button>
	</div>

	<div class="nameblock" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .09s both;">
		<div class="name">{detName}</div>
		<div class="meta">{detMeta}</div>
		<div class="pill">performed <b class="mono">{detCount}</b> times</div>
	</div>

	<div class="card progress" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .15s both;">
		<div class="prog-head">
			<span class="eyebrow">Progress</span>
			<span class="mono delta" style="color:{detDeltaColor};">{detDelta}</span>
		</div>
		<div class="chips">
			{#each rangeChips as c}
				<button
					class="chip mono"
					onclick={() => setRange(c.n)}
					style="border-color:{c.border};background:{c.bg};color:{c.color};">{c.label}</button
				>
			{/each}
		</div>
		<svg viewBox="0 0 320 140" class="chart">
			<line x1="16" y1="120" x2="304" y2="120" style="stroke:var(--line);stroke-width:1;" />
			<polyline
				points={chartPts}
				style="fill:none;stroke:var(--accent);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 6px var(--accent-glow));"
			/>
			{#each chartDots as p}
				<circle cx={p.x} cy={p.y} r={p.r} style="fill:{p.fill};stroke:var(--bg2);stroke-width:2;" />
			{/each}
		</svg>
		<div class="xlabels mono">
			{#each chartXLabels as xl}
				<span>{xl.t}</span>
			{/each}
		</div>
		<div class="thisweek">this week · <b class="mono">{detNow}</b></div>
	</div>

	<div class="card edit" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .21s both;">
		{#each editRows as r}
			<div class="row" style="border-bottom:{r.bb};">
				<span class="rlabel">{r.label}</span>
				<button class="step" onclick={r.minus} style="opacity:{r.op};">
					<Icon name="minus" size={18} stroke={3} />
				</button>
				<span class="rval mono">{r.val}</span>
				<button class="step" onclick={r.plus} style="opacity:{r.op};">
					<Icon name="plus" size={18} stroke={3} />
				</button>
			</div>
		{/each}
	</div>
	<div class="autosave">changes save automatically</div>
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

	.nameblock {
		margin-top: 26px;
		flex: 0 0 auto;
	}
	.name {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}
	.meta {
		margin-top: 7px;
		font-size: 13px;
		color: var(--mute);
		font-weight: 500;
	}
	.pill {
		margin-top: 10px;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: var(--surface);
		border-radius: 999px;
		padding: 6px 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--mute);
	}
	.pill b {
		font-weight: 800;
		font-size: 13px;
		color: var(--txt);
	}

	.card {
		flex: 0 0 auto;
		background: var(--surface);
		border-radius: 20px;
	}
	.progress {
		margin-top: 22px;
		padding: 16px;
	}
	.prog-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.eyebrow {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.18em;
		color: var(--mute);
		text-transform: uppercase;
	}
	.delta {
		font-weight: 700;
		font-size: 13px;
	}
	.chips {
		display: flex;
		gap: 6px;
		margin-top: 12px;
	}
	.chip {
		flex: 1;
		padding: 7px 0;
		border-radius: 999px;
		border: 1px solid var(--line);
		font-weight: 700;
		font-size: 12px;
		letter-spacing: 0.06em;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}
	.chip:active {
		transform: scale(0.96);
	}
	.chart {
		width: 100%;
		margin-top: 10px;
		overflow: visible;
	}
	.xlabels {
		display: flex;
		justify-content: space-between;
		margin-top: 8px;
		font-size: 11px;
		font-weight: 600;
		color: var(--mute);
		letter-spacing: 0.04em;
	}
	.thisweek {
		margin-top: 8px;
		text-align: center;
		font-size: 12px;
		font-weight: 600;
		color: var(--mute);
	}
	.thisweek b {
		font-weight: 700;
		color: var(--txt);
	}

	.edit {
		margin-top: 14px;
		overflow: hidden;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 11px 14px;
	}
	.rlabel {
		flex: 1;
		font-size: 14px;
		font-weight: 600;
	}
	.step {
		width: 44px;
		height: 44px;
		border-radius: 14px;
		background: var(--surface-hi);
		border: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--txt);
		transition:
			transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1),
			background 0.15s,
			border-color 0.15s;
	}
	.step:active {
		transform: scale(0.92);
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.rval {
		min-width: 64px;
		text-align: center;
		font-weight: 800;
		font-size: 18px;
	}
	.autosave {
		margin-top: 12px;
		text-align: center;
		font-size: 12px;
		color: var(--mute);
		font-weight: 600;
		letter-spacing: 0.04em;
		flex: 0 0 auto;
	}
</style>
