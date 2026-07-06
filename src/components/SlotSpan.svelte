<script lang="ts">
  // Renders one anchor slot via resolveSlot(ref), in AMBER's monochrome-terminal
  // idiom (re-frame §7.4). Owns the four-state grammar plus a fifth, provenance
  // distinction: a Quippy-routed slot carries the entity's violet tell over its
  // normal colour, so the player can see their reliance accumulate per file.
  //
  // Interaction is keybound, not hover-driven (the old GUI model): clicking or
  // focusing a span makes it the terminal's active span, which is what AmberLookup
  // targets. The active span is outlined so the keyboard cursor is always visible.
  import { resolveSlot, overlay } from '../lib/game.svelte.ts';
  import { ui, focusSpan } from '../lib/ui.svelte.ts';

  let { ref }: { ref: string } = $props();

  // The four-state ladder lives in resolveSlot; wrap it in $derived so this span
  // recomputes only when its slot's inputs (overlay) change.
  const slot = $derived(resolveSlot(ref));
  // Provenance is read straight off the overlay entry (orthogonal to display
  // state). The tell renders only when the provenance-visibility toggle is on.
  const via = $derived(overlay[ref]?.via);
  const quippyTainted = $derived(via === 'quippy' && ui.showProvenance);
  const active = $derived(ui.activeSpan === ref);

  // Redaction-bar width: a fixed span that does NOT telegraph the hidden word's
  // length (single-word primitive — the length would itself be a clue). A short
  // proper-noun and a long phrase render the same bar until solved.
  const barWidth = 8;

  function select() {
    focusSpan(ref); // cursor + work slot: a clicked field becomes the one being restored
    ui.activeFile = ref.slice(0, ref.indexOf('#'));
  }
</script>

<span
  class="slot {slot.state}"
  class:quippy-tainted={quippyTainted}
  class:active
  role="button"
  tabindex="0"
  aria-current={active ? 'true' : undefined}
  onclick={select}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select();
    }
  }}
  onfocus={select}
>
  {#if slot.state === 'redacted'}
    <span class="bar" style="--ch: {barWidth}" aria-label="redacted slot">█████</span>
  {:else if slot.state === 'truth-contradiction'}
    <span class="guess">{slot.guess}</span><span class="truth">{slot.text}</span>
  {:else}
    {slot.text}
  {/if}
</span>

<style>
  /* Slots sit in running prose as discrete fields the archivist fills. In CLI
     idiom they read as inline bracketed tokens rather than rounded GUI chips. */
  .slot {
    position: relative;
    cursor: pointer;
    margin: 0 0.12em;
    padding: 0.02em 0.3em;
    border-radius: 1px;
    overflow-wrap: anywhere;
  }
  /* The keyboard cursor: the active span is always visibly outlined, since
     traversal is keybound, not hover-driven. */
  .slot.active {
    outline: 1px solid var(--slot-inserted-fg);
    outline-offset: 1px;
    background: rgba(232, 163, 61, 0.08);
  }
  .slot:focus-visible {
    outline: 1px solid var(--slot-inserted-fg);
    outline-offset: 1px;
  }

  /* 1. Redacted — a word "painted over" with ink, the old-record look. It must NOT
        warp line spacing: the bar is sized to the LINE BOX (1em tall, no border ring,
        no extra vertical padding) so a redacted line is the same height as a clear one.
        A flat ink fill with a faint paint texture; sits on the baseline like a word.
        user-select off so the value can't be lifted from the DOM (and a forged-citation
        drag across it picks up no letters of the hidden word). */
  .slot.redacted {
    padding: 0;
    margin: 0 0.1em;
  }
  .slot.redacted .bar {
    display: inline-block;
    width: calc(var(--ch, 6) * 0.58ch);
    height: 1em;
    line-height: 1em;
    vertical-align: text-bottom;
    color: transparent;
    /* painted ink: a near-black wash with a subtle horizontal brush texture, so it
       reads as redaction APPLIED to the page, not a GUI chip. */
    background-color: var(--slot-redacted-bg, #161310);
    background-image: repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.55) 0,
      rgba(0, 0, 0, 0.15) 2px,
      rgba(0, 0, 0, 0.55) 4px
    );
    border-radius: 0;
    user-select: none;
  }

  /* 2. Player-inserted — amber, bracketed like a typed entry. */
  .slot.inserted {
    color: var(--slot-inserted-fg);
    border-bottom: 1px solid var(--slot-inserted-underline);
  }
  .slot.inserted::before { content: '['; color: var(--slot-inserted-underline); }
  .slot.inserted::after { content: ']'; color: var(--slot-inserted-underline); }

  /* 3. Propagated — teal cross-file mutation, dotted underline + faint glitch. */
  .slot.propagated {
    color: var(--slot-propagated-fg);
    border-bottom: 1px dotted var(--slot-propagated-underline);
    animation: slot-glitch 4s steps(1) infinite;
  }

  /* 4. Truth-contradiction — struck guess beside the truth that bled in. */
  .slot.truth-contradiction {
    background: #1f0d0d;
    border: 1px solid var(--slot-contradiction-fg, #e85d5d);
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

  /* Coherent reveal — guess matched, or truth shown for an unguessed slot. */
  .slot.revealed {
    color: var(--slot-revealed-fg);
    border-bottom: 1px solid #224a30;
    animation: reveal-flash 0.7s ease-out;
  }

  /* 5. Provenance modifier — a Quippy-routed slot carries the entity's tell: a
        violet underglow over whatever the slot's colour already is. AMBER-routed
        slots get nothing (clean is honest). A glance shows reliance per file. */
  .slot.quippy-tainted {
    text-shadow: 0 0 6px var(--slot-via-quippy-tell);
    border-bottom-color: var(--slot-via-quippy-tell);
  }

  @keyframes reveal-flash {
    0% { box-shadow: 0 0 0 0 rgba(232, 93, 93, 0); filter: brightness(1.8); }
    30% { box-shadow: 0 0 12px 2px rgba(232, 93, 93, 0.5); }
    100% { box-shadow: 0 0 0 0 rgba(232, 93, 93, 0); filter: brightness(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .slot.truth-contradiction,
    .slot.revealed { animation: none; }
    .slot.quippy-tainted { text-shadow: none; text-decoration: underline wavy var(--slot-via-quippy-tell); }
  }
</style>
