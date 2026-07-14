<script>
	import { store } from '$lib/store.svelte.js';
	import { dateStr, ago, fmtMin, exSecs, exLast } from '$lib/logic.js';
	import Icon from '$lib/components/Icon.svelte';

	const today = $derived(dateStr());

	function trendInfo(x) {
		if (x.trend === 'up') return { name: 'trend-up', color: 'var(--good)' };
		if (x.trend === 'down') return { name: 'trend-down', color: 'var(--warn)' };
		return { name: 'trend-flat', color: 'var(--mute)' };
	}

	const sections = $derived(
		store.order.map((di) => {
			const p = store.program[di];
			const pwk = p.workout;
			const live = store.sessionOn && di === store.day;
			const n = pwk.length;
			return {
				di,
				tag: p.split,
				isLive: live,
				showStart: !store.sessionOn && n > 0,
				showEdit: !live,
				meta:
					n +
					' exercises · ' +
					pwk.reduce((a, x) => a + x.sets, 0) +
					' sets · ' +
					fmtMin(pwk.reduce((a, x) => a + exSecs(x), 0)) +
					' · ' +
					ago(store.lastDone[p.id]),
				rows: pwk.map((x, i) => {
					const done = live && i < store.ex;
					const isCur = live && i === store.ex;
					return {
						i,
						x,
						name: x.name,
						meta:
							(isCur ? Math.min(store.setIdx, x.sets) + ' of ' : '') +
							x.sets +
							' sets · ' +
							x.reps +
							' reps · ' +
							fmtMin(exSecs(x)),
						last: exLast(x),
						trend: trendInfo(x),
						tileBg: isCur ? 'var(--accent)' : 'var(--accent-soft)',
						tileColor: isCur ? 'var(--on-accent)' : 'var(--accent)',
						rowOp: done ? 0.45 : 1,
						hasBorder: i < n - 1
					};
				})
			};
		})
	);

	const liveStatus = $derived(
		store.screen === 'home' && store.restEnd > Date.now()
			? 'resting'
			: 'set ' + Math.min(store.setIdx + 1, store.curEx.sets) + ' of ' + store.curEx.sets
	);
</script>

<div class="screen">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<div class="eyebrow">Session</div>
		<div class="topright">
			<span class="date mono">{today}</span>
			<button class="iconbtn press" onclick={() => store.openSettings()} aria-label="Settings">
				<Icon name="cog" size={17} stroke={2.4} style="stroke:var(--mute);" />
			</button>
			<button class="iconbtn accent press" onclick={() => store.goPerf()} aria-label="Performance">
				<Icon name="bar-chart" size={17} stroke={2.8} />
			</button>
		</div>
	</div>

	<div class="scroll">
		{#if store.sessionOn}
			<button class="inprogress" onclick={() => store.startOrResume()}>
				<div class="ipbody">
					<div class="ipeyebrow"><span class="dot"></span>{store.program[store.day].split} · in progress</div>
					<div class="ipname">{store.curEx.name}</div>
					<div class="ipmeta">
						<b class="mono">{store.elapsed}</b> elapsed ·
						<b class="mono accent">{store.doneSets}</b> of {store.totalSets} sets · {liveStatus}
					</div>
				</div>
				<Icon name="chevron-right" size={20} style="stroke:var(--accent);" />
			</button>
		{/if}

		<div class="sections" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .15s both;">
			{#each sections as sec (sec.di)}
				<div class="section">
					<div class="sechead">
						<div class="sechead-l">
							<div class="secname">
								{sec.tag}
								{#if sec.isLive}
									<span class="livetag"><span class="dot"></span>live</span>
								{/if}
							</div>
							<div class="secmeta">{sec.meta}</div>
						</div>
						{#if sec.showEdit}
							<button class="link mute" onclick={() => store.openEditDay(sec.di)}>Edit</button>
						{/if}
						{#if sec.showStart}
							<button class="link start" onclick={() => store.startDay(sec.di)}>
								Start<Icon name="chevron-right" size={13} stroke={3} />
							</button>
						{/if}
					</div>
					<div class="card">
						{#each sec.rows as r (r.i)}
							<button
								class="row"
								style="opacity:{r.rowOp};border-bottom:{r.hasBorder ? '1px solid var(--line)' : 'none'};"
								onclick={() => store.openDetail(sec.di, r.i, 'home')}
							>
								<span class="tile" style="background:{r.tileBg};color:{r.tileColor};">
									<Icon name={r.x.icon} size={21} stroke={2.4} />
								</span>
								<div class="rowmid">
									<div class="rowname">{r.name}</div>
									<div class="rowmeta">{r.meta}</div>
								</div>
								<div class="rowright">
									<span class="mono lastval">{r.last}</span>
									<span class="trend" style="color:{r.trend.color};">
										<Icon name={r.trend.name} size={15} stroke={2.8} />
									</span>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
			<button class="adddday press" onclick={() => store.openAddDay()}>+ Add day</button>
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
	.eyebrow {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.22em;
		color: var(--txt);
		text-transform: uppercase;
	}
	.topright {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.date {
		font-weight: 500;
		font-size: 13px;
		color: var(--mute);
		letter-spacing: 0.08em;
	}
	.iconbtn {
		width: 34px;
		height: 34px;
		border-radius: 11px;
		background: var(--surface);
		border: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.iconbtn.accent {
		color: var(--accent);
	}
	.iconbtn:active {
		background: var(--accent-soft);
		border-color: var(--accent);
	}
	.scroll {
		flex: 1;
		min-height: 0;
		overflow: auto;
		margin-top: 22px;
	}
	.inprogress {
		display: flex;
		align-items: center;
		gap: 14px;
		width: 100%;
		text-align: left;
		background: var(--accent-soft);
		border: 1px solid var(--accent);
		padding: 16px;
		border-radius: 18px;
		color: var(--txt);
		cursor: pointer;
		box-shadow: 0 8px 30px -12px var(--accent-glow);
		animation: glowBreathe 2.8s ease-in-out infinite;
		transition: transform 0.12s cubic-bezier(0.3, 1.4, 0.5, 1);
		margin-bottom: 18px;
	}
	.inprogress:active {
		transform: scale(0.98);
	}
	.ipbody {
		flex: 1;
		min-width: 0;
	}
	.ipeyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.ipname {
		margin-top: 7px;
		font-size: 19px;
		font-weight: 700;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ipmeta {
		margin-top: 5px;
		font-size: 13px;
		color: var(--mute);
		font-weight: 500;
	}
	.ipmeta b {
		color: var(--txt);
	}
	.ipmeta b.accent {
		color: var(--accent);
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		animation: pulse 2.4s infinite;
		flex: 0 0 auto;
	}
	.section {
		margin-bottom: 26px;
	}
	.sechead {
		display: flex;
		align-items: flex-end;
		gap: 10px;
		padding: 0 4px 10px;
	}
	.sechead-l {
		flex: 1;
		min-width: 0;
	}
	.secname {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.livetag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.secmeta {
		margin-top: 3px;
		font-size: 12px;
		color: var(--mute);
		font-weight: 500;
	}
	.link {
		flex: 0 0 auto;
		background: none;
		border: none;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: 6px 4px;
		cursor: pointer;
	}
	.link.mute {
		color: var(--mute);
	}
	.link.mute:active {
		color: var(--txt);
	}
	.link.start {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--accent);
		font-weight: 700;
	}
	.link.start:active {
		opacity: 0.6;
	}
	.card {
		background: var(--surface);
		border-radius: 20px;
		overflow: hidden;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 13px;
		padding: 12px 14px;
		cursor: pointer;
		transition: background 0.15s;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-radius: 0;
		color: var(--txt);
	}
	.row:active {
		background: var(--surface-hi);
	}
	.tile {
		width: 38px;
		height: 38px;
		border-radius: 11px;
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.rowmid {
		flex: 1;
		min-width: 0;
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
	.rowright {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 0 0 auto;
	}
	.lastval {
		font-weight: 700;
		font-size: 14px;
		color: var(--txt);
	}
	.trend {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.adddday {
		width: 100%;
		padding: 15px;
		border-radius: 20px;
		background: none;
		border: 1px dashed var(--line);
		color: var(--mute);
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		margin-bottom: 10px;
		transition:
			color 0.15s,
			border-color 0.15s;
	}
	.adddday:active {
		color: var(--accent);
		border-color: var(--accent);
	}
</style>
