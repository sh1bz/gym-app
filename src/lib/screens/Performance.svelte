<script>
	import { store } from '$lib/store.svelte.js';
	import Icon from '$lib/components/Icon.svelte';
	import { streakOf, weekStart, dayStart, exLast, findCat } from '$lib/logic.js';
	import { CATS, DAY_MS } from '$lib/seed.js';

	// ---- streak ----
	const sessions = $derived(store.sessions || []);
	const today0 = $derived(dayStart(Date.now()));
	const thisWeek = $derived(weekStart(Date.now()));
	const streakWeeks = $derived(streakOf(sessions));
	const weekCount = $derived(sessions.filter((t) => weekStart(t) === thisWeek).length);
	const trainedDays = $derived(new Set(sessions.map((t) => dayStart(t))));

	const DL = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
	const dayDots = $derived(
		Array.from({ length: 7 }, (_, k) => {
			const t = today0 - (6 - k) * DAY_MS;
			const on = trainedDays.has(t) || (k === 6 && store.sessionOn);
			const isToday = k === 6;
			return {
				l: DL[(new Date(t).getDay() + 6) % 7],
				bg: on ? 'var(--accent)' : 'var(--line)',
				glow: on ? '0 0 8px var(--accent-glow)' : 'none',
				color: isToday ? 'var(--txt)' : 'var(--mute)',
				anim:
					'dotIn .45s cubic-bezier(.3,1.6,.5,1) ' +
					(0.3 + k * 0.07).toFixed(2) +
					's both' +
					(on && isToday ? ', pulse 2.4s 1.4s infinite' : '')
			};
		})
	);

	// ---- performance ----
	const trendBits = (x) => ({
		trendUp: x.trend === 'up',
		trendDown: x.trend === 'down',
		trendFlat: !x.trend || x.trend === 'flat',
		trendColor: x.trend === 'up' ? '#36e0a0' : x.trend === 'down' ? 'var(--warn)' : 'var(--mute)'
	});

	const perfAll = $derived.by(() => {
		const seen = {};
		const all = [];
		store.program.forEach((p, di) =>
			p.workout.forEach((x, i) => {
				if (seen[x.name]) return;
				seen[x.name] = true;
				all.push({ x, di, i, dayName: p.split });
			})
		);
		all.sort((a, b) => store.timesDone(b.x.name) - store.timesDone(a.x.name));
		return all;
	});

	const perfSub = $derived(perfAll.length + ' exercises tracked · tap one to see its curve');

	const perfSections = $derived(
		CATS.map((cat) => {
			const items = perfAll.filter((o) => (o.x.cat || findCat(o.x.name)) === cat);
			return {
				name: cat,
				meta: items.length + (items.length === 1 ? ' exercise' : ' exercises'),
				rows: items.map((o, k) => ({
					name: o.x.name,
					count: store.timesDone(o.x.name),
					meta: o.dayName + ' · ' + o.x.sets + ' × ' + o.x.reps,
					last: exLast(o.x),
					...trendBits(o.x),
					bb: k < items.length - 1 ? '1px solid var(--line)' : 'none',
					open: () => store.openDetail(o.di, o.i, 'perf')
				}))
			};
		}).filter((sec) => sec.rows.length)
	);
</script>

<div class="screen">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<button class="back" onclick={() => store.goHome()}>
			<Icon name="chevron-left" size={14} stroke={2.6} style="stroke:var(--mute);" />
			Overview
		</button>
	</div>

	<div class="body" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .09s both;">
		<div style="padding:16px 0 18px;">
			<div style="font-size:28px;font-weight:700;letter-spacing:-.01em;">Performance</div>
			<div style="margin-top:6px;font-size:13px;color:var(--mute);font-weight:500;">{perfSub}</div>
		</div>

		<div class="streak">
			<div style="flex:0 0 auto;">
				<div style="display:flex;align-items:baseline;gap:6px;">
					<span class="mono" style="font-weight:800;font-size:28px;line-height:1;color:var(--accent);">{store.streakDisp ?? streakWeeks}</span>
					<span style="font-size:13px;font-weight:700;color:var(--txt);">wk</span>
				</div>
				<div style="margin-top:4px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);">streak · {weekCount} this week</div>
			</div>
			<div style="flex:1;"></div>
			<div style="display:flex;gap:9px;flex:0 0 auto;">
				{#each dayDots as dd}
					<div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
						<span style="width:9px;height:9px;border-radius:50%;background:{dd.bg};box-shadow:{dd.glow};animation:{dd.anim};"></span>
						<span style="font-size:9px;font-weight:700;color:{dd.color};letter-spacing:.05em;">{dd.l}</span>
					</div>
				{/each}
			</div>
		</div>

		{#each perfSections as ps}
			<div style="margin-bottom:22px;">
				<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 4px 10px;">
					<span style="font-size:16px;font-weight:700;letter-spacing:-.01em;">{ps.name}</span>
					<span style="font-size:12px;color:var(--mute);font-weight:600;">{ps.meta}</span>
				</div>
				<div style="background:var(--surface);border-radius:20px;overflow:hidden;">
					{#each ps.rows as e}
						<div class="row" onclick={e.open} style="border-bottom:{e.bb};">
							<span class="tile mono">{e.count}×</span>
							<div style="flex:1;min-width:0;">
								<div style="font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{e.name}</div>
								<div style="margin-top:2px;font-size:12px;color:var(--mute);font-weight:500;">{e.meta}</div>
							</div>
							<div style="display:flex;align-items:center;gap:8px;flex:0 0 auto;">
								<span class="mono" style="font-weight:700;font-size:14px;color:var(--txt);">{e.last}</span>
								<span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;color:{e.trendColor};">
									{#if e.trendUp}
										<Icon name="trend-up" size={15} stroke={2.8} />
									{:else if e.trendDown}
										<Icon name="trend-down" size={15} stroke={2.8} />
									{:else if e.trendFlat}
										<Icon name="trend-flat" size={15} stroke={2.8} />
									{/if}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.topbar {
		display: flex;
		align-items: center;
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
		letter-spacing: .18em;
		color: var(--mute);
		text-transform: uppercase;
		padding: 4px 0;
	}
	.body {
		flex: 1;
		min-height: 0;
		overflow: auto;
		margin-top: 8px;
	}
	.streak {
		display: flex;
		align-items: center;
		gap: 16px;
		background: var(--surface);
		border-radius: 18px;
		padding: 13px 16px;
		margin-bottom: 12px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 13px;
		padding: 12px 14px;
		cursor: pointer;
		transition: background .15s;
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
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 800;
		font-size: 12px;
	}
</style>
