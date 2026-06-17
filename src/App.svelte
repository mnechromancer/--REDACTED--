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
  import { session, beginSession, resetSession } from './lib/session.svelte.ts';
  import AmberTerminal from './components/AmberTerminal.svelte';
  import QuippyPanel from './components/QuippyPanel.svelte';
  import EndState from './components/EndState.svelte';
  import corpusData from '../static/corpus.json';

  loadCorpus(corpusData as Corpus);
  resetSession(); // fresh run: back to the bootup screen, Quippy not yet met

  // v2 reset (decision D): no clearance. The citation graph is the only gate —
  // seed the opening file; reachability opens the rest by following its xrefs.
  // The teaching pair: seed 001 (the intake hub); 001 → 002 via xref.
  seedReach('SCP-41B-001');

  // The bootup exposition (Phase 2, reset_amber_v2.md §3.1) — AMBER's own clinical,
  // institutional voice, stating the SOURCE-LESS PREMISE as the job: the originals
  // are gone; the only route back is triangulation across what cross-references
  // survive. AMBER NEVER names Quippy here (§0.2 — it behaves as if it keeps
  // forgetting Quippy exists; Quippy's arrival is uninvited, §3.3). No tutorial
  // overlay — the verb is learned by doing it on the first record, which narrates it.
  const bootLines = [
    'AMBER — Archive Management & Batch Entry Resource. Records annex Site-41B, deep archive. Cold storage. Terminal active.',
    'Archivist post, low clearance. You hold the cross-reference catalogue. You do not hold the records it indexes — those originals were lost in the Transfer and were never recovered. What survives is the web of references the catalogue threaded between them while they still existed.',
    'A withheld field reads as a redaction bar. There is no original to fetch it from. AMBER reconstructs a struck word the only way left: by triangulation — the same matter is named, in the clear, on some other record that cross-references this one. Follow the reference, find the word where it still stands, and cite it. AMBER checks the citation and commits. An uncited or unsupported value is refused.',
    'Most fields cannot be reached yet — the references that would ground them run through records you have not opened. Each word you recover opens the references that depend on it, and the next field becomes reachable. The catalogue is reconstructed one citation at a time, in the order the surviving references allow.',
  ];

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

  // Esc always dismisses Quippy — refusal is one keystroke away (§7.3).
  function onWindowKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && ui.mode === 'quippy') {
      e.preventDefault();
      dismissQuippy();
    }
  }
</script>

<svelte:window onkeydown={onWindowKey} />

{#if session.booting}
  <main class="boot">
    <div class="boot-frame">
      <div class="boot-head">AMBER · ARCHIVE MANAGEMENT &amp; BATCH ENTRY RESOURCE</div>
      <div class="boot-body">
        {#each bootLines as line, i (i)}
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

  <!-- Quippy overlay: visible only in mode 'quippy', sitting over AMBER. The
       first-contact introduction (vs the recurring greeting) is chosen inside the
       panel from ui.quippyReason, set on its uninvited entrance (§3.3). -->
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
