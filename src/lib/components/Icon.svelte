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
		<line x1="5" y1="9.5" x2="5" y2="14.5" />
		<line x1="19" y1="9.5" x2="19" y2="14.5" />
	{:else if name === 'bw'}
		<circle cx="12" cy="5.5" r="2.4" />
		<line x1="12" y1="8.5" x2="12" y2="14.5" />
		<line x1="8" y1="11" x2="16" y2="11" />
		<line x1="12" y1="14.5" x2="9.2" y2="19" />
		<line x1="12" y1="14.5" x2="14.8" y2="19" />
	{:else if name === 'bench'}
		<line x1="4" y1="15.5" x2="20" y2="15.5" />
		<line x1="7" y1="15.5" x2="6" y2="20" />
		<line x1="17" y1="15.5" x2="18" y2="20" />
		<line x1="5" y1="7" x2="19" y2="7" />
		<line x1="8" y1="5" x2="8" y2="9" />
		<line x1="16" y1="5" x2="16" y2="9" />
	{:else if name === 'incline'}
		<line x1="4" y1="19" x2="18" y2="19" />
		<line x1="7" y1="19" x2="16.5" y2="8.5" />
		<line x1="7" y1="19" x2="7" y2="14" />
		<line x1="10.5" y1="6" x2="18" y2="6" />
		<line x1="12.5" y1="4.5" x2="12.5" y2="7.5" />
		<line x1="16" y1="4.5" x2="16" y2="7.5" />
	{:else if name === 'dip'}
		<line x1="3" y1="8" x2="9" y2="8" />
		<line x1="15" y1="8" x2="21" y2="8" />
		<circle cx="12" cy="7" r="1.7" />
		<line x1="12" y1="8.7" x2="12" y2="15" />
		<line x1="12" y1="10.5" x2="8" y2="8" />
		<line x1="12" y1="10.5" x2="16" y2="8" />
		<line x1="12" y1="15" x2="10" y2="20" />
		<line x1="12" y1="15" x2="14" y2="20" />
	{:else if name === 'cable'}
		<circle cx="12" cy="5" r="2" />
		<line x1="12" y1="7" x2="12" y2="13" />
		<line x1="8.5" y1="13" x2="15.5" y2="13" />
		<line x1="12" y1="13" x2="12" y2="16" />
		<line x1="9.5" y1="16" x2="14.5" y2="16" />
	{:else if name === 'machine'}
		<circle cx="12" cy="12" r="8" />
		<circle cx="12" cy="12" r="2.2" />
		<line x1="12" y1="4" x2="12" y2="6.4" />
		<line x1="12" y1="17.6" x2="12" y2="20" />
		<line x1="4" y1="12" x2="6.4" y2="12" />
		<line x1="17.6" y1="12" x2="20" y2="12" />
	{:else if name === 'pullup'}
		<line x1="3" y1="5" x2="21" y2="5" />
		<line x1="4.5" y1="5" x2="4.5" y2="3" />
		<line x1="19.5" y1="5" x2="19.5" y2="3" />
		<line x1="9" y1="5" x2="12" y2="11.5" />
		<line x1="15" y1="5" x2="12" y2="11.5" />
		<circle cx="12" cy="12.5" r="1.5" />
		<line x1="12" y1="14" x2="12" y2="18" />
		<line x1="12" y1="18" x2="10" y2="21" />
		<line x1="12" y1="18" x2="14" y2="21" />
	{:else if name === 'legs'}
		<circle cx="8.5" cy="4.5" r="1.7" />
		<path d="M8.5 6.2 L11 11" />
		<path d="M11 11 L16 11" />
		<path d="M16 11 L16 18" />
		<path d="M11 11 L8 18" />
	{:else if name === 'calf'}
		<path d="M10 3 L10 12" />
		<path d="M10 12 L8 17 L15 16" />
		<path d="M18 12 L18 5" />
		<path d="M16 7 L18 5 L20 7" />
	{:else if name === 'hips'}
		<line x1="3" y1="16" x2="8" y2="16" />
		<line x1="8" y1="16" x2="13" y2="9" />
		<line x1="13" y1="9" x2="18" y2="9" />
		<line x1="18" y1="9" x2="20" y2="16" />
		<line x1="20" y1="16" x2="20" y2="18" />
		<circle cx="15.5" cy="6.5" r="1.4" />
	{:else if name === 'curl'}
		<path d="M6 17 L11 17 L11 11" />
		<path d="M11 12.5 C8.7 12.5 7.3 11 7.3 9" />
		<circle cx="11" cy="7.5" r="1.7" />
	{:else if name === 'triceps'}
		<path d="M6 7 L11 7 L11 15" />
		<path d="M11 10 C13.3 10 14.6 11.6 14.6 13.6" />
		<circle cx="11" cy="16.7" r="1.7" />
	{:else if name === 'shoulders'}
		<circle cx="12" cy="5" r="1.9" />
		<line x1="12" y1="7" x2="12" y2="15" />
		<line x1="4" y1="10" x2="20" y2="10" />
		<line x1="4" y1="8.5" x2="4" y2="11.5" />
		<line x1="20" y1="8.5" x2="20" y2="11.5" />
		<line x1="12" y1="15" x2="9" y2="20" />
		<line x1="12" y1="15" x2="15" y2="20" />
	{:else if name === 'plank'}
		<circle cx="18" cy="10" r="1.5" />
		<line x1="16.5" y1="10.7" x2="5" y2="15" />
		<line x1="5" y1="15" x2="5" y2="19" />
		<line x1="4" y1="19" x2="8" y2="19" />
		<line x1="14" y1="12.3" x2="16" y2="19" />
	{:else if name === 'crunch'}
		<line x1="4" y1="19" x2="10" y2="19" />
		<path d="M10 19 C10 12 13.5 9.5 17 11.5" />
		<circle cx="18.5" cy="9.5" r="1.5" />
		<line x1="10" y1="19" x2="13.5" y2="15" />
	{:else if name === 'abwheel'}
		<circle cx="12" cy="15" r="4" />
		<circle cx="12" cy="15" r="1" />
		<line x1="5" y1="9" x2="19" y2="9" />
		<line x1="12" y1="11" x2="12" y2="9" />
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
