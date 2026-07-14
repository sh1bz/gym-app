<script>
	import { onDestroy } from 'svelte';
	import { store } from '$lib/store.svelte.js';

	import Home from '$lib/screens/Home.svelte';
	import Active from '$lib/screens/Active.svelte';
	import Rest from '$lib/screens/Rest.svelte';
	import Detail from '$lib/screens/Detail.svelte';
	import Performance from '$lib/screens/Performance.svelte';
	import DayEditor from '$lib/screens/DayEditor.svelte';
	import Library from '$lib/screens/Library.svelte';

	import RepSheet from '$lib/sheets/RepSheet.svelte';
	import EndSheet from '$lib/sheets/EndSheet.svelte';
	import AddDaySheet from '$lib/sheets/AddDaySheet.svelte';
	import SettingsSheet from '$lib/sheets/SettingsSheet.svelte';
	import Toast from '$lib/sheets/Toast.svelte';

	const SCREENS = {
		home: Home,
		active: Active,
		rest: Rest,
		detail: Detail,
		perf: Performance,
		editDay: DayEditor,
		library: Library
	};
	const Current = $derived(SCREENS[store.screen] ?? Home);

	onDestroy(() => store.destroy());
</script>

<svelte:head>
	<title>Session</title>
</svelte:head>

<div class="app-root">
	<div class="app-frame">
		<div class="app-blob"></div>

		{#key store.screen}
			<Current />
		{/key}

		{#if store.sheetOpen}<RepSheet />{/if}
		{#if store.endSheetOpen}<EndSheet />{/if}
		{#if store.addSheetOpen}<AddDaySheet />{/if}
		{#if store.settingsOpen}<SettingsSheet />{/if}

		<Toast />
	</div>
</div>
