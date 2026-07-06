<script lang="ts">
  // Quippy — the refusable GUI overlay (= SCP-X; scp_x_bible.md §2–§4). The easy,
  // costly tool: it surfaces candidates and ONE-CLICK FILLS a slot via
  // insert(ref, value, 'quippy') — no citation gate, exposure charged (Step 2). It
  // wears the Concordance's competence as a mask. Its voice degrades by exposure
  // band, and its candidate order lobbies for the entity's escalatory reading. It
  // visibly sits over AMBER (the App overlay), reinforcing that it is a costume
  // over the real tool. One keystroke (Esc / back) returns to AMBER — refusal is
  // always available, which is the whole thesis.
  import { anchorOf, resolveSlot, exposure, isReachable } from '../lib/game.svelte.ts';
  import { insert } from '../lib/game.svelte.ts';
  import { ui, dismissQuippy, spanLabel } from '../lib/ui.svelte.ts';
  import { logPropagation } from '../lib/ripples.svelte.ts';
  import {
    quippyBand,
    quippySuggestions,
    QUIPPY_GREETING,
    QUIPPY_FIRST_CONTACT,
    quippyFillLine,
  } from '../lib/quippy.svelte.ts';

  let { files }: { files: { item: string }[] } = $props();

  // Target the field being worked: the cursor, else the held work slot — so Quippy
  // can still pitch the blank the player left while they read the shelf.
  const ref = $derived(ui.activeSpan ?? ui.workSlot);
  const slot = $derived(ref ? resolveSlot(ref) : null);
  const fillable = $derived(
    slot?.state === 'redacted' || slot?.state === 'inserted' || slot?.state === 'propagated',
  );
  const band = $derived((void exposure.value, quippyBand()));
  const suggestions = $derived(ref && fillable ? quippySuggestions(ref) : []);

  // First contact is a PACED INTRODUCTION (§3.3): on its uninvited entrance Quippy
  // walks through QUIPPY_FIRST_CONTACT one beat at a time, and the fill offer is
  // withheld until it finishes its pitch. `introStep` indexes the line shown; it
  // only applies on the 'first-contact' open at the low band (a breach band drops
  // the act and skips the intro). Every later summon shows the single band greeting.
  const inIntro = $derived(ui.quippyReason === 'first-contact' && band === 'low');
  let introStep = $state(0);
  const introLine = $derived(QUIPPY_FIRST_CONTACT[introStep]);
  const introDone = $derived(introStep >= QUIPPY_FIRST_CONTACT.length - 1);
  // While the intro is mid-pitch, hold back the fill UI; reveal it on the last beat.
  const offering = $derived(!inIntro || introDone);

  const greeting = $derived(inIntro ? introLine : QUIPPY_GREETING[band]);

  function advanceIntro() {
    if (!introDone) introStep += 1;
  }

  // Quippy's last spoken line after a fill (so the player hears it curdle).
  let lastLine = $state<string | null>(null);

  function fill(value: string) {
    if (!ref) return;
    // Honest gate is reachability (decision D): a Quippy ripple may only land on a
    // file the player could already reach. The old onboarding-unlock gate is retired.
    const propagated = insert(ref, value, 'quippy', (item) => isReachable(item));
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

      <p class="q-greeting">{greeting}</p>

      {#if inIntro && !introDone}
        <!-- Paced introduction: the player advances Quippy's pitch one beat at a
             time; the fill offer is withheld until the last line (§3.3). -->
        <div class="q-intro-nav">
          <span class="q-intro-dots" aria-hidden="true">
            {#each QUIPPY_FIRST_CONTACT as _, i (i)}<span class="dot {i <= introStep ? 'on' : ''}"></span>{/each}
          </span>
          <button type="button" class="q-continue" onclick={advanceIntro}>continue ▸</button>
        </div>
      {:else if offering && ref && fillable}
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
      {:else if offering && ref}
        <p class="q-settled">That one's settled already. Nothing there for me — find me a blank.</p>
      {:else if offering}
        <p class="q-settled">Open a record and point me at a blank. I'll see to the rest.</p>
      {/if}

      <p class="q-foot">{files.length} record{files.length === 1 ? '' : 's'} open · exposure {exposure.value}</p>
    </div>
  </div>
{/if}

<style>
  /* Quippy's register is deliberately NOT AMBER's, and the contrast is now SHARPER:
     where AMBER is a rough VT323 phosphor terminal that ROTS with exposure, Quippy is
     CRISP and pleasing — a clean modern GUI, anti-aliased, smooth, untouched by the
     corruption. It is the parasite WRAPPING AMBER and rewriting its IO stream: it
     blurs the terminal behind it and presents a frictionless surface. The nicer it
     looks next to the decaying terminal, the sharper the bargain reads. */
  .quippy-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1rem;
    background: rgba(8, 4, 14, 0.5);
    /* a stronger, cleaner blur — Quippy visibly intercepts/obscures AMBER's stream. */
    backdrop-filter: blur(3px) saturate(1.1);
    animation: q-in 0.18s ease-out;
  }
  .quippy-overlay.post-breach { background: rgba(10, 2, 6, 0.65); }
  @keyframes q-in { 0% { opacity: 0; transform: scale(0.99); } 100% { opacity: 1; transform: scale(1); } }

  .quippy-card {
    width: min(34rem, 92vw);
    background: linear-gradient(#1c1530, #120c1e);
    border: 1px solid #4a3568;
    border-radius: 12px;
    padding: 1.05rem 1.25rem 1.15rem;
    /* a crisp, designed drop shadow + inner highlight — polished, unlike AMBER's
       boxed institutional chrome. */
    box-shadow:
      0 18px 60px rgba(90, 50, 150, 0.35),
      inset 0 1px 0 rgba(200, 160, 255, 0.12);
    color: #e4d8f4;
    font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: 0.005em;
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

  /* The paced first-contact intro: progress dots + a continue affordance. */
  .q-intro-nav { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.2rem; }
  .q-intro-dots { display: flex; gap: 0.32rem; }
  .q-intro-dots .dot {
    width: 0.4rem; height: 0.4rem; border-radius: 50%;
    background: #2e2440; transition: background 0.2s;
  }
  .q-intro-dots .dot.on { background: #9d6bd6; }
  .q-continue {
    margin-left: auto;
    background: #1a1330;
    border: 1px solid #4a3a66;
    color: #c9a8ec;
    border-radius: 6px;
    padding: 0.34rem 0.8rem;
    font: inherit;
    font-size: 0.82rem;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s;
  }
  .q-continue:hover { border-color: #6a4a86; color: #e0c8f8; }

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
