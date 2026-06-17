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
    loadCorpus,
    seedReach,
    reachableFiles,
  } from './lib/game.svelte.ts';
  import { ui, dismissQuippy } from './lib/ui.svelte.ts';
  import { progression, SCRIPT, beginSession } from './lib/progression.svelte.ts';
  import AmberTerminal from './components/AmberTerminal.svelte';
  import QuippyPanel from './components/QuippyPanel.svelte';
  import EndState from './components/EndState.svelte';
  import corpusData from '../static/corpus.json';

  loadCorpus(corpusData as Corpus);

  // v2 reset (decision D): no clearance. The citation graph is the only gate —
  // seed the opening file; reachability opens the rest by following its xrefs.
  // The teaching pair: seed 001 (the intake hub); 001 → 002 via xref.
  seedReach('SCP-41B-001');

  // Visible files = the reachable set (decision D). The old onboarding-unlock gate
  // is retired here: it was circular under the citation graph — 002 only unlocked
  // after a confirmed solve, but solving 001 REQUIRES citing 002 (which was hidden).
  // Reachability is the correct gate; the scripted onboarding is removed in Phase 2.
  const visibleFiles = $derived.by(() => {
    const reached = reachableFiles();
    // stable order: seed first, then the rest by id.
    return Object.values(corpus)
      .filter((f) => reached.has(f.item))
      .sort((a, b) => (a.item === 'SCP-41B-001' ? -1 : b.item === 'SCP-41B-001' ? 1 : a.item.localeCompare(b.item)));
  });
  const visibleOrder = $derived(visibleFiles.map((f) => f.item));

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
    <AmberTerminal files={visibleFiles} order={visibleOrder} />
  </main>

  <!-- Quippy overlay: visible only in mode 'quippy', sitting over AMBER. -->
  <QuippyPanel files={visibleFiles} />

  <!-- The ending, read from provenance: loop-broken (true) or breach. -->
  <EndState />
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
