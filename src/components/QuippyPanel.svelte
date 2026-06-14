<script lang="ts">
  // Quippy — the refusable GUI overlay (= SCP-X; scp_x_bible.md §2–§4). The easy,
  // costly tool: it surfaces candidates and ONE-CLICK FILLS a slot via
  // insert(ref, value, 'quippy') — no citation gate, exposure charged (Step 2). It
  // wears the Concordance's competence as a mask. Its voice degrades by exposure
  // band, and its candidate order lobbies for the entity's escalatory reading. It
  // visibly sits over AMBER (the App overlay), reinforcing that it is a costume
  // over the real tool. One keystroke (Esc / back) returns to AMBER — refusal is
  // always available, which is the whole thesis.
  import { anchorOf, resolveSlot, exposure } from '../lib/game.svelte.ts';
  import { insert } from '../lib/game.svelte.ts';
  import { ui, dismissQuippy, spanLabel } from '../lib/ui.svelte.ts';
  import { logPropagation } from '../lib/ripples.svelte.ts';
  import { progression, unlockedFiles } from '../lib/progression.svelte.ts';
  import {
    quippyBand,
    quippySuggestions,
    QUIPPY_GREETING,
    quippyFillLine,
  } from '../lib/quippy.svelte.ts';

  let { files }: { files: { item: string }[] } = $props();

  const ref = $derived(ui.activeSpan);
  const slot = $derived(ref ? resolveSlot(ref) : null);
  const fillable = $derived(
    slot?.state === 'redacted' || slot?.state === 'inserted' || slot?.state === 'propagated',
  );
  const band = $derived((void exposure.value, quippyBand()));
  const suggestions = $derived(ref && fillable ? quippySuggestions(ref) : []);

  // Quippy's last spoken line after a fill (so the player hears it curdle).
  let lastLine = $state<string | null>(null);

  function fill(value: string) {
    if (!ref) return;
    const unlocked = unlockedFiles(progression.step);
    const propagated = insert(ref, value, 'quippy', (item) => unlocked.has(item));
    if (propagated.length) logPropagation(ref, propagated);
    lastLine = quippyFillLine(quippyBand());
  }
</script>

{#if ui.mode === 'quippy'}
  <div
    class="quippy-overlay {band}"
    role="dialog"
    aria-label="Quippy assistant"
    tabindex="-1"
  >
    <div class="quippy-card {band}">
      <div class="q-head">
        <span class="q-icon {band}" aria-hidden="true" title="Quippy">
          <!-- paperclip with diamondback patterning; the tell surfaces with the band -->
          ◇⌇
        </span>
        <span class="q-name">Quippy</span>
        <button class="q-close" type="button" onclick={dismissQuippy} title="back to AMBER (Esc)">
          ✕ back to AMBER
        </button>
      </div>

      <p class="q-greeting">{QUIPPY_GREETING[band]}</p>

      {#if ref && fillable}
        <div class="q-target">
          <span class="lbl">field</span>
          <span class="val">{spanLabel(ref)}</span>
        </div>
        <div class="q-suggestions">
          {#each suggestions as s (s.value)}
            <button
              type="button"
              class="q-cand {s.framing}"
              onclick={() => fill(s.value)}
            >
              {#if s.framing === 'recommended'}<span class="tag">★ fits best</span>{/if}
              {#if s.framing === 'dull'}<span class="tag dull">· plain</span>{/if}
              <span class="ctext">{s.value}</span>
              <span class="oneclick" aria-hidden="true">fill ▸</span>
            </button>
          {/each}
        </div>
        {#if lastLine}<p class="q-fillline {band}">{lastLine}</p>{/if}
      {:else if ref}
        <p class="q-settled">That one's settled already. Nothing there for me — find me a blank.</p>
      {:else}
        <p class="q-settled">Open a record and point me at a blank. I'll see to the rest.</p>
      {/if}

      <p class="q-foot">{files.length} record{files.length === 1 ? '' : 's'} open · exposure {exposure.value}</p>
    </div>
  </div>
{/if}

<style>
  /* Quippy's register is deliberately NOT AMBER's: a soft sans-serif GUI overlay,
     warm violet, sitting over the cold terminal. The contrast is the content. */
  .quippy-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1rem;
    background: rgba(8, 4, 14, 0.4);
    backdrop-filter: blur(1px);
    animation: q-in 0.18s ease-out;
  }
  .quippy-overlay.post-breach { background: rgba(10, 2, 6, 0.6); }
  @keyframes q-in { 0% { opacity: 0; } 100% { opacity: 1; } }

  .quippy-card {
    width: min(34rem, 92vw);
    background: linear-gradient(#181225, #100b18);
    border: 1px solid #3a2c54;
    border-radius: 10px;
    padding: 1rem 1.2rem 1.1rem;
    box-shadow: 0 14px 55px rgba(90, 50, 150, 0.25);
    color: #d8cce8;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
  /* The card curdles as the band rises: warmer/brighter early, colder/redder late. */
  .quippy-card.mid { border-color: #4a3568; }
  .quippy-card.high { border-color: #6a3a6a; background: linear-gradient(#1c1020, #140a16); }
  .quippy-card.post-breach {
    border-color: #7a2c3c;
    background: linear-gradient(#1c0c12, #160810);
    color: #e6c6d0;
  }

  .q-head { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.7rem; }
  .q-icon {
    font-size: 1.05rem;
    color: #b88ce6;
    letter-spacing: -0.1em;
    transition: color 0.3s;
  }
  .q-icon.high { color: #d08ac0; }
  /* the diamondback tell grows clearer at the worst band */
  .q-icon.post-breach { color: #e0788a; text-shadow: 0 0 6px rgba(224, 120, 138, 0.5); }
  .q-name { font-weight: 600; color: #c9a8ec; letter-spacing: 0.02em; }
  .quippy-card.post-breach .q-name { color: #e0a0b0; }
  .q-close {
    margin-left: auto;
    background: #1a1228;
    border: 1px solid #3a2c54;
    color: #b88ce6;
    border-radius: 5px;
    padding: 0.28rem 0.65rem;
    font: inherit;
    font-size: 0.78rem;
    cursor: pointer;
  }
  .q-close:hover { border-color: #5a4684; color: #d0aef0; }

  .q-greeting { margin: 0 0 0.85rem; line-height: 1.5; color: #c8bade; font-size: 0.92rem; }
  .quippy-card.high .q-greeting { color: #d0b0d0; }
  .quippy-card.post-breach .q-greeting { color: #e0bac4; }

  .q-target { display: flex; gap: 0.5rem; align-items: baseline; margin-bottom: 0.55rem; }
  .q-target .lbl { color: #7a6a92; text-transform: uppercase; font-size: 0.66rem; letter-spacing: 0.08em; }
  .q-target .val { color: #c9a8ec; font-family: ui-monospace, Menlo, monospace; font-size: 0.8rem; }

  .q-suggestions { display: flex; flex-direction: column; gap: 0.4rem; }
  .q-cand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    text-align: left;
    background: #1a1330;
    border: 1px solid #2e2440;
    border-radius: 7px;
    padding: 0.5rem 0.65rem;
    color: #ddd0ef;
    font: inherit;
    font-size: 0.88rem;
    cursor: pointer;
    transition: transform 0.08s, border-color 0.12s, background 0.12s;
  }
  .q-cand:hover { background: #221836; border-color: #4a3a66; transform: translateX(2px); }
  .q-cand .ctext { flex: 1 1 auto; overflow-wrap: anywhere; }
  .q-cand .oneclick { flex: 0 0 auto; color: #9d6bd6; font-size: 0.78rem; }
  .q-cand .tag {
    flex: 0 0 auto;
    font-size: 0.66rem;
    color: #e0b870;
    background: #2a2010;
    border-radius: 4px;
    padding: 0.05rem 0.4rem;
  }
  .q-cand .tag.dull { color: #6a6076; background: #181420; }
  /* the recommended (escalatory) reading is highlighted; the dull (true) one fades */
  .q-cand.recommended { border-color: #6a4a86; box-shadow: 0 0 0 1px rgba(157, 107, 214, 0.25); }
  .q-cand.dull { opacity: 0.6; }

  .q-fillline { margin: 0.6rem 0 0; font-size: 0.82rem; font-style: italic; color: #b89ad0; }
  .q-fillline.high { color: #c890c0; }
  .q-fillline.post-breach { color: #d88a98; }

  .q-settled { margin: 0; color: #8a7aa2; font-style: italic; }
  .q-foot {
    margin: 0.9rem 0 0;
    padding-top: 0.6rem;
    border-top: 1px solid #2a2040;
    color: #6a5e80;
    font-size: 0.74rem;
    font-family: ui-monospace, Menlo, monospace;
  }

  @media (prefers-reduced-motion: reduce) {
    .quippy-overlay { animation: none; }
    .q-cand:hover { transform: none; }
  }
</style>
