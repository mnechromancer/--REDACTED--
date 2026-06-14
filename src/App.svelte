<script lang="ts">
  // ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md §1, §3): top-level
  //   composition must host TWO interface modes — AMBER (CLI) and the Quippy GUI
  //   overlay — with a felt switch between them. The audit bar + end overlay here
  //   encode the OBSOLETE win model (R§2). Major recompose, gated on R§6.
  //   See planning/handoff_janitor.md → "App.svelte".
  //
  // Sprint-1 slice harness: load the built corpus, render its files with
  // clearance gating, and let the player raise clearance and insert via the
  // SCP-X hover. Not the final Desktop window manager (§7) — just enough to feel
  // the C3–C5 loop. The corpus is the build output of `npm run build:corpus`
  // (vault/entries/*.md → static/corpus.json), imported directly so Vite bundles
  // it; rebuild the corpus and the dev server hot-reloads the new content.
  import './styles/tokens.css';
  import type { Corpus } from './lib/corpus.ts';
  import {
    corpus,
    clearance,
    exposure,
    loadCorpus,
    raiseClearance,
    auditSummary,
    boardState,
    sessionResult,
    BREACH_THRESHOLD,
  } from './lib/game.svelte.ts';
  import {
    progression,
    SCRIPT,
    UNLOCK_ORDER,
    unlockedFiles,
    beginSession,
    advanceProgression,
  } from './lib/progression.svelte.ts';
  import { logAudit } from './lib/ripples.svelte.ts';
  import FileWindow from './components/FileWindow.svelte';
  import RippleLog from './components/RippleLog.svelte';
  import corpusData from '../static/corpus.json';

  loadCorpus(corpusData as Corpus);

  // Start at L2: every file opens (003 needs L2), and every guessable slot in the
  // trio sits at redaction_level ≥ 3, so nothing is auto-revealed at the starting
  // tier. The player reads and fills freely; an audit (raising to L3+) is then a
  // deliberate reconciliation of what they've entered, never a reveal of a slot
  // they haven't reached yet. This is the floor; raiseClearance only ever climbs.
  raiseClearance(2);

  const board = $derived(boardState());

  // The session resolution: 'playing' until exposure breaches (loss) or the
  // player has correctly restored enough of the record (containment win).
  const result = $derived(sessionResult());
  const ended = $derived(result.outcome !== 'playing');

  // Only the files the onboarding has unlocked are shown, in unlock order, so the
  // player meets one record (and one mechanic) at a time rather than the whole
  // board at once. progression.step drives this.
  const visibleFiles = $derived.by(() => {
    const ok = unlockedFiles(progression.step);
    return UNLOCK_ORDER.filter((id) => ok.has(id) && corpus[id]).map((id) => corpus[id]);
  });

  // Advance the onboarding script whenever the board changes (an insert, an
  // audit, a propagation). advanceProgression is monotonic and reads boardState,
  // so an effect over the board is the simplest non-circular wiring.
  $effect(() => {
    void board.filled;
    void board.reconciled;
    void board.propagated;
    advanceProgression();
  });

  // The AUDIT is the payoff gesture: raising clearance reveals the next batch of
  // ground truth (invariant #4 — batched + clearance-gated), and any guess that
  // contradicts the revealed truth flips to the red truth-contradiction state.
  const MAX_TIER = 5;
  const nextTier = $derived(Math.min(MAX_TIER, clearance.tier + 1) as 1 | 2 | 3 | 4 | 5);
  const canAudit = $derived(clearance.tier < MAX_TIER && progression.step !== 'boot' && !ended);

  // Exposure pressure tints the readout as it climbs toward the breach line, so
  // the breach is felt approaching rather than arriving without warning.
  const expLevel = $derived(
    exposure.value >= BREACH_THRESHOLD
      ? 'breach'
      : exposure.value >= BREACH_THRESHOLD - 3
        ? 'danger'
        : exposure.value >= BREACH_THRESHOLD - 6
          ? 'warn'
          : 'calm',
  );

  let lastAudit = $state<{
    tier: number;
    discrepancies: number;
    confirmed: number;
    blanks: number;
    expSpike: number;
  } | null>(null);

  function runAudit() {
    if (!canAudit) return;
    const before = exposure.value;
    const batch = raiseClearance(nextTier);
    const s = auditSummary(batch);
    lastAudit = {
      tier: clearance.tier,
      discrepancies: s.discrepancies.length,
      confirmed: s.confirmed.length,
      blanks: s.blanks.length,
      expSpike: Math.max(0, Math.round((exposure.value - before) * 10) / 10), // corruption added by struck guesses
    };
    logAudit(clearance.tier, s.discrepancies.length, s.confirmed.length);
  }

  // Current script for the step drives the ticker prompt + tone and the exposition.
  const script = $derived(SCRIPT[progression.step]);
</script>

{#if progression.step === 'boot'}
  <!-- Boot/exposition screen: establish the Concordance and the work before any
       records load, so the first thing the player meets is a voice, not a wall
       of files. -->
  <main class="boot">
    <div class="boot-frame">
      <div class="boot-head">AMBER · ARCHIVE MANAGEMENT &amp; BATCH ENTRY RESOURCE</div>
      <div class="boot-body">
        {#each script.exposition as line, i (i)}
          <p class="boot-line" style="--i: {i}">
            <span class="speaker">SCP-X</span>{line}
          </p>
        {/each}
      </div>
      <button class="boot-begin" onclick={beginSession}>▶ BEGIN SHIFT</button>
    </div>
  </main>
{:else}
  <main>
    <header class="hud">
      <span class="site">SITE-41B · DEEP RECORDS</span>
      <span class="progress">{board.filled + board.propagated}/{board.totalSlots} fields restored</span>
      <span class="tier-readout">CLEARANCE L{clearance.tier}</span>
      <span class="exposure {expLevel}">{exposure.value} / {BREACH_THRESHOLD}</span>
    </header>

    <!-- Staged Concordance ticker: the step's exposition (shown once on entry)
         and its standing prompt. Keyed on step so the exposition re-animates as
         the player advances. -->
    <div class="concordance {script.tone}">
      <span class="speaker">SCP-X</span>
      <div class="concordance-body">
        {#key progression.step}
          {#each script.exposition as line, i (i)}
            <p class="exposition" style="--i: {i}">{line}</p>
          {/each}
        {/key}
        <p class="prompt">{script.prompt}</p>
      </div>
    </div>

    <div class="audit-bar">
      <button class="audit" disabled={!canAudit} onclick={runAudit}>
        {#if clearance.tier >= MAX_TIER}
          AUDIT COMPLETE · L{MAX_TIER}
        {:else}
          ▶ RUN AUDIT · RAISE TO L{nextTier}
        {/if}
      </button>
      {#if lastAudit}
        <div class="audit-result" class:flagged={lastAudit.discrepancies > 0}>
          <span class="stamp">AUDIT L{lastAudit.tier}</span>
          {#if lastAudit.discrepancies > 0}
            <span class="disc">{lastAudit.discrepancies} DISCREPANC{lastAudit.discrepancies === 1 ? 'Y' : 'IES'}</span>
          {/if}
          {#if lastAudit.confirmed > 0}
            <span class="conf">{lastAudit.confirmed} confirmed</span>
          {/if}
          {#if lastAudit.expSpike > 0}
            <span class="spike">corruption +{lastAudit.expSpike} exposure</span>
          {/if}
          {#if lastAudit.blanks > 0}
            <span class="blank">{lastAudit.blanks} unfilled</span>
          {/if}
          {#if lastAudit.discrepancies === 0 && lastAudit.confirmed === 0}
            <span class="blank">no prior entries to reconcile</span>
          {/if}
        </div>
      {/if}
    </div>

    <div class="layout">
      <div class="windows">
        {#each visibleFiles as file (file.item)}
          <FileWindow {file} />
        {/each}
      </div>
      <RippleLog />
    </div>

    {#if ended}
      <!-- Session resolution. Breach = the record went too soft and the entity
           re-indexed out of containment (loss). Containment = the record was
           restored correctly within the exposure line (win). -->
      <div class="end-overlay" class:breach={result.outcome === 'breach'}>
        <div class="end-card">
          {#if result.outcome === 'breach'}
            <div class="end-stamp breach">CONTAINMENT BREACH</div>
            <p class="end-line">
              <span class="speaker">SCP-X</span>The record has gone soft past holding. The
              entry described in these files is no longer described by them — it has re-indexed
              out of its containment. Exposure reached {result.exposure} against a tolerance of
              {result.threshold}.
            </p>
            <p class="end-sub">
              You restored too much. Every value you wrote loosened the record; together they
              let the subject out. The site does not log what happens next.
            </p>
          {:else}
            <div class="end-stamp contained">SITE HELD</div>
            <p class="end-line">
              <span class="speaker">SCP-X</span>The record is reconciled and the holding copies
              agree. {result.correct} field{result.correct === 1 ? '' : 's'} restored correctly,
              {result.struck} struck — exposure {result.exposure} of {result.threshold}, under
              the line. The subject stays described, and so stays contained.
            </p>
            <p class="end-sub">
              You read the record without unreading it. The shift ends. The next archivist
              inherits a corpus that still holds — for now.
            </p>
          {/if}
          <button class="end-restart" onclick={() => location.reload()}>↺ NEW SHIFT</button>
        </div>
      </div>
    {/if}
  </main>
{/if}

<style>
  :global(body) {
    margin: 0;
    background: #060708;
    color: #c8ccd2;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  }
  main {
    max-width: 64rem;
    margin: 0 auto;
    padding: 1.5rem 1rem 4rem;
  }

  /* Two-column board: the records on the left, the cross-reference log on the
     right. Collapses to a single column on narrow viewports. */
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 16rem;
    gap: 1.25rem;
    align-items: start;
  }
  @media (max-width: 46rem) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  /* The HUD reads as the terminal's system status bar: a ruled banner with the
     site identity, the clearance control, and the live exposure readout. */
  .hud {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 0.55rem 0.85rem;
    background: linear-gradient(#101317, #0b0d10);
    border: 1px solid #1c2026;
    border-radius: 4px;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    color: #8a93a0;
  }
  .site {
    letter-spacing: 0.12em;
    color: #7c848e;
  }
  .site::before {
    content: '▣ ';
    color: #4d5460;
  }
  .progress {
    margin-left: auto;
    color: #6b7280;
    letter-spacing: 0.04em;
  }
  .tier-readout {
    padding: 0.05rem 0.4rem;
    color: #c79a4a;
    border: 1px solid #6b5320;
    border-radius: 2px;
    letter-spacing: 0.08em;
    font-size: 0.72rem;
  }

  /* The Concordance's voice — diegetic guidance line. A teal terminal readout
     with a blinking caret; the SCP-X help utility addressing the archivist. */
  .concordance {
    display: flex;
    gap: 0.7rem;
    align-items: baseline;
    margin-bottom: 1.25rem;
    padding: 0.6rem 0.85rem;
    background: #07100f;
    border: 1px solid #15302c;
    border-left: 3px solid var(--slot-propagated-fg, #3dd6c4);
    border-radius: 3px;
    font-size: 0.8rem;
    line-height: 1.5;
  }
  .concordance .speaker {
    flex: 0 0 auto;
    color: var(--slot-propagated-fg, #3dd6c4);
    font-weight: 600;
    letter-spacing: 0.08em;
    padding-top: 0.05rem;
  }
  .concordance-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }
  .concordance .exposition {
    margin: 0;
    color: #8fb8b1;
    opacity: 0;
    animation: line-in 0.45s ease-out forwards;
    animation-delay: calc(var(--i, 0) * 0.5s);
  }
  .concordance .prompt {
    margin: 0;
    color: #cfe6e1;
    font-weight: 500;
  }
  .concordance .prompt::after {
    content: '▋';
    margin-left: 0.2ch;
    color: var(--slot-propagated-fg, #3dd6c4);
    animation: caret-blink 1.1s steps(1) infinite;
  }
  .concordance.work {
    border-left-color: var(--slot-inserted-fg, #e8a33d);
  }
  .concordance.work .speaker {
    color: var(--slot-inserted-fg, #e8a33d);
  }
  .concordance.work .prompt::after {
    color: var(--slot-inserted-fg, #e8a33d);
  }
  @keyframes caret-blink {
    0%, 50% { opacity: 1; }
    50.01%, 100% { opacity: 0; }
  }
  @keyframes line-in {
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .concordance .exposition {
      opacity: 1;
      animation: none;
    }
  }
  /* Exposure readout, tinted by pressure toward the breach line. */
  .exposure {
    padding: 0.08rem 0.45rem;
    border: 1px solid #2f4a3a;
    border-radius: 2px;
    letter-spacing: 0.06em;
    color: #6fae86;
    transition: color 0.2s, border-color 0.2s;
  }
  .exposure::before {
    content: 'EXPOSURE ';
    opacity: 0.6;
  }
  .exposure.warn {
    color: #c79a4a;
    border-color: #6b5320;
  }
  .exposure.danger {
    color: #e08a3d;
    border-color: #8a5420;
  }
  .exposure.breach {
    color: var(--slot-contradiction-fg, #e85d5d);
    border-color: var(--slot-contradiction-fg, #e85d5d);
    animation: caret-blink 0.8s steps(1) infinite;
  }

  /* Session-resolution overlay. */
  .end-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(4, 6, 8, 0.86);
    backdrop-filter: blur(2px);
    animation: end-in 0.5s ease-out;
  }
  .end-card {
    max-width: 34rem;
    background: #08120f;
    border: 1px solid #1c4a3c;
    border-radius: 5px;
    padding: 1.6rem 1.7rem;
    box-shadow: 0 0 0 1px #0c1c1a, 0 16px 60px rgba(0, 0, 0, 0.6);
  }
  .end-overlay.breach .end-card {
    background: #150808;
    border-color: #6b2424;
  }
  .end-stamp {
    display: inline-block;
    margin-bottom: 1.1rem;
    padding: 0.2rem 0.6rem;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    border: 1px solid;
    border-radius: 2px;
  }
  .end-stamp.contained {
    color: var(--slot-revealed-fg, #8ad0a0);
    border-color: #2f6a44;
  }
  .end-stamp.breach {
    color: var(--slot-contradiction-fg, #e85d5d);
    border-color: #8a2c2c;
  }
  .end-line {
    margin: 0 0 0.9rem;
    line-height: 1.6;
    color: #c4d4ce;
    font-size: 0.88rem;
  }
  .end-line .speaker {
    color: var(--slot-propagated-fg, #3dd6c4);
    font-weight: 600;
    letter-spacing: 0.08em;
    margin-right: 0.55rem;
  }
  .end-overlay.breach .end-line .speaker {
    color: var(--slot-contradiction-fg, #e85d5d);
  }
  .end-sub {
    margin: 0 0 1.4rem;
    line-height: 1.55;
    color: #7d8a86;
    font-size: 0.8rem;
  }
  .end-restart {
    padding: 0.5rem 1.1rem;
    background: linear-gradient(#10302b, #0a201d);
    color: #8fe6da;
    border: 1px solid var(--slot-propagated-fg, #3dd6c4);
    border-radius: 3px;
    font: inherit;
    font-size: 0.82rem;
    letter-spacing: 0.06em;
    cursor: pointer;
  }
  .end-overlay.breach .end-restart {
    background: linear-gradient(#301010, #200a0a);
    color: #e89a9a;
    border-color: #8a2c2c;
  }
  .end-restart:hover {
    filter: brightness(1.2);
  }
  @keyframes end-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  /* The audit is the payoff gesture — a prominent action, not a corner menu. */
  .audit-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  .audit {
    padding: 0.5rem 1rem;
    background: linear-gradient(#1d2127, #14171c);
    color: #d8c08a;
    border: 1px solid #5a4a22;
    border-radius: 3px;
    font: inherit;
    font-size: 0.82rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
  }
  .audit:hover:not(:disabled) {
    background: linear-gradient(#262a31, #1a1e24);
    border-color: #8a7234;
    color: #f0d89a;
  }
  .audit:disabled {
    color: #5b636e;
    border-color: #2a2f36;
    cursor: default;
  }
  .audit-result {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    animation: audit-flash 0.5s ease-out;
  }
  .audit-result .stamp {
    padding: 0.05rem 0.4rem;
    border: 1px solid #2a2f36;
    border-radius: 2px;
    color: #8a93a0;
    letter-spacing: 0.08em;
  }
  .audit-result.flagged .stamp {
    border-color: var(--slot-contradiction-fg, #e85d5d);
    color: var(--slot-contradiction-fg, #e85d5d);
  }
  .audit-result .disc {
    color: var(--slot-contradiction-fg, #e85d5d);
    font-weight: 600;
  }
  .audit-result .conf {
    color: var(--slot-revealed-fg, #8ad0a0);
  }
  .audit-result .spike {
    color: #e08a3d;
    font-weight: 600;
  }
  .audit-result .blank {
    color: #6b7280;
  }
  @keyframes audit-flash {
    0% {
      opacity: 0;
      transform: translateX(-6px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .windows {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Boot/exposition screen — a centered terminal panel where the Concordance
     introduces itself before any records load. */
  main.boot {
    max-width: 40rem;
    min-height: 70vh;
    display: flex;
    align-items: center;
  }
  .boot-frame {
    width: 100%;
    background: #07100f;
    border: 1px solid #15302c;
    border-radius: 4px;
    padding: 1.5rem 1.6rem;
    box-shadow: 0 0 0 1px #0c1c1a, 0 8px 40px rgba(0, 0, 0, 0.5);
  }
  .boot-head {
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    color: #4d6a64;
    border-bottom: 1px solid #15302c;
    padding-bottom: 0.7rem;
    margin-bottom: 1.1rem;
  }
  .boot-body {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-bottom: 1.5rem;
  }
  .boot-line {
    margin: 0;
    line-height: 1.55;
    color: #a6cfc8;
    font-size: 0.86rem;
    opacity: 0;
    animation: line-in 0.5s ease-out forwards;
    animation-delay: calc(var(--i, 0) * 0.7s);
  }
  .boot-line .speaker {
    color: var(--slot-propagated-fg, #3dd6c4);
    font-weight: 600;
    letter-spacing: 0.08em;
    margin-right: 0.6rem;
  }
  .boot-begin {
    padding: 0.55rem 1.1rem;
    background: linear-gradient(#10302b, #0a201d);
    color: #8fe6da;
    border: 1px solid var(--slot-propagated-fg, #3dd6c4);
    border-radius: 3px;
    font: inherit;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    /* appear after the exposition lines have animated in */
    opacity: 0;
    animation: line-in 0.5s ease-out forwards;
    animation-delay: 2.8s;
  }
  .boot-begin:hover {
    background: linear-gradient(#164039, #0d2a25);
    color: #b6f3ea;
  }
  @media (prefers-reduced-motion: reduce) {
    .boot-line,
    .boot-begin {
      opacity: 1;
      animation: none;
    }
  }
</style>
