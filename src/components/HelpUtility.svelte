<script lang="ts">
  // ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md §1, §6.1): this is the
  //   old single "Concordance" panel. It SPLITS into AMBER's honest manual lookup
  //   (the conceptClues evidence surface) and Quippy's easy one-click GUI panel +
  //   entity voice. Do not rebuild before R§6 (naming + AMBER tooling) is resolved.
  //   See planning/handoff_janitor.md → "HelpUtility.svelte".
  //
  // The SCP-X mouse-over (design_document.md §5.3): the inference surface shown
  // before the irreversible insertion. It shows (a) the slot's type, (b) every
  // other file where this slot's concept is mentioned, (c) the bounded candidate
  // set. Picking a candidate calls insert() — the deduction tool and the spend
  // are one act (§3). Once a slot's truth has been revealed by audit it is no
  // longer fillable, so the panel reports the verdict instead of offering guesses.
  import { anchorOf, conceptClues, splitRef, insert, resolveSlot } from '../lib/game.svelte.ts';
  import { logPropagation } from '../lib/ripples.svelte.ts';
  import { progression, unlockedFiles } from '../lib/progression.svelte.ts';

  function fill(candidate: string) {
    // Propagate only to records the onboarding has unlocked, so an edit never
    // ripples to a file the player hasn't met yet.
    const unlocked = unlockedFiles(progression.step);
    const propagated = insert(ref, candidate, (item) => unlocked.has(item));
    logPropagation(ref, propagated);
  }

  let { ref }: { ref: string } = $props();

  const anchor = $derived(anchorOf(ref));
  const clues = $derived(conceptClues(ref));
  const slot = $derived(resolveSlot(ref));

  // Fillable only while the truth is not yet revealed. After an audit, the slot
  // is locked to ground truth — offering candidates there is the confusing
  // behaviour the player hit ("hover green, see options").
  const fillable = $derived(slot.state === 'redacted' || slot.state === 'inserted' || slot.state === 'propagated');

  // Edge-aware placement: the panel is absolutely positioned under its slot and
  // would otherwise run off the right edge (or off a slot near the viewport edge).
  // After mount/resize we measure and nudge it back inside the viewport, and flip
  // it above the slot if there's no room below.
  let panel = $state<HTMLDivElement | null>(null);
  let shiftX = $state(0);
  let flipUp = $state(false);

  $effect(() => {
    const el = panel;
    if (!el) return;
    // Read the natural rect (with shiftX reset) then compute the correction.
    const r = el.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Horizontal: how far the panel overflows the right edge (its left already
    // includes the current shiftX, so fold that back out to get the natural left).
    const naturalLeft = r.left - shiftX;
    const overflowRight = naturalLeft + r.width - (vw - margin);
    const next = overflowRight > 0 ? -Math.min(overflowRight, naturalLeft - margin) : 0;
    if (Math.abs(next - shiftX) > 0.5) shiftX = next;
    // Vertical: flip above the slot if the panel would spill past the bottom.
    flipUp = r.bottom > vh - margin && r.height < r.top;
  });
</script>

<div
  class="help"
  class:flip-up={flipUp}
  role="tooltip"
  bind:this={panel}
  style="--shift-x: {shiftX}px"
>
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

  {#if fillable && clues.length > 0}
    <div class="row clues">
      <span class="label">cross-ref</span>
      <div class="clue-block">
        <p class="clue-note">How other records treat this matter. Each record may read it differently — use these to judge what fits <em>here</em>, not to copy.</p>
        <ul class="clue-list">
          {#each clues as c (c.ref)}
            <li class="clue {c.state}">
              <span class="src">{c.item}</span>
              <span class="quote">{c.sentence}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}

  {#if fillable}
    <div class="row candidates">
      <span class="label">{clues.length > 0 ? 'deduce' : 'fill'}</span>
      <div class="buttons">
        {#each anchor.mutations as candidate (candidate)}
          <button
            type="button"
            class:active={slot.text === candidate}
            onclick={() => fill(candidate)}
          >
            {candidate}
          </button>
        {/each}
      </div>
    </div>
  {:else if slot.state === 'truth-contradiction'}
    <div class="row verdict flagged">
      <span class="label">audit</span>
      <span class="value">Your entry was struck. The held copy reads otherwise — shown in red. This field is now locked to ground truth.</span>
    </div>
  {:else}
    <div class="row verdict confirmed">
      <span class="label">audit</span>
      <span class="value">Reconciled against the held copy. This field is settled.</span>
    </div>
  {/if}
</div>

<style>
  .help {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    /* shiftX (set by the edge-aware effect) pulls the panel back inside the
       viewport when a slot near the right edge would push it off-screen. */
    transform: translateX(var(--shift-x, 0px));
    min-width: 14rem;
    max-width: min(26rem, 88vw);
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
    /* never overflow its own box: long candidate text wraps inside */
    overflow-wrap: anywhere;
  }
  .help.flip-up {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 4px;
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
  /* flex:1 + min-width:0 lets a long value wrap inside the panel instead of
     forcing the flex row wider than its container (the overflow bug). */
  .value {
    flex: 1 1 auto;
    min-width: 0;
    color: #a8b0ba;
    overflow-wrap: anywhere;
  }
  .value.none {
    color: #555c66;
    font-style: italic;
  }
  ul {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    color: #7fa8c9;
  }
  /* The evidence list: the actual sentences from other files where this concept
     appears — context for deducing THIS file's reading (not a value to copy,
     since carriers can read the same concept differently). */
  .clue-block {
    flex: 1 1 auto;
    min-width: 0;
  }
  .clue-note {
    margin: 0 0 0.4rem;
    color: #6b7280;
    font-size: 0.68rem;
    line-height: 1.35;
    font-style: italic;
  }
  .clue-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .clue {
    display: block;
    line-height: 1.4;
  }
  .clue .src {
    display: inline-block;
    margin-right: 0.4ch;
    padding: 0 0.3ch;
    font-size: 0.62rem;
    letter-spacing: 0.04em;
    color: #5e7a90;
    border: 1px solid #294056;
    border-radius: 2px;
    vertical-align: 1px;
  }
  .clue .quote {
    color: #9aa9b6;
    font-style: italic;
  }
  /* When the partner slot is filled/revealed, its value appears in the sentence
     (rendered with 「」 in the data); tint the whole clue so a known constraint
     reads as solid evidence rather than another blank. */
  .clue.inserted .quote,
  .clue.propagated .quote {
    color: #c9cdd3;
    font-style: normal;
  }
  .clue.revealed .quote {
    color: var(--slot-revealed-fg, #8ad0a0);
    font-style: normal;
  }
  /* Candidates stack as full-width rows — they're whole clauses, so a wrapping
     flex row crowds and clips them. One per line reads cleanly and can't overflow. */
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex: 1 1 auto;
    min-width: 0;
  }
  button {
    width: 100%;
    min-width: 0;
    text-align: left;
    padding: 0.3rem 0.5rem;
    background: #161a1f;
    border: 1px solid #2a2f36;
    border-radius: 3px;
    color: var(--slot-inserted-fg, #e8a33d);
    font: inherit;
    font-size: 0.75rem;
    line-height: 1.3;
    cursor: pointer;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  button:hover {
    background: #1f242b;
    border-color: #4a5160;
  }
  button.active {
    border-color: var(--slot-inserted-fg, #e8a33d);
    background: #221c10;
  }

  .verdict .value {
    font-style: italic;
  }
  .verdict.flagged .value {
    color: var(--slot-contradiction-fg, #e85d5d);
  }
  .verdict.confirmed .value {
    color: var(--slot-revealed-fg, #8ad0a0);
  }
</style>
