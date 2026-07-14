<script>
	import { store } from '$lib/store.svelte.js';
	import { EXDB, CATS } from '$lib/seed.js';
	import { fmt } from '$lib/logic.js';
	import Icon from '$lib/components/Icon.svelte';

	const ed = $derived(store.program[store.edDay] ?? store.program[0]);
	const dayNames = $derived(ed.workout.map((x) => x.name));

	const libCats = $derived(CATS.map((c) => ({ name: c, count: EXDB[c].length })));

	const libRows = $derived(
		(store.libCat ? EXDB[store.libCat] : []).map((x, i, arr) => ({
			...x,
			inDay: dayNames.includes(x.name),
			meta: `${x.sets} × ${x.reps} · ${x.start === 0 ? 'bodyweight' : fmt(x.start) + ' kg'} · rest ${x.rest}s`,
			isLast: i === arr.length - 1
		}))
	);

	const libBackLabel = $derived(store.libCat ? 'Categories' : ed.split);
	const libTitle = $derived(store.libCat || 'Choose a category');
	const libSub = $derived(
		store.libCat
			? (store.libSwapIdx != null ? 'tap to swap in' : 'tap to add to ' + ed.split)
			: (store.libSwapIdx != null ? 'swapping an exercise on ' + ed.split : 'adding to ' + ed.split)
	);
	const libShowCats = $derived(!store.libCat);
</script>

<div class="screen">
	<div class="topbar" style="animation:rise .5s cubic-bezier(.2,.8,.3,1.1) .03s both;">
		<button class="back" onclick={() => store.libBack()}>
			<svg viewBox="0 0 24 24" class="chev"><polyline points="15 6 9 12 15 18"></polyline></svg>
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
						<div class="cat-count">{c.count} exercises</div>
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
							<div class="row-name">{x.name}</div>
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
	.chev {
		width: 14px;
		height: 14px;
		stroke: var(--mute);
		stroke-width: 2.6;
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
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
	.row-name {
		font-size: 15px;
		font-weight: 600;
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
