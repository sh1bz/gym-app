<script>
	// All glyphs are stroke-based, currentColor, matching the prototype.
	let { name, size = 20, stroke = 2.6, style = '' } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	style="width:{size}px;height:{size}px;stroke:currentColor;stroke-width:{stroke};fill:none;stroke-linecap:round;stroke-linejoin:round;{style}"
	aria-hidden="true"
>
	{#if name === 'bar'}
		<line x1="7.5" y1="12" x2="16.5" y2="12" />
		<line x1="6" y1="7.5" x2="6" y2="16.5" />
		<line x1="18" y1="7.5" x2="18" y2="16.5" />
		<line x1="3" y1="9.5" x2="3" y2="14.5" />
		<line x1="21" y1="9.5" x2="21" y2="14.5" />
	{:else if name === 'db'}
		<line x1="9.5" y1="12" x2="14.5" y2="12" />
		<line x1="7.5" y1="8" x2="7.5" y2="16" />
		<line x1="16.5" y1="8" x2="16.5" y2="16" />
	{:else if name === 'bw'}
		<circle cx="12" cy="5.5" r="2.4" />
		<line x1="12" y1="8.5" x2="12" y2="14.5" />
		<line x1="8" y1="11" x2="16" y2="11" />
		<line x1="12" y1="14.5" x2="9.2" y2="19" />
		<line x1="12" y1="14.5" x2="14.8" y2="19" />
	{:else if name === 'chevron-right'}
		<polyline points="9 6 15 12 9 18" />
	{:else if name === 'chevron-left'}
		<polyline points="15 6 9 12 15 18" />
	{:else if name === 'check'}
		<polyline points="4 12 10 18 20 6" />
	{:else if name === 'plus'}
		<line x1="12" y1="5" x2="12" y2="19" />
		<line x1="5" y1="12" x2="19" y2="12" />
	{:else if name === 'minus'}
		<line x1="5" y1="12" x2="19" y2="12" />
	{:else if name === 'swap'}
		<polyline points="7 4 3 8 7 12" />
		<line x1="3" y1="8" x2="17" y2="8" />
		<polyline points="17 12 21 16 17 20" />
		<line x1="21" y1="16" x2="7" y2="16" />
	{:else if name === 'bar-chart'}
		<line x1="5.5" y1="19" x2="5.5" y2="13" />
		<line x1="12" y1="19" x2="12" y2="6" />
		<line x1="18.5" y1="19" x2="18.5" y2="10" />
	{:else if name === 'trend-up'}
		<line x1="6" y1="18" x2="17" y2="7" />
		<polyline points="9 7 17 7 17 15" />
	{:else if name === 'trend-down'}
		<line x1="6" y1="6" x2="17" y2="17" />
		<polyline points="17 9 17 17 9 17" />
	{:else if name === 'trend-flat'}
		<line x1="5" y1="12" x2="18" y2="12" />
		<polyline points="14 8 18 12 14 16" />
	{:else if name === 'pencil'}
		<path d="M16 4l4 4L8 20H4v-4L16 4z" />
	{:else if name === 'x'}
		<line x1="6" y1="6" x2="18" y2="18" />
		<line x1="18" y1="6" x2="6" y2="18" />
	{:else if name === 'cog'}
		<circle cx="12" cy="12" r="3.2" />
		<path
			d="M12 3.5v2M12 18.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3.5 12h2M18.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
		/>
	{/if}
</svg>
