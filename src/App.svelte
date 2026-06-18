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
  import { ui, dismissQuippy, clearAllBuffers } from './lib/ui.svelte.ts';
  import { session, beginSession, resetSession } from './lib/session.svelte.ts';
  import AmberTerminal from './components/AmberTerminal.svelte';
  import QuippyPanel from './components/QuippyPanel.svelte';
  import EndState from './components/EndState.svelte';
  import corpusData from '../static/corpus.json';

  loadCorpus(corpusData as Corpus);
  resetSession(); // fresh run: back to the bootup screen, Quippy not yet met
  clearAllBuffers(); // fresh run: no forged citations carried over

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
  // The bootup reads as a real terminal POST: short diagnostic lines scroll in one
  // at a time (left-aligned, monospace, a boot LOG — not a centered card), then a
  // terse operator briefing states the source-less premise. Each line is a {tone}:
  //   'post'   — system diagnostic ([ OK ]-style), the machine talking to itself
  //   'brief'  — the operator briefing, AMBER addressing the archivist
  //   'prompt' — the final hand-over line before BEGIN
  // Onboarding is kept SHORT (user: "slow introductions are good" — so the lines
  // reveal slowly, but there are FEWER of them; the verb is learned by doing it on
  // the first record). AMBER never names Quippy here (§0.2).
  type BootTone = 'post' | 'warn' | 'brief' | 'prompt';
  const bootLines: { tone: BootTone; text: string }[] = [
    { tone: 'post', text: 'AMBER  ARCHIVE MANAGEMENT & BATCH ENTRY RESOURCE   rev 4.1' },
    { tone: 'post', text: 'SITE-41B DEEP-RECORDS ANNEX · COLD STORAGE · CATALOGUE MAINFRAME' },
    { tone: 'post', text: '[ OK ]  catalogue index ......... mounted' },
    { tone: 'post', text: '[ OK ]  cross-reference graph ... threaded' },
    { tone: 'warn', text: '[WARN]  source records ......... NOT FOUND (lost: Transfer)' },
    { tone: 'post', text: '[ OK ]  archivist terminal ...... active   clearance LOW' },
    { tone: 'brief', text: 'Operator. You hold the catalogue, not the records it indexed — those originals were lost in the Transfer and never recovered. What survives is the web of references between them.' },
    { tone: 'brief', text: 'A struck field has no original to fetch. Reconstruct it by triangulation: the same matter is named, in the clear, on some other record that points here. Find the word, cite where it stands, commit. Uncited values are refused.' },
    { tone: 'prompt', text: 'Most fields are out of reach until you open what grounds them. Recover one word and the next becomes reachable. Begin your shift.' },
  ];

  // Per-line reveal cadence (seconds). POST lines tick fast (a machine booting);
  // the briefing breathes (slow introductions). BEGIN appears after the last line.
  const LINE_DELAY = 0.55;
  const bootDuration = bootLines.length * LINE_DELAY;

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
  <main class="boot crt-scan">
    <div class="boot-screen">
      <div class="boot-body">
        {#each bootLines as line, i (i)}
          <p class="boot-line {line.tone}" style="--i: {i}; --d: {LINE_DELAY}s">{line.text}</p>
        {/each}
        <p class="boot-cursor" style="--i: {bootLines.length}; --d: {LINE_DELAY}s">
          <span class="caret">█</span>
        </p>
      </div>
      <button class="boot-begin" style="--appear: {bootDuration}s" onclick={beginSession}>▶ BEGIN SHIFT</button>
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
    background: #040302;
    color: var(--amber-fg-dim, #8a6a2c);
    font-family: var(--amber-font, ui-monospace), "SFMono-Regular", Menlo, monospace;
  }
  main {
    max-width: 72rem;
    margin: 0 auto;
    padding: 1.2rem 1rem 4rem;
  }

  /* Boot/exposition screen — a left-aligned terminal POST sequence, not a centered
     card. Lines scroll in one at a time like a machine booting; the briefing follows;
     BEGIN appears only after. Full-bleed amber console field. */
  main.boot {
    max-width: 60rem;
    min-height: 88vh;
    margin: 0 auto;
    padding: 1.4rem 1.2rem;
    display: flex;
    font-family: var(--amber-font, ui-monospace), monospace;
  }
  .boot-screen {
    width: 100%;
    background: var(--amber-bg, #0a0805);
    border: 1px solid var(--amber-edge, #3a2c12);
    border-left: 2px solid var(--amber-edge-bright, #6a5220);
    padding: 1.4rem 1.5rem 1.2rem;
    box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.55), 0 0 0 1px #000, 0 8px 40px rgba(0, 0, 0, 0.6);
  }
  .boot-body { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.4rem; }
  .boot-line {
    margin: 0;
    line-height: 1.45;
    color: var(--amber-fg, #e8b24d);
    /* VT323 runs small/tall — bump the boot text so it reads at terminal scale. */
    font-size: 1.18rem;
    letter-spacing: 0.01em;
    opacity: 0;
    animation: boot-in 0.18s steps(2) forwards; /* a hard, machine-ish reveal */
    animation-delay: calc(var(--i, 0) * var(--d, 0.55s));
  }
  /* POST diagnostic lines read as system output; the briefing is brighter prose. */
  .boot-line.post { color: var(--amber-fg-dim, #8a6a2c); }
  .boot-line.warn { color: var(--amber-red, #e85d5d); }
  .boot-line.brief { color: var(--amber-fg, #e8b24d); margin-top: 0.5rem; line-height: 1.5; }
  .boot-line.prompt { color: #ffd27a; margin-top: 0.5rem; }
  .boot-cursor {
    margin: 0.2rem 0 0;
    opacity: 0;
    animation: boot-in 0.18s steps(2) forwards;
    animation-delay: calc(var(--i, 0) * var(--d, 0.55s));
  }
  .boot-cursor .caret {
    color: var(--amber-fg, #e8b24d);
    animation: caret-blink 1s steps(1) infinite;
  }
  .boot-begin {
    padding: 0.5rem 1.1rem;
    background: var(--amber-bg-raised, #100b06);
    color: var(--amber-fg, #e8b24d);
    border: 1px solid var(--amber-edge-bright, #6a5220);
    font-family: inherit;
    font-size: 1.15rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    text-transform: uppercase;
    opacity: 0;
    animation: boot-in 0.3s ease-out forwards;
    animation-delay: var(--appear, 3s);
  }
  .boot-begin:hover { border-color: var(--amber-fg, #e8b24d); color: #ffd27a; box-shadow: 0 0 14px var(--amber-glow, rgba(232,178,77,0.16)); }
  @keyframes boot-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes caret-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .boot-line, .boot-begin, .boot-cursor { opacity: 1; animation: none; }
    .boot-cursor .caret { animation: none; }
  }
</style>
