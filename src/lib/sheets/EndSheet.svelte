<script>
  import Icon from '$lib/components/Icon.svelte';
  import { store } from '$lib/store.svelte.js';
</script>

<div>
  <button class="backdrop" onclick={() => store.closeEndSheet()} aria-label="Close"></button>
  <div class="sheet">
    <div class="handle"></div>
    <div class="title">End session?</div>
    <div class="sub">
      <b class="mono">{store.doneSets}</b> of {store.totalSets} sets done ·
      <b class="mono">{store.elapsed}</b> elapsed
    </div>
    <div class="col">
      <button class="save" onclick={() => store.saveSession()}>
        <Icon name="check" size={20} stroke={3.2} style="stroke:var(--on-accent);" />
        Save &amp; finish
      </button>
      <button class="discard" onclick={() => store.discardSession()}>Discard session</button>
      <button class="keep" onclick={() => store.closeEndSheet()}>Keep training</button>
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
  .sub b {
    color: var(--txt);
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 11px;
    margin-top: 22px;
  }
  .save {
    width: 100%;
    height: 64px;
    border-radius: 18px;
    border: none;
    cursor: pointer;
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 700;
    font-size: 17px;
    letter-spacing: .03em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    box-shadow: 0 8px 30px -8px var(--accent-glow);
    transition: transform .12s;
  }
  .save:active {
    transform: scale(.97);
  }
  .discard {
    width: 100%;
    height: 56px;
    border-radius: 18px;
    border: 1px solid var(--line);
    cursor: pointer;
    background: var(--surface);
    color: var(--warn);
    font-weight: 700;
    font-size: 15px;
    letter-spacing: .03em;
    transition: transform .12s, background .15s;
  }
  .discard:active {
    transform: scale(.97);
    background: var(--surface-hi);
  }
  .keep {
    background: none;
    border: none;
    color: var(--mute);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .04em;
    cursor: pointer;
    padding: 6px;
  }
  .keep:active {
    color: var(--txt);
  }
</style>
