<script lang="ts">
  // The SCP-X mouse-over (design_document.md §5.3): the inference surface shown
  // before the irreversible insertion. It shows (a) the slot's type, (b) every
  // other file where this slot's concept is mentioned, (c) the bounded candidate
  // set. Picking a candidate calls insert() — the deduction tool and the spend
  // are one act (§3). Tone degradation with exposure is a later pass (§7).
  import { anchorOf, crossMentions, splitRef, insert, resolveSlot } from '../lib/game.svelte.ts';

  let { ref }: { ref: string } = $props();

  const anchor = $derived(anchorOf(ref));
  const mentions = $derived(crossMentions(ref));
  const slot = $derived(resolveSlot(ref));
</script>

<div class="help" role="tooltip">
  <div class="row type">
    <span class="label">slot</span>
    <span class="value">{anchor.slot_type}</span>
  </div>

  {#if slot.state === 'propagated' && slot.caused_by}
    <div class="row provenance">
      <span class="label">altered</span>
      <span class="value">by your edit to {splitRef(slot.caused_by).item}</span>
    </div>
  {/if}

  <div class="row mentions">
    <span class="label">also in</span>
    {#if mentions.length === 0}
      <span class="value none">— no cross-mentions —</span>
    {:else}
      <ul>
        {#each mentions as m (m)}
          <li>{splitRef(m).item}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="row candidates">
    <span class="label">fill</span>
    <div class="buttons">
      {#each anchor.mutations as candidate (candidate)}
        <button
          type="button"
          class:active={slot.text === candidate}
          onclick={() => insert(ref, candidate)}
        >
          {candidate}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .help {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    min-width: 16rem;
    max-width: 24rem;
    margin-top: 4px;
    padding: 0.5rem 0.6rem;
    background: #0d0f12;
    border: 1px solid #2a2f36;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
    font-size: 0.8rem;
    line-height: 1.35;
    color: #c8ccd2;
    text-align: left;
    cursor: default;
  }
  .row {
    display: flex;
    gap: 0.5rem;
    padding: 0.15rem 0;
  }
  .row + .row {
    border-top: 1px solid #1c2026;
  }
  .label {
    flex: 0 0 4rem;
    color: #6b7280;
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    padding-top: 0.15rem;
  }
  .value {
    color: #a8b0ba;
  }
  .value.none {
    color: #555c66;
    font-style: italic;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    color: #7fa8c9;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  button {
    padding: 0.15rem 0.45rem;
    background: #161a1f;
    border: 1px solid #2a2f36;
    border-radius: 3px;
    color: var(--slot-inserted-fg, #e8a33d);
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
  }
  button:hover {
    background: #1f242b;
  }
  button.active {
    border-color: var(--slot-inserted-fg, #e8a33d);
    background: #221c10;
  }
</style>
