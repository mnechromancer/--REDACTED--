<script lang="ts">
  // AMBER's manual-unredaction tooling — the FORGED-CITATION verb as UI (Phase 3,
  // design_note_forged_citations.md; reworked for the citation-workspace redesign,
  // playtest 2026-07-06). AMBER no longer surfaces where the word lives; the player
  // FINDS it. The verb is now two independent steps:
  //   1. FORGE — read a reachable record, SELECT the span where a word stands, and
  //      forge a citation from it. Forging is TARGET-FREE: it stakes into the global
  //      workspace, not a per-slot buffer, so browsing documents never steals it.
  //   2. PREPARE → INITIATE — pin the field you mean to restore (`prepare.ref`),
  //      select which workspace citations ground it, type the word, and commit.
  //      The prepared field is PINNED against browse-retargeting: opening other
  //      records to hunt for evidence cannot move or clear it.
  // COMMIT (initiate) is where AMBER adjudicates: a selected span grounds iff its
  // file is reachable AND the span literally carries the word. Inference slots count
  // distinct grounding spans among the SELECTED citations to a visible threshold
  // (decision A). A grounded initiate prints accept (via=amber, +0 exposure); an
  // ungrounded/wrong one prints a terse reject and writes nothing — prepare stays
  // active so the player can fix their case. Quippy's one-click panel bypasses all
  // of it.
  import {
    anchorOf,
    resolveSlot,
    isUngroundable,
    corroborates,
    commitWithCitations,
    splitRef,
    type CommitReason,
  } from '../lib/game.svelte.ts';
  import {
    ui,
    log,
    spanLabel,
    currentSelection,
    forgeCitation,
    workspace,
    removeCitation,
    prepare,
    beginPrepare,
    cancelPrepare,
    selectedCitations,
    toggleSelected,
    noteHonestCommit,
    focusWord,
    openFile,
  } from '../lib/ui.svelte.ts';
  import { logPropagation } from '../lib/ripples.svelte.ts';

  // The typed word for the field currently being prepared.
  let word = $state('');

  // The field this panel targets: PINNED to the prepared field while an unredaction
  // is in progress; otherwise it follows the cursor/work slot as before (the
  // held-field tell is only meaningful in that non-preparing state).
  const ref = $derived(prepare.ref ?? ui.activeSpan ?? ui.workSlot);
  const held = $derived(!prepare.ref && !ui.activeSpan && !!ui.workSlot);
  const anchor = $derived(ref ? anchorOf(ref) : null);
  const slot = $derived(ref ? resolveSlot(ref) : null);
  const ungroundable = $derived(ref ? isUngroundable(ref) : false);
  const isInference = $derived(anchor?.grounding.kind === 'inference');
  const threshold = $derived(anchor?.grounding.kind === 'inference' ? anchor.grounding.threshold : 0);
  const fillable = $derived(
    slot?.state === 'redacted' || slot?.state === 'inserted' ||
    slot?.state === 'propagated' || slot?.state === 'truth-contradiction',
  );

  // The live pane selection (the raw material the FORGE button stakes).
  const sel = $derived(currentSelection());

  // The workspace citations currently selected toward the prepared field, and how
  // many actually corroborate it right now — the inference meter and the
  // initiate-readiness hint (decision A: the grounding total is visible). We don't
  // tell the player WHERE the word is, only how their own selected case scores.
  const selected = $derived(prepare.ref ? selectedCitations() : []);
  const groundedNow = $derived(ref ? selected.filter((c) => corroborates(c, ref)).length : 0);

  // Reset the typed word whenever prepare targets a new field (or stops).
  let lastPrepareRef = $state<string | null>(null);
  $effect(() => {
    if (prepare.ref !== lastPrepareRef) {
      lastPrepareRef = prepare.ref;
      word = '';
    }
  });

  // The playtest smoothness fix: after a successful forge (this panel's button OR
  // the `c` hotkey/`cite` command, both of which funnel through forgeCitation), move
  // keyboard focus into the WORD input — but only while an unredaction is prepared;
  // a forge with nothing prepared has no word input to focus. `focusWord.token` is a
  // one-shot counter bumped only inside forgeCitation, so a mere ref change (opening
  // another record, stepping fields) never steals focus here — only an explicit forge does.
  let wordEl = $state<HTMLInputElement | null>(null);
  $effect(() => {
    if (focusWord.token > 0 && prepare.ref) wordEl?.focus();
  });

  function forge() {
    if (!sel) return;
    forgeCitation();
  }

  // AMBER refuses in error-code register — states the fault, offers no consolation.
  const REASON_LINE: Record<CommitReason, string> = {
    'wrong-word': 'E11 REJECT — value does not match the held word. commit aborted.',
    uncited:
      'E21 REJECT — no forged citation carries this word. select the span where it stands and forge it. commit aborted.',
    insufficient:
      'E22 REJECT — grounding below threshold. forge more corroborating spans. commit aborted.',
    ungroundable:
      'E30 REJECT — no reachable record grounds this field yet. open the records it cross-references. commit aborted.',
  };

  function initiate() {
    if (!prepare.ref || !word.trim()) return;
    const targetRef = prepare.ref;
    const r = commitWithCitations(targetRef, word.trim(), selected);
    if (r.ok) {
      const how = isInference
        ? `grounded ${r.grounded}/${r.threshold}`
        : `cited ${r.citedBy?.length ?? 0}`;
      log(`COMMIT OK — ${spanLabel(targetRef)} := "${word.trim()}" [${how}; via AMBER; exposure +0]`, 'ok');
      if (r.propagatedTo && r.propagatedTo.length) logPropagation(targetRef, r.propagatedTo);
      // Snap the view back to the record the word just landed in (playtest fix): the
      // player may have been reading a shelf volume, or another record entirely, to
      // find the grounding — without this the unredaction lands somewhere off screen
      // and the player never sees it happen. Must run BEFORE noteHonestCommit below,
      // whose first-contact routing (Quippy's uninvited entrance) may deliberately
      // send the view elsewhere — that authored beat wins on the first commit; every
      // later commit routes back to the solved record via this line.
      if (splitRef(targetRef).item !== ui.activeFile) {
        openFile(splitRef(targetRef).item);
      }
      // The unredaction is done — clear the PREPARE pin (not the workspace: a span
      // can ground more than one field, so staked citations survive).
      cancelPrepare();
      word = '';
      // Quippy's uninvited first contact rides the player's FIRST honest commit
      // (decision v3-C) — it watches the verb land, then makes its case.
      noteHonestCommit(targetRef);
    } else {
      log(REASON_LINE[r.reason ?? 'uncited'], 'reject');
    }
  }

  // Initiate is offered once the player has typed something and selected at least
  // one workspace citation toward it — the gate judges the rest. (You can select a
  // wrong case and learn from the reject; prepare stays active to fix it.)
  const canInitiate = $derived(!!prepare.ref && !!word.trim() && selected.length > 0);
  function truncate(s: string, n = 56): string {
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
</script>

<div class="lookup" class:empty={!ref}>
  <div class="lk-head">
    {#if prepare.ref}
      <span class="lbl prepared">UNREDACTION PREPARED</span>
      <span class="target">{spanLabel(prepare.ref)}</span>
    {:else}
      <span class="lbl">CONCORDANCE</span>
      {#if ref}<span class="target">{spanLabel(ref)}</span>{/if}
      {#if held}<span class="held">◂ field held while you read</span>{/if}
    {/if}
  </div>

  {#if ref && anchor}
    {#if ungroundable}
      <p class="note orphan">
        NO REACHABLE RECORD GROUNDS THIS FIELD. It depends on records you have not opened.
        Follow its cross-references until the word stands somewhere, then forge a citation.
      </p>
    {:else}
      <p class="note">
        {#if isInference}
          ASSEMBLE GROUNDING. No single record states this word. Forge spans of corroborating
          context from the records you have read; AMBER commits once grounding reaches threshold.
        {:else}
          FORGE A CITATION. Find the word where it stands in another record, select that span,
          and forge it into your workspace. AMBER judges the citation at commit.
        {/if}
      </p>
    {/if}
  {:else}
    <p class="note subdued">NO FIELD SELECTED. Open a record; step to a redacted field with j/k or `next`.</p>
  {/if}

  <!-- FORGE — evidence: staking the live pane selection into the workspace. Always
       present — forging no longer needs a target, so the player can stake evidence
       before ever preparing an unredaction (the evidence-first flow). Prominent
       whenever there's a live selection; collapses to a one-line hint otherwise. -->
  <div class="section forge-section">
    <div class="sec-head"><span class="lbl">FORGE — evidence</span></div>
    {#if sel}
      <div class="forge">
        <button type="button" class="forge-btn" onclick={forge}>
          ＋ FORGE CITATION ◂ {sel.item}
        </button>
        <span class="sel-preview" title={sel.text}>「{truncate(sel.text)}」</span>
      </div>
    {:else}
      <p class="sel-hint">select prose in a record to stake it</p>
    {/if}
  </div>

  <!-- WORKSPACE — the pouch: every citation forged this run, regardless of what's
       prepared. Not preparing: a plain list you can prune. Preparing: the same rows
       become checkboxes — click to count a citation toward the prepared field, with
       the existing ▣/▢ glyph showing which ones actually corroborate it. -->
  {#if workspace.citations.length > 0}
    <div class="divider" aria-hidden="true"></div>
    <div class="section workspace-section">
      <div class="sec-head">
        <span class="lbl">WORKSPACE</span>
        <span class="count">{workspace.citations.length}</span>
      </div>
      <ul class="buffer">
        {#each workspace.citations as c, i (c.item + c.text + i)}
          {#if prepare.ref}
            {@const isSel = prepare.selected.includes(i)}
            {@const isSupport = corroborates(c, prepare.ref)}
            <li class="cit selectable" class:selected={isSel} class:supports={isSupport}>
              <button
                type="button"
                class="cit-btn"
                role="checkbox"
                aria-checked={isSel}
                onclick={() => toggleSelected(i)}
              >
                <span class="chk">{isSel ? '☑' : '☐'}</span>
                <span class="box">{isSupport ? '▣' : '▢'}</span>
                <span class="src">{c.item}</span>
                <span class="quote">「{truncate(c.text)}」</span>
              </button>
            </li>
          {:else}
            <li class="cit">
              <span class="src">{c.item}</span>
              <span class="quote">「{truncate(c.text)}」</span>
              <button type="button" class="drop" title="remove" onclick={() => removeCitation(i)}>✕</button>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  {/if}

  <!-- UNREDACT — commit: either the entry point (PREPARE) or, once prepared, the
       word entry + INITIATE. -->
  {#if !prepare.ref}
    {#if ref && fillable}
      <div class="divider" aria-hidden="true"></div>
      <div class="section unredact-section">
        <button type="button" class="prepare-btn" onclick={() => beginPrepare(ref)}>
          ▶ PREPARE UNREDACTION — {spanLabel(ref)}
        </button>
      </div>
    {/if}
  {:else}
    <div class="divider" aria-hidden="true"></div>
    <div class="section unredact-section">
      <div class="sec-head"><span class="lbl">UNREDACT — commit</span></div>

      {#if isInference}
        <p class="meter">GROUNDING {groundedNow}/{threshold} {'▮'.repeat(groundedNow)}{'▯'.repeat(Math.max(0, threshold - groundedNow))}</p>
      {/if}

      <div class="entry">
        <span class="lbl">WORD</span>
        <input
          type="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="type the recovered word"
          bind:value={word}
          bind:this={wordEl}
          onkeydown={(e) => {
            if (e.key === 'Enter') initiate();
          }}
        />
      </div>

      <button type="button" class="commit" disabled={!canInitiate} onclick={initiate}>
        ▶ INITIATE UNREDACTION · {selected.length} citation{selected.length === 1 ? '' : 's'} selected
      </button>
      <button type="button" class="cancel" onclick={cancelPrepare}>✕ cancel</button>
    </div>
  {/if}
</div>

<style>
  .lookup {
    background: var(--amber-bg-raised, #100b06);
    border: 1px solid var(--amber-edge, #3a2c12);
    border-top: 2px solid var(--amber-edge-bright, #6a5220);
    padding: 0.6rem 0.75rem 0.7rem;
    font-family: var(--amber-font, ui-monospace), monospace;
    font-size: 1rem;
    color: var(--amber-fg-dim, #8a6a2c);
  }
  .lk-head {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--amber-edge, #3a2c12);
  }
  .lbl {
    color: var(--amber-fg-faint, #5a4720);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.85rem;
  }
  .lbl.prepared { color: var(--slot-inserted-fg, #e8a33d); }
  .target { color: var(--amber-fg, #e8b24d); letter-spacing: 0.04em; overflow-wrap: anywhere; }
  .held { color: var(--amber-green, #8ad0a0); font-size: 0.85rem; letter-spacing: 0.04em; }
  .note { margin: 0 0 0.55rem; color: var(--amber-fg-dim, #8a6a2c); line-height: 1.45; font-size: 0.9rem; }
  .note.orphan { color: #b0925a; }
  .note.subdued { color: #5b636e; font-size: 0.85rem; }
  .meter { margin: 0 0 0.5rem; color: var(--amber-green, #8ad0a0); letter-spacing: 0.1em; font-size: 0.85rem; }

  /* Each panel section gets its own small header in the existing label style; a
     hairline divider between sections reads as distinct steps, not one panel doing
     everything at once. */
  .section { display: flex; flex-direction: column; }
  .sec-head { margin-bottom: 0.4rem; display: flex; align-items: baseline; gap: 0.5rem; }
  .sec-head .count { color: var(--amber-fg-dim, #8a6a2c); font-size: 0.85rem; }
  .divider { height: 1px; background: var(--amber-edge, #3a2c12); margin: 0.7rem 0; }

  /* The forge affordance — stake the live selection. */
  .forge { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
  .forge-btn {
    flex: 0 0 auto;
    background: linear-gradient(#16140c, #100e08);
    color: #d8c08a;
    border: 1px solid #5a4a22;
    border-radius: 2px;
    padding: 0.3rem 0.55rem;
    font: inherit;
    font-size: 0.85rem;
    letter-spacing: 0.03em;
    cursor: pointer;
  }
  .forge-btn:hover { border-color: #8a7234; color: #f0d89a; }
  .sel-preview { color: #9aa9b6; font-style: italic; font-size: 0.85rem; overflow-wrap: anywhere; }
  .sel-hint { color: #4d5560; font-size: 0.85rem; margin: 0; }

  /* The workspace — every forged citation, staked or prepared-selectable. */
  .buffer { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
  .cit {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    background: var(--amber-bg-sunken, #060402);
    border: 1px solid var(--amber-edge, #3a2c12);
    border-radius: 2px;
    padding: 0.3rem 0.45rem;
    font-size: 0.85rem;
  }
  .cit.selectable { padding: 0; }
  .cit.selectable:hover { border-color: var(--amber-edge-bright, #6a5220); }
  .cit.selected { border-color: var(--slot-inserted-fg, #e8a33d); background: rgba(232, 163, 61, 0.06); }
  .cit.supports { border-color: var(--amber-green, #8ad0a0); }
  .cit-btn {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    width: 100%;
    box-sizing: border-box;
    padding: 0.3rem 0.45rem;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-size: inherit;
    text-align: left;
    cursor: pointer;
  }
  .cit .chk { flex: 0 0 auto; color: var(--slot-inserted-fg, #e8a33d); }
  .cit .box { flex: 0 0 auto; color: var(--amber-fg-dim, #8a6a2c); }
  .cit.supports .box { color: var(--amber-green, #8ad0a0); }
  .cit .src {
    flex: 0 0 auto;
    color: var(--amber-fg, #e8b24d);
    font-size: 0.78rem;
    border: 1px solid var(--amber-edge-bright, #6a5220);
    border-radius: 2px;
    padding: 0 0.3ch;
  }
  .cit .quote { flex: 1 1 auto; color: var(--amber-fg-dim, #8a6a2c); font-style: italic; overflow-wrap: anywhere; }
  .cit .drop {
    flex: 0 0 auto;
    background: none; border: none; color: #6b5050; cursor: pointer;
    font: inherit; font-size: 0.85rem; padding: 0;
  }
  .cit .drop:hover { color: var(--slot-contradiction-fg, #e85d5d); }

  /* PREPARE — the entry point into an unredaction. */
  .prepare-btn {
    width: 100%;
    padding: 0.4rem 0.5rem;
    background: linear-gradient(#1a1410, #120e0a);
    color: #d8c08a;
    border: 1px solid #5a4a22;
    border-radius: 2px;
    font: inherit;
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .prepare-btn:hover { border-color: #8a7234; color: #f0d89a; }

  .entry { margin: 0.5rem 0 0.6rem; display: flex; flex-direction: column; gap: 0.3rem; }
  .entry input {
    width: 100%;
    box-sizing: border-box; /* padding/border inside the box — no overflow past the module */
    min-width: 0;
    background: #0c0f12;
    border: 1px solid #1c2228;
    border-radius: 2px;
    padding: 0.35rem 0.45rem;
    color: var(--slot-inserted-fg, #e8a33d);
    font: inherit;
    font-size: 0.9rem;
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
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .commit:hover:not(:disabled) { border-color: var(--slot-revealed-fg, #8ad0a0); color: #b6efd0; }
  .commit:disabled { color: #4f5a52; border-color: #1c2620; cursor: default; }

  .cancel {
    margin-top: 0.4rem;
    align-self: flex-start;
    background: none;
    border: none;
    color: #6b5050;
    font: inherit;
    font-size: 0.8rem;
    letter-spacing: 0.03em;
    cursor: pointer;
    padding: 0;
  }
  .cancel:hover { color: var(--slot-contradiction-fg, #e85d5d); }

  .lookup.empty .note { color: #5b636e; }
</style>
