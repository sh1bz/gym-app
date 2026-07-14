<script>
	import { store } from '$lib/store.svelte.js';
	import { EXDB, CATS, patternOfSplit, PATTERN_LABEL } from '$lib/seed.js';
	import { fmt } from '$lib/logic.js';
	import Icon from '$lib/components/Icon.svelte';

	const ed = $derived(store.program[store.edDay] ?? store.program[0]);
	const dayNames = $derived(ed.workout.map((x) => x.name));
	// Movement pattern of the day we're building (push/pull/legs/core), or null.
	const dayPat = $derived(patternOfSplit(ed.split));
	const dayPatLabel = $derived(dayPat ? PATTERN_LABEL[dayPat] : '');

	// Categories, sorted so the ones richest in the day's pattern come first.
	const libCats = $derived.by(() => {
		const list = CATS.map((c) => ({
			name: c,
			count: EXDB[c].length,
			match: EXDB[c].filter((e) => e.pattern === dayPat).length
		}));
		if (dayPat) list.sort((a, b) => b.match - a.match);
		return list;
	});

	// Exercises in the chosen category, with matching-pattern ones floated to the top.
	const libRows = $derived.by(() => {
		const list = (store.libCat ? EXDB[store.libCat] : []).map((x) => ({
			...x,
			inDay: dayNames.includes(x.name),
			match: !!dayPat && x.pattern === dayPat,
			patLabel: PATTERN_LABEL[x.pattern] || '',
			meta: `${x.sets} × ${x.reps} · ${x.start === 0 ? 'bodyweight' : fmt(x.start) + ' kg'} · rest ${x.rest}s`
		}));
		if (dayPat) list.sort((a, b) => (b.match ? 1 : 0) - (a.match ? 1 : 0));
		return list.map((x, i, arr) => ({ ...x, isLast: i === arr.length - 1 }));
	});

	const libBackLabel = $derived(store.libCat ? 'Categories' : ed.split);
	const libTitle = $derived(store.libCat || 'Choose a category');
	const libSub = $derived(
		store.libCat
			? (store.libSwapIdx != null ? 'tap to swap in' : 'tap to add to ' + ed.split) +
					(dayPat ? ' · ' + dayPatLabel.toLowerCase() + ' moves first' : '')
			: (store.libSwapIdx != null ? 'swapping an exercise on ' + ed.split : 'adding to ' + ed.split) +
					(dayPat ? ' · sorted for ' + dayPatLabel.toLowerCase() : '')
	);
	const libShowCats = $derived(!store.libCat);
</script>

<div class="screen">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<button class="back" onclick={() => store.libBack()}>
			<Icon name="chevron-left" size={14} stroke={2.6} style="stroke:var(--mute);" />
			{libBackLabel}
		</button>
	</div>

	<div class="body" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .09s both;">
		<div class="head">
			<div class="title">{libTitle}</div>
			<div class="sub">{libSub}</div>
		</div>

		{#if libShowCats}
			<div class="cats">
				{#each libCats as c}
					<button class="cat" onclick={() => store.pickCategory(c.name)}>
						<div class="cat-name">{c.name}</div>
						<div class="cat-count">
							{c.count} exercises{#if dayPat && c.match}<span class="cat-match">
									· {c.match} {dayPatLabel.toLowerCase()}</span
								>{/if}
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div class="list">
				{#each libRows as x}
					<button
						class="row"
						class:last={x.isLast}
						style="opacity:{x.inDay ? 0.45 : 1};"
						onclick={() => store.pickExercise(x)}
					>
						<span class="tile"><Icon name={x.icon} size={21} stroke={2.2} /></span>
						<div class="row-main">
							<div class="row-nameline">
								<span class="row-name">{x.name}</span>
								{#if x.patLabel}
									<span class="pat" class:match={x.match}>{x.patLabel}</span>
								{/if}
							</div>
							<div class="row-meta">{x.meta}</div>
						</div>
						{#if x.inDay}
							<span class="added">added</span>
						{:else}
							<span class="plus">+</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
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
	.head {
		padding: 16px 0 18px;
	}
	.title {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -.01em;
	}
	.sub {
		margin-top: 6px;
		font-size: 13px;
		color: var(--mute);
		font-weight: 500;
	}

	.cats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.cat {
		padding: 20px 16px;
		border-radius: 18px;
		background: var(--surface);
		border: none;
		text-align: left;
		color: var(--txt);
		cursor: pointer;
		transition: transform .12s cubic-bezier(.3,1.4,.5,1), background .15s;
	}
	.cat:active {
		transform: scale(.96);
		background: var(--surface-hi);
	}
	.cat-name {
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -.01em;
	}
	.cat-count {
		margin-top: 4px;
		font-size: 12px;
		color: var(--mute);
		font-weight: 500;
	}
	.cat-match {
		color: var(--accent);
		font-weight: 700;
	}

	.list {
		background: var(--surface);
		border-radius: 20px;
		overflow: hidden;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 13px;
		width: 100%;
		text-align: left;
		padding: 13px 14px;
		border: none;
		border-bottom: 1px solid var(--line);
		background: none;
		color: var(--txt);
		cursor: pointer;
		transition: background .15s;
	}
	.row.last {
		border-bottom: none;
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
	}
	.row-main {
		flex: 1;
		min-width: 0;
	}
	.row-nameline {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.row-name {
		font-size: 15px;
		font-weight: 600;
	}
	.pat {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 2px 6px;
		border-radius: 999px;
		color: var(--mute);
		background: var(--surface-hi);
		border: 1px solid var(--line);
		flex: 0 0 auto;
	}
	.pat.match {
		color: var(--accent);
		background: var(--accent-soft);
		border-color: var(--accent);
	}
	.row-meta {
		margin-top: 2px;
		font-size: 12px;
		color: var(--mute);
		font-weight: 500;
	}
	.added {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: .1em;
		text-transform: uppercase;
		color: var(--mute);
	}
	.plus {
		color: var(--accent);
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
	}
</style>
