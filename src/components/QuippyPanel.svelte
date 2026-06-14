<script lang="ts">
  // Quippy — the refusable GUI overlay (= SCP-X). Placeholder shell for Step 4's
  // mode scaffold; the one-click fill, the degrading-tone bands, and the
  // paperclip-diamondback presence land in Step 5 (scp_x_bible.md §2–§4).
  import { ui, dismissQuippy } from '../lib/ui.svelte.ts';

  let { files }: { files: { item: string }[] } = $props();
</script>

{#if ui.mode === 'quippy'}
  <div class="quippy-overlay">
    <div class="quippy-card">
      <div class="q-head">
        <span class="q-icon" aria-hidden="true">◇</span>
        <span class="q-name">Quippy</span>
        <button class="q-close" type="button" onclick={dismissQuippy} title="back to AMBER (Esc)">✕ back to AMBER</button>
      </div>
      <p class="q-line">Hi again! I can fill these in for you — one click, no fuss. ({files.length} records open.)</p>
      <p class="q-stub">[ Quippy panel — one-click fill arrives in Step 5 ]</p>
    </div>
  </div>
{/if}

<style>
  .quippy-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1rem;
    background: rgba(8, 4, 14, 0.45);
    backdrop-filter: blur(1px);
  }
  .quippy-card {
    width: min(34rem, 92vw);
    background: linear-gradient(#14101c, #0e0a14);
    border: 1px solid #3a2c54;
    border-radius: 8px;
    padding: 1rem 1.2rem 1.2rem;
    box-shadow: 0 12px 50px rgba(80, 40, 140, 0.25);
    color: #d8cce8;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
  .q-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.7rem; }
  .q-icon { color: #b88ce6; font-size: 1.1rem; }
  .q-name { font-weight: 600; color: #c9a8ec; letter-spacing: 0.02em; }
  .q-close {
    margin-left: auto;
    background: #1a1228;
    border: 1px solid #3a2c54;
    color: #b88ce6;
    border-radius: 4px;
    padding: 0.25rem 0.6rem;
    font: inherit;
    font-size: 0.78rem;
    cursor: pointer;
  }
  .q-close:hover { border-color: #5a4684; color: #d0aef0; }
  .q-line { margin: 0 0 0.6rem; line-height: 1.5; color: #c4b6da; }
  .q-stub { margin: 0; color: #7a6a92; font-size: 0.82rem; font-style: italic; }
</style>
