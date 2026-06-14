<script lang="ts">
  // Top-level composition (re-frame §7.2): hosts the two interface modes — AMBER
  // (the CLI, the resting state) and Quippy (the refusable GUI overlay) — and the
  // boot/onboarding flow. The obsolete win-overlay is gone; the ending now reads
  // provenance (Step 6, EndState). AMBER is where the player lives; Quippy sits
  // over it and is always one keystroke away from dismissal.
  import './styles/tokens.css';
  import type { Corpus } from './lib/corpus.ts';
  import {
    corpus,
    clearance,
    loadCorpus,
    raiseClearance,
    auditSummary,
    boardState,
  } from './lib/game.svelte.ts';
  import { ui, dismissQuippy, log } from './lib/ui.svelte.ts';
  import {
    progression,
    SCRIPT,
    UNLOCK_ORDER,
    unlockedFiles,
    beginSession,
    advanceProgression,
  } from './lib/progression.svelte.ts';
  import { logAudit } from './lib/ripples.svelte.ts';
  import AmberTerminal from './components/AmberTerminal.svelte';
  import QuippyPanel from './components/QuippyPanel.svelte';
  import corpusData from '../static/corpus.json';

  loadCorpus(corpusData as Corpus);

  // Start at L2: every file opens, and every guessable trio slot sits at
  // redaction_level ≥ 3, so nothing is auto-revealed at the starting tier.
  raiseClearance(2);

  const board = $derived(boardState());

  // Only the files the onboarding has unlocked are shown, in unlock order.
  const visibleFiles = $derived.by(() => {
    const ok = unlockedFiles(progression.step);
    return UNLOCK_ORDER.filter((id) => ok.has(id) && corpus[id]).map((id) => corpus[id]);
  });
  const visibleOrder = $derived(visibleFiles.map((f) => f.item));

  // Advance the onboarding whenever the board changes (insert, audit, propagation).
  $effect(() => {
    void board.filled;
    void board.reconciled;
    void board.propagated;
    advanceProgression();
  });

  const MAX_TIER = 5;
  const nextTier = $derived(Math.min(MAX_TIER, clearance.tier + 1) as 1 | 2 | 3 | 4 | 5);
  const canAudit = $derived(clearance.tier < MAX_TIER && progression.step !== 'boot');

  function runAudit() {
    if (!canAudit) return;
    const batch = raiseClearance(nextTier);
    const s = auditSummary(batch);
    logAudit(clearance.tier, s.discrepancies.length, s.confirmed.length);
    const parts: string[] = [];
    if (s.discrepancies.length) parts.push(`${s.discrepancies.length} struck`);
    if (s.confirmed.length) parts.push(`${s.confirmed.length} confirmed`);
    if (s.blanks.length) parts.push(`${s.blanks.length} unfilled`);
    log(
      `audit → L${clearance.tier}${parts.length ? ': ' + parts.join(', ') : ': nothing to reconcile'}`,
      s.discrepancies.length ? 'reject' : 'ok',
    );
  }

  const script = $derived(SCRIPT[progression.step]);

  // Esc always dismisses Quippy — refusal is one keystroke away (§7.3).
  function onWindowKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && ui.mode === 'quippy') {
      e.preventDefault();
      dismissQuippy();
    }
  }
</script>

<svelte:window onkeydown={onWindowKey} />

{#if progression.step === 'boot'}
  <main class="boot">
    <div class="boot-frame">
      <div class="boot-head">AMBER · ARCHIVE MANAGEMENT &amp; BATCH ENTRY RESOURCE</div>
      <div class="boot-body">
        {#each script.exposition as line, i (i)}
          <p class="boot-line" style="--i: {i}">{line}</p>
        {/each}
      </div>
      <button class="boot-begin" onclick={beginSession}>▶ BEGIN SHIFT</button>
    </div>
  </main>
{:else}
  <main>
    <AmberTerminal
      files={visibleFiles}
      order={visibleOrder}
      onRaise={runAudit}
      canRaise={canAudit}
      {nextTier}
    />
  </main>

  <!-- Quippy overlay: visible only in mode 'quippy', sitting over AMBER. -->
  <QuippyPanel files={visibleFiles} />
{/if}

<style>
  :global(body) {
    margin: 0;
    background: #060708;
    color: #c8ccd2;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  }
  main {
    max-width: 70rem;
    margin: 0 auto;
    padding: 1.2rem 1rem 4rem;
  }

  /* Boot/exposition screen. */
  main.boot { max-width: 40rem; min-height: 70vh; display: flex; align-items: center; }
  .boot-frame {
    width: 100%;
    background: #07090b;
    border: 1px solid #161b20;
    border-radius: 4px;
    padding: 1.5rem 1.6rem;
    box-shadow: 0 0 0 1px #0c1014, 0 8px 40px rgba(0, 0, 0, 0.5);
  }
  .boot-head {
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    color: #4d5a52;
    border-bottom: 1px solid #161b20;
    padding-bottom: 0.7rem;
    margin-bottom: 1.1rem;
  }
  .boot-body { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1.5rem; }
  .boot-line {
    margin: 0;
    line-height: 1.55;
    color: #aeb6bf;
    font-size: 0.86rem;
    opacity: 0;
    animation: line-in 0.5s ease-out forwards;
    animation-delay: calc(var(--i, 0) * 0.7s);
  }
  .boot-begin {
    padding: 0.55rem 1.1rem;
    background: linear-gradient(#1a1410, #120e0a);
    color: #d8c08a;
    border: 1px solid #5a4a22;
    border-radius: 3px;
    font: inherit;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    opacity: 0;
    animation: line-in 0.5s ease-out forwards;
    animation-delay: 2.8s;
  }
  .boot-begin:hover { border-color: #8a7234; color: #f0d89a; }
  @keyframes line-in {
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .boot-line, .boot-begin { opacity: 1; animation: none; }
  }
</style>
