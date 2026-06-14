<script lang="ts">
  // AMBER's manual-unredaction tooling — the citation-cost gate as UI (re-frame
  // §7.5, the honest half of the old HelpUtility). For the active span it shows:
  //   1. the Concordance: every co-carrier of the slot's concept, with its current
  //      reading, each selectable as a CITATION;
  //   2. the bounded candidate set, selectable;
  //   3. a COMMIT action that calls commitWithCitations(candidate, citations).
  // AMBER adjudicates: a corroborated commit prints accept (via=amber, +0 exposure);
  // an uncorroborated one prints a terse reject and writes nothing. This is the
  // whole evidentiary verb. Quippy's one-click panel bypasses all of it (Step 5).
  import {
    anchorOf,
    conceptClues,
    resolveSlot,
    isOrphanSlot,
    commitWithCitations,
    corroborates,
    revealedTruth,
    type CommitReason,
  } from '../lib/game.svelte.ts';
  import { ui, log, spanLabel } from '../lib/ui.svelte.ts';
  import { logPropagation } from '../lib/ripples.svelte.ts';
  import { progression, unlockedFiles } from '../lib/progression.svelte.ts';

  // Per-span working state: which candidate is chosen, which co-carriers are cited.
  let candidate = $state<string | null>(null);
  let cited = $state<Set<string>>(new Set());

  const ref = $derived(ui.activeSpan);
  const anchor = $derived(ref ? anchorOf(ref) : null);
  const slot = $derived(ref ? resolveSlot(ref) : null);
  const clues = $derived(ref ? conceptClues(ref) : []);
  const orphan = $derived(ref ? isOrphanSlot(ref) : false);
  const fillable = $derived(
    slot?.state === 'redacted' || slot?.state === 'inserted' || slot?.state === 'propagated',
  );

  // Reset the working selection whenever the active span changes.
  let lastRef = $state<string | null>(null);
  $effect(() => {
    if (ref !== lastRef) {
      lastRef = ref;
      candidate = null;
      cited = new Set();
    }
  });

  // The candidate's index — corroboration is index-aligned, so a citation supports
  // the chosen candidate only at this index.
  const k = $derived(candidate && anchor ? anchor.mutations.indexOf(candidate) : -1);

  // Live preview: does each clue currently corroborate the chosen candidate's index?
  // (Used to tint cited clues so the player sees their argument hold or not.)
  function clueCorroborates(clueRef: string): boolean {
    return ref !== null && k >= 0 && corroborates(clueRef, ref, k);
  }

  function toggleCite(clueRef: string) {
    const next = new Set(cited);
    if (next.has(clueRef)) next.delete(clueRef);
    else next.add(clueRef);
    cited = next;
  }

  const REASON_LINE: Record<CommitReason, string> = {
    'not-a-candidate': '✗ not an authored candidate.',
    uncorroborated: '✗ no corroborating citation. read more, then cite a co-carrier.',
    'orphan-unrevealed':
      '✗ local field — no co-carrier to cite. soluble only once its own clearance reveals it.',
  };

  function commit() {
    if (!ref || !candidate) return;
    const unlocked = unlockedFiles(progression.step);
    const r = commitWithCitations(ref, candidate, [...cited], (item) => unlocked.has(item));
    if (r.ok) {
      const how = orphan ? 'clearance-confirmed' : `cited ${r.citedBy?.length ?? 0}`;
      log(`✓ ${spanLabel(ref)} := "${candidate}" [${how}, via amber, exposure +0]`, 'ok');
      if (r.propagatedTo && r.propagatedTo.length) logPropagation(ref, r.propagatedTo);
      candidate = null;
      cited = new Set();
    } else {
      log(`${REASON_LINE[r.reason ?? 'uncorroborated']}`, 'reject');
    }
  }

  // Enable commit only when there's a candidate and (for multi-carrier slots) at
  // least one citation selected; the engine still adjudicates, but this stops a
  // pointless rejected commit. Orphan slots commit with no citation.
  const canCommit = $derived(
    !!candidate && (orphan ? revealedTruth.has(ref ?? '') : cited.size > 0),
  );

  function truncate(s: string, n = 40): string {
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
</script>

{#if ref && anchor && fillable}
  <div class="lookup">
    <div class="lk-head">
      <span class="lbl">CONCORDANCE</span>
      <span class="target">{spanLabel(ref)}</span>
    </div>

    {#if orphan}
      <p class="note orphan">
        Local field — no cross-reference carries this concept. AMBER admits it only
        once your clearance reveals its held value; there is nothing to cite.
      </p>
    {:else if clues.length > 0}
      <div class="clues">
        <p class="note">
          Cross-references carrying this concept. Select the co-reference(s) whose
          known reading supports your candidate; AMBER checks the citation.
        </p>
        <ul>
          {#each clues as c (c.ref)}
            <li
              class="clue {c.state}"
              class:cited={cited.has(c.ref)}
              class:supports={cited.has(c.ref) && clueCorroborates(c.ref)}
            >
              <button type="button" class="cite-btn" onclick={() => toggleCite(c.ref)}>
                <span class="box">{cited.has(c.ref) ? '☑' : '☐'}</span>
                <span class="src">{c.item}</span>
                <span class="quote">{c.sentence}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <p class="note">No cross-references yet legible. Raise clearance or solve a co-carrier.</p>
    {/if}

    <div class="candidates">
      <span class="lbl">CANDIDATE</span>
      <div class="cand-list">
        {#each anchor.mutations as cand (cand)}
          <button
            type="button"
            class="cand"
            class:chosen={candidate === cand}
            onclick={() => (candidate = cand)}
          >
            {cand}
          </button>
        {/each}
      </div>
    </div>

    <button type="button" class="commit" disabled={!canCommit} onclick={commit}>
      ▶ COMMIT{candidate ? ` "${truncate(candidate)}"` : ''}
      {#if !orphan && candidate}· {cited.size} citation{cited.size === 1 ? '' : 's'}{/if}
    </button>
  </div>
{:else if ref && slot}
  <div class="lookup settled">
    <div class="lk-head"><span class="lbl">CONCORDANCE</span><span class="target">{spanLabel(ref)}</span></div>
    <p class="note">
      {#if slot.state === 'truth-contradiction'}
        Entry struck — the held copy reads otherwise (shown red). Field locked to ground truth.
      {:else}
        Reconciled against the held copy. Field settled.
      {/if}
    </p>
  </div>
{:else}
  <div class="lookup empty">
    <p class="note">No span selected. Open a file and step to a redacted field.</p>
  </div>
{/if}

<style>
  .lookup {
    background: #080a0c;
    border: 1px solid #1a1f24;
    border-top: 2px solid #2a3138;
    padding: 0.6rem 0.75rem 0.7rem;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
    font-size: 0.76rem;
    color: #b9c0c8;
  }
  .lk-head {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #161b20;
  }
  .lbl {
    color: #5b6770;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.62rem;
  }
  .target { color: var(--slot-inserted-fg, #e8a33d); letter-spacing: 0.04em; }
  .note { margin: 0 0 0.55rem; color: #6b7480; line-height: 1.45; font-size: 0.72rem; }
  .note.orphan { color: #8a7f5a; }

  .clues ul { list-style: none; margin: 0 0 0.6rem; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
  .cite-btn {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    width: 100%;
    text-align: left;
    background: #0c0f12;
    border: 1px solid #1c2228;
    border-radius: 2px;
    padding: 0.3rem 0.45rem;
    color: inherit;
    font: inherit;
    font-size: 0.72rem;
    cursor: pointer;
  }
  .cite-btn:hover { border-color: #33414c; }
  .clue.cited .cite-btn { border-color: #4a5160; background: #11161b; }
  .clue.supports .cite-btn { border-color: var(--slot-revealed-fg, #8ad0a0); }
  .box { flex: 0 0 auto; color: #7f8a94; }
  .clue.supports .box { color: var(--slot-revealed-fg, #8ad0a0); }
  .src {
    flex: 0 0 auto;
    color: #5e7a90;
    font-size: 0.62rem;
    border: 1px solid #294056;
    border-radius: 2px;
    padding: 0 0.3ch;
  }
  .quote { color: #9aa9b6; font-style: italic; overflow-wrap: anywhere; }
  .clue.inserted .quote, .clue.propagated .quote { color: #c4cad1; font-style: normal; }
  .clue.revealed .quote { color: var(--slot-revealed-fg, #8ad0a0); font-style: normal; }

  .candidates { margin-bottom: 0.6rem; }
  .cand-list { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.3rem; }
  .cand {
    width: 100%;
    text-align: left;
    background: #0c0f12;
    border: 1px solid #1c2228;
    border-radius: 2px;
    padding: 0.3rem 0.45rem;
    color: var(--slot-inserted-fg, #e8a33d);
    font: inherit;
    font-size: 0.73rem;
    line-height: 1.3;
    cursor: pointer;
    overflow-wrap: anywhere;
  }
  .cand:hover { border-color: #4a5160; }
  .cand.chosen { border-color: var(--slot-inserted-fg, #e8a33d); background: #1c1608; }

  .commit {
    width: 100%;
    padding: 0.4rem 0.5rem;
    background: linear-gradient(#15201b, #0c1611);
    color: #8fd6b0;
    border: 1px solid #2a5a44;
    border-radius: 2px;
    font: inherit;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .commit:hover:not(:disabled) { border-color: var(--slot-revealed-fg, #8ad0a0); color: #b6efd0; }
  .commit:disabled { color: #4f5a52; border-color: #1c2620; cursor: default; }

  .lookup.empty .note, .lookup.settled .note { color: #5b636e; }
</style>
