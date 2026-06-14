<script lang="ts">
  // ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md §1, §6.3): survives as
  //   a terminal log pane (CLI restyle); should log edit provenance (AMBER vs
  //   Quippy) once the `via` field lands. See planning/handoff_janitor.md.
  //
  // The ripple sidebar: a persistent log of what the player's edits did to the
  // corpus — propagations and audits — newest first. The transient window flash
  // shows a ripple where it lands; this keeps the history so the shape of the
  // player's corruption is legible over time. Reads the ripples store; no writes.
  import { ripples } from '../lib/ripples.svelte.ts';
</script>

<aside class="ripple-log">
  <h2>CROSS-REFERENCE LOG</h2>
  {#if ripples.events.length === 0}
    <p class="empty">No edits recorded. Restored fields and audits will appear here.</p>
  {:else}
    <ul>
      {#each ripples.events as e (e.id)}
        <li class="event {e.tone}">
          <span class="marker" aria-hidden="true">{e.kind === 'audit' ? '▣' : '↳'}</span>
          <span class="text">{e.text}</span>
        </li>
      {/each}
    </ul>
  {/if}
</aside>

<style>
  .ripple-log {
    position: sticky;
    top: 1rem;
    align-self: start;
    background: #0a0c0f;
    border: 1px solid #1c2026;
    border-radius: 4px;
    padding: 0.7rem 0.8rem;
    font-size: 0.74rem;
    color: #c8ccd2;
  }
  h2 {
    margin: 0 0 0.6rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: #6b7280;
    border-bottom: 1px solid #1c2026;
    padding-bottom: 0.4rem;
  }
  .empty {
    margin: 0;
    color: #555c66;
    font-style: italic;
    line-height: 1.5;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .event {
    display: flex;
    gap: 0.45rem;
    line-height: 1.4;
    animation: ripple-in 0.4s ease-out;
  }
  .marker {
    flex: 0 0 auto;
    color: #586374;
  }
  .text {
    color: #9aa3ad;
    overflow-wrap: anywhere;
  }
  .event.flag .marker,
  .event.flag .text {
    color: var(--slot-contradiction-fg, #e85d5d);
  }
  .event.ok .marker,
  .event.ok .text {
    color: var(--slot-revealed-fg, #8ad0a0);
  }
  .event.neutral .text {
    color: var(--slot-propagated-fg, #3dd6c4);
  }
  @keyframes ripple-in {
    0% {
      opacity: 0;
      transform: translateX(8px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .event {
      animation: none;
    }
  }
</style>
