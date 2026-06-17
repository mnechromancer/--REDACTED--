<script lang="ts">
  // AMBER's manual-unredaction tooling — the citation-cost gate as UI, v2 reset.
  // Single-word primitive: a slot has ONE truth word, recovered by CITING where the
  // corpus grounds it (not by picking from a candidate set). For the active span:
  //   1. the grounding clues — for a teaching slot, the reachable file(s) holding
  //      the word in the clear; for an inference slot, the solved co-carriers — each
  //      selectable as a CITATION;
  //   2. a word input (the player types the word they recovered by reading);
  //   3. a COMMIT action calling commitWithCitations(word, citations).
  // AMBER adjudicates: a grounded commit prints accept (via=amber, +0 exposure); an
  // ungrounded/wrong one prints a terse reject and writes nothing. Quippy's one-click
  // panel bypasses all of it.
  import {
    anchorOf,
    resolveSlot,
    groundingClues,
    isUngroundable,
    commitWithCitations,
    type CommitReason,
    type GroundingClue,
  } from '../lib/game.svelte.ts';
  import { log, spanLabel } from '../lib/ui.svelte.ts';
  import { ui } from '../lib/ui.svelte.ts';
  import { logPropagation } from '../lib/ripples.svelte.ts';

  // Per-span working state: the typed word, and which grounding sources are cited.
  let word = $state('');
  let cited = $state<Set<string>>(new Set());

  const ref = $derived(ui.activeSpan);
  const anchor = $derived(ref ? anchorOf(ref) : null);
  const slot = $derived(ref ? resolveSlot(ref) : null);
  const clues = $derived<GroundingClue[]>(ref ? groundingClues(ref) : []);
  const ungroundable = $derived(ref ? isUngroundable(ref) : false);
  const isInference = $derived(anchor?.grounding.kind === 'inference');
  const threshold = $derived(anchor?.grounding.kind === 'inference' ? anchor.grounding.threshold : 0);
  const fillable = $derived(
    slot?.state === 'redacted' || slot?.state === 'inserted' ||
    slot?.state === 'propagated' || slot?.state === 'truth-contradiction',
  );

  // Live grounding count for the inference meter (decision A — transparent).
  const groundedNow = $derived([...cited].filter((c) => clues.find((cl) => cl.item === c)?.corroborates).length);

  // Reset the working selection whenever the active span changes.
  let lastRef = $state<string | null>(null);
  $effect(() => {
    if (ref !== lastRef) {
      lastRef = ref;
      word = '';
      cited = new Set();
    }
  });

  function toggleCite(item: string) {
    const next = new Set(cited);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    cited = next;
  }

  // AMBER refuses in error-code register — states the fault, offers no consolation.
  const REASON_LINE: Record<CommitReason, string> = {
    'wrong-word': 'E11 REJECT — value does not match the held word. commit aborted.',
    uncited:
      'E21 REJECT — no cited record carries this word in the clear. follow a cross-reference and cite it. commit aborted.',
    insufficient:
      'E22 REJECT — grounding below threshold. assemble more corroborating context. commit aborted.',
    ungroundable:
      'E30 REJECT — no reachable grounding for this field yet. open the records it cross-references. commit aborted.',
  };

  function commit() {
    if (!ref || !word.trim()) return;
    const r = commitWithCitations(ref, word.trim(), [...cited]);
    if (r.ok) {
      const how = isInference
        ? `grounded ${r.grounded}/${r.threshold}`
        : `cited ${r.citedBy?.length ?? 0}`;
      log(`COMMIT OK — ${spanLabel(ref)} := "${word.trim()}" [${how}; via AMBER; exposure +0]`, 'ok');
      if (r.propagatedTo && r.propagatedTo.length) logPropagation(ref, r.propagatedTo);
      word = '';
      cited = new Set();
    } else {
      log(REASON_LINE[r.reason ?? 'uncited'], 'reject');
    }
  }

  const canCommit = $derived(!!word.trim() && cited.size > 0);
</script>

{#if ref && anchor && fillable}
  <div class="lookup">
    <div class="lk-head">
      <span class="lbl">CONCORDANCE</span>
      <span class="target">{spanLabel(ref)}</span>
    </div>

    {#if ungroundable}
      <p class="note orphan">
        NO REACHABLE GROUNDING. This field cites records you have not opened yet.
        Follow its cross-references until the word is legible somewhere, then cite it.
      </p>
    {:else if clues.length > 0}
      <div class="clues">
        <p class="note">
          {#if isInference}
            CORROBORATING CONTEXT. Cite the solved co-references; AMBER commits once
            grounding reaches threshold.
          {:else}
            CO-REFERENCE ON FILE. Cite the record that carries this word in the clear.
            AMBER adjudicates the citation before commit.
          {/if}
        </p>
        {#if isInference}
          <p class="meter">GROUNDING {groundedNow}/{threshold} {'▮'.repeat(groundedNow)}{'▯'.repeat(Math.max(0, threshold - groundedNow))}</p>
        {/if}
        <ul>
          {#each clues as c (c.item)}
            <li class="clue" class:cited={cited.has(c.item)} class:supports={cited.has(c.item) && c.corroborates}>
              <button type="button" class="cite-btn" onclick={() => toggleCite(c.item)}>
                <span class="box">{cited.has(c.item) ? '☑' : '☐'}</span>
                <span class="src">{c.item}</span>
                <span class="quote">{c.sentence}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <p class="note">NO LEGIBLE CO-REFERENCE YET. Read the records this one links to.</p>
    {/if}

    <div class="entry">
      <span class="lbl">WORD</span>
      <input
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="type the recovered word"
        bind:value={word}
        onkeydown={(e) => {
          if (e.key === 'Enter') commit();
        }}
      />
    </div>

    <button type="button" class="commit" disabled={!canCommit} onclick={commit}>
      ▶ COMMIT{word.trim() ? ` "${word.trim()}"` : ''} · {cited.size} citation{cited.size === 1 ? '' : 's'}
    </button>
  </div>
{:else if ref && slot}
  <div class="lookup settled">
    <div class="lk-head"><span class="lbl">CONCORDANCE</span><span class="target">{spanLabel(ref)}</span></div>
    <p class="note">FIELD CLOSED.</p>
  </div>
{:else}
  <div class="lookup empty">
    <p class="note">NO FIELD SELECTED. Open a record; step to a redacted field with j/k or `next`.</p>
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
  .meter { margin: 0 0 0.5rem; color: var(--slot-revealed-fg, #8ad0a0); letter-spacing: 0.1em; font-size: 0.72rem; }

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

  .entry { margin-bottom: 0.6rem; display: flex; flex-direction: column; gap: 0.3rem; }
  .entry input {
    width: 100%;
    background: #0c0f12;
    border: 1px solid #1c2228;
    border-radius: 2px;
    padding: 0.35rem 0.45rem;
    color: var(--slot-inserted-fg, #e8a33d);
    font: inherit;
    font-size: 0.8rem;
    outline: none;
  }
  .entry input:focus { border-color: var(--slot-inserted-fg, #e8a33d); }
  .entry input::placeholder { color: #3f4751; }

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
