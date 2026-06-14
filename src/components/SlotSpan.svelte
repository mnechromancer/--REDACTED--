<script lang="ts">
  // ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md §1, §6.3): four-state
  //   grammar survives but re-rendered in CLI idiom; provenance (via amber|quippy)
  //   may add a 5th visual distinction (AMBER-solved vs Quippy-solved). Hover/focus
  //   interaction → explicit keybound span-jumping. See planning/handoff_janitor.md.
  //
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
  /* Slots sit in running prose as discrete "fields" — a typed form blank the
     archivist fills. Horizontal margin keeps them off the adjacent words and
     punctuation; the small inline-block padding gives each state a boxed extent
     so a filled value reads as an entry stamped into the record, not just
     coloured text. */
  .slot {
    position: relative;
    cursor: help;
    margin: 0 0.12em;
    padding: 0.02em 0.34em;
    border-radius: 2px;
    /* A filled slot can hold a whole clause, so it must wrap with the prose
       rather than push past the document's edge. Only the redacted bar (a short
       run of block chars) is kept nowrap, below. */
    overflow-wrap: anywhere;
  }
  .slot:focus-visible {
    outline: 1px solid var(--slot-inserted-fg);
    outline-offset: 1px;
  }

  /* 1. Redacted — a struck-through classified bar, slightly inset like ink over
        the scan. user-select off so the value can't be lifted from the DOM. */
  .slot.redacted {
    padding: 0;
    margin: 0 0.18em;
  }
  .slot.redacted .bar {
    display: inline-block;
    width: calc(var(--ch, 6) * 0.62ch);
    color: var(--slot-redacted-fg);
    background: var(--slot-redacted-bg);
    border-radius: 1px;
    box-shadow: inset 0 0 0 1px #000, 0 0 0 1px #2a2f36;
    user-select: none;
    vertical-align: baseline;
  }

  /* 2. Player-inserted — the amber typed-in value, boxed like a form field. */
  .slot.inserted {
    color: var(--slot-inserted-fg);
    background: #1c1608;
    border: 1px solid var(--slot-inserted-underline);
    border-radius: 2px;
  }

  /* 3. Propagated — the teal cross-file mutation, dotted box + glitch. */
  .slot.propagated {
    color: var(--slot-propagated-fg);
    background: #08201d;
    border: 1px dotted var(--slot-propagated-underline);
    border-radius: 2px;
    animation: slot-glitch 4s steps(1) infinite;
  }

  /* 4. Truth-contradiction — the audit payoff: the struck-through guess sits
        beside the truth that just bled in. Boxed red, with an entry flash so the
        eye lands on it the moment an audit reveals the discrepancy. */
  .slot.truth-contradiction {
    padding: 0.02em 0.4em;
    background: #1f0d0d;
    border: 1px solid var(--slot-contradiction-fg, #e85d5d);
    border-radius: 2px;
    animation: reveal-flash 0.7s ease-out;
  }
  .slot.truth-contradiction .guess {
    color: var(--slot-contradiction-guess-fg);
    text-decoration: line-through;
    opacity: 0.7;
  }
  .slot.truth-contradiction .truth {
    color: var(--slot-contradiction-fg);
    margin-left: 0.4ch;
  }

  /* Coherent reveal — your guess matched, or truth shown for an unguessed slot. */
  .slot.revealed {
    color: var(--slot-revealed-fg);
    padding: 0.02em 0.34em;
    background: #0c1810;
    border: 1px solid #224a30;
    border-radius: 2px;
    animation: reveal-flash 0.7s ease-out;
  }

  @keyframes reveal-flash {
    0% {
      box-shadow: 0 0 0 0 rgba(232, 93, 93, 0);
      filter: brightness(1.8);
    }
    30% {
      box-shadow: 0 0 12px 2px rgba(232, 93, 93, 0.5);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(232, 93, 93, 0);
      filter: brightness(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .slot.truth-contradiction,
    .slot.revealed {
      animation: none;
    }
  }
</style>
