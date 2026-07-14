<script>
	import { store } from '$lib/store.svelte.js';
	import Icon from '$lib/components/Icon.svelte';
	import RollNumber from '$lib/components/RollNumber.svelte';

	const target = $derived(store.curEx.reps);
	const diff = $derived(store.repCount - target);
	const deltaColor = $derived(diff === 0 ? 'var(--accent)' : diff < 0 ? 'var(--warn)' : 'var(--good)');
	const deltaText = $derived(
		diff === 0 ? 'hit target' : diff > 0 ? '+' + diff + ' over target' : diff + ' under target'
	);
</script>

<div>
	<button
		class="backdrop"
		aria-label="Cancel"
		onclick={() => store.closeSheet()}
	></button>
	<div class="sheet">
		<div class="grab"></div>
		<div class="title">Reps completed</div>
		<div class="sub">target was <b class="mono">{target}</b></div>
		<div class="stepwrap">
			<button class="stepbtn" onclick={() => store.repMinus()} aria-label="One fewer rep">
				<Icon name="minus" size={30} stroke={3} />
			</button>
			<div class="repnum">
				<RollNumber value={store.repCount} tick={store.rTick} dir={store.rDir} size="86px" />
			</div>
			<button class="stepbtn" onclick={() => store.repPlus()} aria-label="One more rep">
				<Icon name="plus" size={30} stroke={3} />
			</button>
		</div>
		<div class="delta" style="color:{deltaColor};">{deltaText}</div>
		<button class="confirm" onclick={() => store.confirmReps()}>
			<Icon name="check" size={20} stroke={3.2} style="stroke:var(--on-accent);" />
			Confirm · {store.repCount} reps
		</button>
	</div>
</div>

<style>
	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(8, 9, 12, 0.6);
		backdrop-filter: blur(3px);
		z-index: 10;
		animation: fadeIn 0.28s ease both;
		border: none;
		cursor: pointer;
	}
	.sheet {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--bg2);
		border-top: 1px solid var(--line);
		border-radius: 28px 28px 0 0;
		padding: 24px 22px max(24px, env(safe-area-inset-bottom));
		z-index: 11;
		animation: sheetUp 0.34s cubic-bezier(0.2, 0.8, 0.25, 1) both;
	}
	.grab {
		width: 40px;
		height: 5px;
		border-radius: 3px;
		background: var(--line);
		margin: 0 auto 18px;
	}
	.title {
		text-align: center;
		font-size: 21px;
		font-weight: 700;
	}
	.sub {
		text-align: center;
		font-size: 13px;
		color: var(--mute);
		font-weight: 600;
		margin-top: 5px;
		letter-spacing: 0.04em;
	}
	.sub b {
		color: var(--txt);
	}
	.stepwrap {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 22px;
		margin: 22px 0 8px;
	}
	.stepbtn {
		width: 72px;
		height: 72px;
		border-radius: 22px;
		background: var(--surface);
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
	.stepbtn:active {
		transform: scale(0.9);
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.repnum {
		min-width: 110px;
		text-align: center;
		display: flex;
		justify-content: center;
	}
	.delta {
		text-align: center;
		height: 20px;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.05em;
	}
	.confirm {
		width: 100%;
		height: 70px;
		margin-top: 16px;
		border-radius: 20px;
		border: none;
		cursor: pointer;
		background: var(--accent);
		color: var(--on-accent);
		font-weight: 700;
		font-size: 18px;
		letter-spacing: 0.03em;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		transition: transform 0.12s;
	}
	.confirm:active {
		transform: scale(0.97);
	}
</style>
