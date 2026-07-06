<script lang="ts">
  // AMBER's manual-unredaction tooling — the FORGED-CITATION verb as UI (Phase 3,
  // design_note_forged_citations.md). AMBER no longer surfaces where the word lives;
  // the player FINDS it. For the active slot:
  //   1. type the recovered word (recall);
  //   2. read a reachable record, SELECT the span where the word stands, and FORGE a
  //      citation from it — the citation always draws (the player's assertion), staking
  //      into a per-slot buffer that persists so the case is visible;
  //   3. COMMIT — AMBER adjudicates only now: a forged span grounds iff its file is
  //      reachable AND the span literally carries the word. A span lacking it is
  //      rejected (the teaching signal). Inference slots count distinct grounding spans
  //      to a visible threshold (decision A).
  // A grounded commit prints accept (via=amber, +0 exposure); an ungrounded/wrong one
  // prints a terse reject and writes nothing. Quippy's one-click panel bypasses all of it.
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
    citationsFor,
    removeCitation,
    clearBuffer,
    noteHonestCommit,
    focusWord,
    openFile,
  } from '../lib/ui.svelte.ts';
  import { logPropagation } from '../lib/ripples.svelte.ts';

  // Per-span working state: the typed word. The forged citations live in the shared
  // per-slot buffer (ui.citationsFor) so they persist across span re-selection.
  let word = $state('');

  // The field this panel restores: the cursor when it sits on a span, else the HELD
  // work slot (Phase 2 playtest fix) — opening a shelf volume to find evidence must
  // not drop the blank being worked. `held` renders the tell that the target lives
  // in another record than the one on screen.
  const ref = $derived(ui.activeSpan ?? ui.workSlot);
  const held = $derived(!ui.activeSpan && !!ui.workSlot);
  const anchor = $derived(ref ? anchorOf(ref) : null);
  const slot = $derived(ref ? resolveSlot(ref) : null);
  const ungroundable = $derived(ref ? isUngroundable(ref) : false);
  const isInference = $derived(anchor?.grounding.kind === 'inference');
  const threshold = $derived(anchor?.grounding.kind === 'inference' ? anchor.grounding.threshold : 0);
  const fillable = $derived(
    slot?.state === 'redacted' || slot?.state === 'inserted' ||
    slot?.state === 'propagated' || slot?.state === 'truth-contradiction',
  );

  // The forged citations staked on this slot, and the live pane selection (the raw
  // material the FORGE button would stake).
  const buffer = $derived(ref ? citationsFor(ref) : []);
  const sel = $derived(currentSelection());

  // How many staked spans actually carry the word right now — the inference meter and
  // the commit-readiness hint (decision A: the grounding total is visible). We don't
  // tell the player WHERE the word is, only how their own staked case scores.
  const groundedNow = $derived(ref ? buffer.filter((c) => corroborates(c, ref)).length : 0);

  // Reset the typed word whenever the active span changes (the buffer persists per slot).
  let lastRef = $state<string | null>(null);
  $effect(() => {
    if (ref !== lastRef) {
      lastRef = ref;
      word = '';
    }
  });

  // The playtest smoothness fix: after a successful forge (this panel's button OR the
  // `c` hotkey/`cite` command, both of which funnel through forgeCitation), move
  // keyboard focus into the WORD input so typing the word and pressing Enter is the
  // very next thing the player does — no click required. `focusWord.token` is a
  // one-shot counter bumped only inside forgeCitation, so a mere ref change (opening
  // another record, stepping fields) never steals focus here — only an explicit forge does.
  let wordEl = $state<HTMLInputElement | null>(null);
  $effect(() => {
    if (focusWord.token > 0) wordEl?.focus();
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

  function commit() {
    if (!ref || !word.trim()) return;
    const r = commitWithCitations(ref, word.trim(), buffer);
    if (r.ok) {
      const how = isInference
        ? `grounded ${r.grounded}/${r.threshold}`
        : `cited ${r.citedBy?.length ?? 0}`;
      log(`COMMIT OK — ${spanLabel(ref)} := "${word.trim()}" [${how}; via AMBER; exposure +0]`, 'ok');
      if (r.propagatedTo && r.propagatedTo.length) logPropagation(ref, r.propagatedTo);
      const committedRef = ref;
      clearBuffer(committedRef);
      word = '';
      // Snap the view back to the record the word just landed in (playtest fix): the
      // player may have been reading a shelf volume, or another record entirely, to
      // find the grounding — without this the unredaction lands somewhere off screen
      // and the player never sees it happen. Must run BEFORE noteHonestCommit below,
      // whose first-contact routing (Quippy's uninvited entrance) may deliberately
      // send the view elsewhere — that authored beat wins on the first commit; every
      // later commit routes back to the solved record via this line.
      if (splitRef(committedRef).item !== ui.activeFile) {
        openFile(splitRef(committedRef).item);
      }
      // Quippy's uninvited first contact rides the player's FIRST honest commit
      // (decision v3-C) — it watches the verb land, then makes its case.
      noteHonestCommit(committedRef);
    } else {
      log(REASON_LINE[r.reason ?? 'uncited'], 'reject');
    }
  }

  // Commit is offered whenever the player has typed something and staked at least one
  // citation — the gate judges the rest. (You can stake a wrong case and learn from the
  // reject; that's the verb.)
  const canCommit = $derived(!!word.trim() && buffer.length > 0);
  function truncate(s: string, n = 56): string {
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
</script>

{#if ref && anchor && fillable}
  <div class="lookup">
    <div class="lk-head">
      <span class="lbl">CONCORDANCE</span>
      <span class="target">{spanLabel(ref)}</span>
      {#if held}<span class="held">◂ field held while you read</span>{/if}
    </div>

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
          and forge it onto this field. AMBER judges the citation at commit.
        {/if}
      </p>
    {/if}

    <!-- FORGE — evidence: staking the live pane selection. Prominent (the button
         states what it's about to stake) whenever there's a live selection;
         collapses to a one-line hint when there's nothing selected yet, so the two
         tools (forge evidence / spend it) read as distinct verbs, not one panel. -->
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

    <!-- UNREDACT — commit: spending staked evidence. Only appears once there's
         something to spend (a staked citation, or an inference slot's meter);
         until then there is nothing here to confuse with FORGE above. -->
    {#if buffer.length > 0 || isInference}
      <div class="divider" aria-hidden="true"></div>
      <div class="section unredact-section">
        <div class="sec-head"><span class="lbl">UNREDACT — commit</span></div>

        {#if isInference}
          <p class="meter">GROUNDING {groundedNow}/{threshold} {'▮'.repeat(groundedNow)}{'▯'.repeat(Math.max(0, threshold - groundedNow))}</p>
        {/if}

        {#if buffer.length > 0}
          <!-- The evidence file: the spans the player has forged for this slot. -->
          <ul class="buffer">
            {#each buffer as c, i (c.item + c.text + i)}
              <li class="cit" class:supports={corroborates(c, ref)}>
                <span class="box">{corroborates(c, ref) ? '▣' : '▢'}</span>
                <span class="src">{c.item}</span>
                <span class="quote">「{truncate(c.text)}」</span>
                <button type="button" class="drop" title="remove" onclick={() => removeCitation(ref, i)}>✕</button>
              </li>
            {/each}
          </ul>

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
                if (e.key === 'Enter') commit();
              }}
            />
          </div>

          <button type="button" class="commit" disabled={!canCommit} onclick={commit}>
            ▶ UNREDACT{word.trim() ? ` "${word.trim()}"` : ''} · {buffer.length} citation{buffer.length === 1 ? '' : 's'}
          </button>
        {:else}
          <p class="note subdued">no citations staked on this field — forge one first</p>
        {/if}
      </div>
    {/if}
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
  .target { color: var(--amber-fg, #e8b24d); letter-spacing: 0.04em; overflow-wrap: anywhere; }
  .held { color: var(--amber-green, #8ad0a0); font-size: 0.85rem; letter-spacing: 0.04em; }
  .note { margin: 0 0 0.55rem; color: var(--amber-fg-dim, #8a6a2c); line-height: 1.45; font-size: 0.9rem; }
  .note.orphan { color: #b0925a; }
  .note.subdued { color: #5b636e; font-size: 0.85rem; margin-bottom: 0; }
  .meter { margin: 0 0 0.5rem; color: var(--amber-green, #8ad0a0); letter-spacing: 0.1em; font-size: 0.85rem; }

  /* The two tools, split (playtest fix — a single FORGE-and-commit button read as
     one confusing multi-tool): FORGE stakes evidence, UNREDACT spends it. Each gets
     its own small header in the panel's existing label style; a hairline divider
     between them reads as "two verbs," not one panel doing two things. */
  .section { display: flex; flex-direction: column; }
  .sec-head { margin-bottom: 0.4rem; }
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

  /* The evidence file — the forged citations staked on this slot. */
  .buffer { list-style: none; margin: 0 0 0.6rem; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
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
  .cit.supports { border-color: var(--amber-green, #8ad0a0); }
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

  .entry { margin-bottom: 0.6rem; display: flex; flex-direction: column; gap: 0.3rem; }
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

  .lookup.empty .note, .lookup.settled .note { color: #5b636e; }
</style>
