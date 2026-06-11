<script lang="ts">
  // Renders one anchor slot via displayedSlot(ref). Owns the four-state CSS and
  // hosts the SCP-X mouse-over (HelpUtility). technical_document.md §7.
  import { resolveSlot, anchorOf } from '../lib/game.svelte.ts';
  import HelpUtility from './HelpUtility.svelte';

  let { ref }: { ref: string } = $props();

  // The four-state ladder lives in resolveSlot; wrap it in $derived here so this
  // span recomputes only when its slot's inputs (overlay/revealedTruth) change.
  const slot = $derived(resolveSlot(ref));

  let hovered = $state(false);

  // Resolve once for the redaction-bar width: a bar should hint length without
  // leaking the value. Use the longest candidate as the visual budget.
  const barWidth = $derived(
    Math.min(24, Math.max(...anchorOf(ref).mutations.map((m) => m.length))),
  );
</script>

<span
  class="slot {slot.state}"
  role="button"
  tabindex="0"
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  onfocus={() => (hovered = true)}
  onblur={() => (hovered = false)}
>
  {#if slot.state === 'redacted'}
    <span class="bar" style="--ch: {barWidth}" aria-label="redacted slot">█████</span>
  {:else if slot.state === 'truth-contradiction'}
    <span class="guess">{slot.guess}</span><span class="truth">{slot.text}</span>
  {:else}
    {slot.text}
  {/if}

  {#if hovered}
    <HelpUtility {ref} />
  {/if}
</span>

<style>
  .slot {
    position: relative;
    cursor: help;
    border-radius: 2px;
  }
  .slot:focus-visible {
    outline: 1px solid var(--slot-inserted-fg);
    outline-offset: 1px;
  }

  /* 1. Redacted */
  .slot.redacted .bar {
    display: inline-block;
    width: calc(var(--ch, 6) * 0.62ch);
    color: var(--slot-redacted-fg);
    background: var(--slot-redacted-bg);
    border-radius: 2px;
    user-select: none;
  }

  /* 2. Player-inserted */
  .slot.inserted {
    color: var(--slot-inserted-fg);
    border-bottom: 1px dashed var(--slot-inserted-underline);
  }

  /* 3. Propagated */
  .slot.propagated {
    color: var(--slot-propagated-fg);
    border-bottom: 1px dotted var(--slot-propagated-underline);
    animation: slot-glitch 4s steps(1) infinite;
  }

  /* 4. Truth-contradiction (reachable in C7) */
  .slot.truth-contradiction .guess {
    color: var(--slot-contradiction-guess-fg);
    text-decoration: line-through;
  }
  .slot.truth-contradiction .truth {
    color: var(--slot-contradiction-fg);
    margin-left: 0.25ch;
  }

  /* Coherent reveal */
  .slot.revealed {
    color: var(--slot-revealed-fg);
  }
</style>
