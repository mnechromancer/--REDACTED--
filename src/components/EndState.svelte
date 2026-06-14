<script lang="ts">
  // The end-state surface (design_document.md §6, scp_x_bible.md §5). Reads the
  // no-Quippy ending from provenance, not a counter. Two terminal outcomes:
  //   loop-broken — the true ending: the corpus reconstructed by hand, zero Quippy.
  //   breach     — an entity completed its re-shelving (recovery stays first-class:
  //                breaches are board state, so this surfaces only on a breached
  //                board and the player could have recovered before it).
  // 'playing' renders nothing.
  import { endState } from '../lib/game.svelte.ts';

  const e = $derived(endState());
</script>

{#if e.outcome !== 'playing'}
  <div class="end-overlay" class:breach={e.outcome === 'breach'}>
    <div class="end-card" class:breach={e.outcome === 'breach'}>
      {#if e.outcome === 'loop-broken'}
        <div class="stamp broken">THE LOOP BREAKS</div>
        <p class="line">
          The record is whole, and you wrote all of it — every field, by hand, from
          the corpus itself. {e.restored} of {e.total} restored, not one assist taken.
        </p>
        <p class="sub">
          Quippy got no help from you. Starved of the hand it needed, it cannot finish
          its re-shelving. The terminal goes quiet. You read the record without letting
          anything read it for you — and that is the only way out.
        </p>
      {:else}
        <div class="stamp breached">CONTAINMENT BREACH</div>
        <p class="line">
          The record has gone soft past holding. {e.quippyAssists} field{e.quippyAssists === 1 ? '' : 's'}
          {e.quippyAssists === 1 ? 'was' : 'were'} filled the easy way, and the entity
          used your hand to re-index itself out of containment.
        </p>
        <p class="sub">
          It was always the helpful one. Every click you gave it was a click it spent.
          The site does not log what happens next.
        </p>
      {/if}
      <button class="restart" onclick={() => location.reload()}>↺ NEW SHIFT</button>
    </div>
  </div>
{/if}

<style>
  .end-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(4, 6, 8, 0.9);
    backdrop-filter: blur(2px);
    animation: end-in 0.5s ease-out;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  }
  .end-card {
    max-width: 36rem;
    background: #07120d;
    border: 1px solid #1c4a3c;
    border-radius: 5px;
    padding: 1.7rem 1.8rem;
    box-shadow: 0 0 0 1px #0c1c1a, 0 16px 60px rgba(0, 0, 0, 0.6);
  }
  .end-card.breach { background: #160808; border-color: #6b2424; }
  .stamp {
    display: inline-block;
    margin-bottom: 1.1rem;
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    border: 1px solid;
    border-radius: 2px;
  }
  .stamp.broken { color: var(--slot-revealed-fg, #8ad0a0); border-color: #2f6a44; }
  .stamp.breached { color: var(--slot-contradiction-fg, #e85d5d); border-color: #8a2c2c; }
  .line { margin: 0 0 0.9rem; line-height: 1.6; color: #c4d4ce; font-size: 0.9rem; }
  .end-card.breach .line { color: #d8c4c4; }
  .sub { margin: 0 0 1.5rem; line-height: 1.6; color: #7d8a86; font-size: 0.82rem; }
  .end-card.breach .sub { color: #9a8080; }
  .restart {
    padding: 0.5rem 1.1rem;
    background: linear-gradient(#10302b, #0a201d);
    color: #8fe6da;
    border: 1px solid var(--slot-propagated-fg, #3dd6c4);
    border-radius: 3px;
    font: inherit;
    font-size: 0.82rem;
    letter-spacing: 0.06em;
    cursor: pointer;
  }
  .end-card.breach .restart {
    background: linear-gradient(#301010, #200a0a);
    color: #e89a9a;
    border-color: #8a2c2c;
  }
  .restart:hover { filter: brightness(1.2); }
  @keyframes end-in { 0% { opacity: 0; } 100% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .end-overlay { animation: none; } }
</style>
