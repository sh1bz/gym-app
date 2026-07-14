<script>
  import Icon from '$lib/components/Icon.svelte';
  import { store } from '$lib/store.svelte.js';
</script>

<div>
  <button class="backdrop" onclick={() => store.closeAddSheet()} aria-label="Close"></button>
  <div class="sheet">
    <div class="handle"></div>
    <div class="title">Add a day</div>
    <div class="sub">variation keeps the split but picks fresh exercises</div>
    <div class="col">
      <button class="new" onclick={() => store.newDay()}>+ New empty day</button>
      {#each store.program as day, i (day.id)}
        <div class="row">
          <span class="label">{day.split}</span>
          <button class="pill variation" onclick={() => store.generateVariation(i)}>Variation</button>
          <button class="pill copy" onclick={() => store.duplicateDay(i)}>Copy</button>
        </div>
      {/each}
      <button class="cancel" onclick={() => store.closeAddSheet()}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(8, 9, 12, .6);
    backdrop-filter: blur(3px);
    z-index: 10;
    animation: fadeIn .28s ease both;
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
    animation: sheetUp .34s cubic-bezier(.2, .8, .25, 1) both;
  }
  .handle {
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
    letter-spacing: .04em;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
  }
  .new {
    width: 100%;
    height: 58px;
    border-radius: 18px;
    border: none;
    cursor: pointer;
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 700;
    font-size: 16px;
    letter-spacing: .03em;
    transition: transform .12s;
  }
  .new:active {
    transform: scale(.97);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 4px;
    border-bottom: 1px solid var(--line);
  }
  .label {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pill {
    flex: 0 0 auto;
    padding: 9px 14px;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: .04em;
  }
  .variation {
    border: 1px solid var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
    transition: transform .12s;
  }
  .variation:active {
    transform: scale(.94);
  }
  .copy {
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--txt);
    transition: transform .12s, background .15s;
  }
  .copy:active {
    transform: scale(.94);
    background: var(--surface-hi);
  }
  .cancel {
    background: none;
    border: none;
    color: var(--mute);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .04em;
    cursor: pointer;
    padding: 8px;
  }
  .cancel:active {
    color: var(--txt);
  }
</style>
