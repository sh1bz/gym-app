<script>
  import { store } from '$lib/store.svelte.js';
</script>

{#if store.toastMsg}
  <div class="toast">
    <span class="dot"></span>{store.toastMsg}
  </div>
{/if}

<style>
  .toast {
    position: absolute;
    left: 50%;
    bottom: 130px;
    transform: translate(-50%, 0);
    background: var(--surface-hi);
    border: 1px solid var(--line);
    color: var(--txt);
    padding: 11px 18px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: toastIn .3s ease both;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
  }
</style>
