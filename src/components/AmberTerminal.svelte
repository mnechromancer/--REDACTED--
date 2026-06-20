<script lang="ts">
  // The AMBER CLI shell (re-frame §7.2, R§6.6: full keyboard-driven terminal).
  // Owns: the rendered file pane, keybound file/redacted-span traversal, a command
  // input, AMBER's tooling-as-commands (open / next / cite via AmberLookup / raise
  // / search / summon Quippy), and the terminal log. Monochrome, clinical — the
  // honest tool. Quippy is a distinct overlay summoned over this (Step 5); the
  // switch is always one keystroke (the refusable thesis).
  import type { ScpFile } from '../lib/corpus.ts';
  import { corpus, boardState, exposure, breaches, BREACH_THRESHOLD } from '../lib/game.svelte.ts';
  import {
    ui,
    terminal,
    log,
    openFile,
    stepFile,
    stepSpan,
    nextRedacted,
    amberProgress,
    spanLabel,
    summonQuippy,
    forgeCitation,
    currentSelection,
  } from '../lib/ui.svelte.ts';
  import FilePane from './FilePane.svelte';
  import AmberLookup from './AmberLookup.svelte';

  // The caller supplies the files currently on screen (App gates by onboarding),
  // plus the canonical open order for traversal. v2 reset: no clearance/raise —
  // the citation graph is the only gate (decision D).
  let {
    files,
    order,
  }: {
    files: ScpFile[];
    order: readonly string[];
  } = $props();

  const activeFile = $derived(ui.activeFile ? corpus[ui.activeFile] : null);
  const progress = $derived(amberProgress());
  const board = $derived(boardState());

  // ── Exposure-driven corruption (user 2026-06-17) ──────────────────────────
  // Every concession to Quippy ROTS AMBER. Exposure (which rises ONLY from Quippy
  // reliance) drives a visual-corruption intensity on the AMBER chrome — subtle at
  // first, overwhelming near breach. Quippy itself stays clean and pleasing: it is
  // the parasite wrapping AMBER's IO stream, so the rot belongs to AMBER, not to it.
  // A clean no-Quippy run NEVER corrupts (exposure stays 0). `--corrupt` is a 0..1
  // intensity the CSS reads; discrete bands gate the heavier effects.
  const corrupt = $derived(Math.min(1, exposure.value / BREACH_THRESHOLD));
  const corruptBand = $derived(
    breaches.size > 0 ? 'breach' : corrupt >= 0.7 ? 'high' : corrupt >= 0.3 ? 'mid' : corrupt > 0 ? 'low' : 'none',
  );

  // Auto-open the first file the first time any become visible, so the terminal is
  // never empty once the board opens.
  $effect(() => {
    if (!ui.activeFile && order.length > 0 && corpus[order[0]]) openFile(order[0]);
  });

  let command = $state('');

  // Search: a corpus query (subject to corrupt_search breach effects later). For
  // now, list files whose id/body match the term — the terminal's `search`.
  function runSearch(term: string) {
    const q = term.trim().toLowerCase();
    if (!q) return;
    const hits = files.filter(
      (f) => f.item.toLowerCase().includes(q) || f.body.toLowerCase().includes(q),
    );
    if (hits.length === 0) log(`SEARCH "${term}" — 0 records.`, 'system');
    else log(`SEARCH "${term}" — ${hits.length} record(s): ${hits.map((f) => f.item).join(', ')}`, 'system');
  }

  // Forge a citation from the live pane selection onto the active field (the verb's
  // command form; the panel button does the same). Judged at commit, not here.
  function runForge() {
    if (!ui.activeSpan) {
      log('forge: no field selected. step to a redacted field first.', 'reject');
      return;
    }
    if (!currentSelection()) {
      log('forge: no text selected. select the span where the word stands in a record.', 'reject');
      return;
    }
    forgeCitation();
  }

  function runCommand(raw: string) {
    const line = raw.trim();
    if (!line) return;
    log(`amber> ${line}`, 'echo');
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    switch (cmd) {
      case 'open':
      case 'o':
        openFile(arg.toUpperCase().startsWith('SCP') ? arg.toUpperCase() : arg);
        break;
      case 'next':
      case 'n':
        nextRedacted();
        break;
      case 'search':
      case 's':
        runSearch(arg);
        break;
      case 'cite':
      case 'forge':
      case 'c':
        runForge();
        break;
      case 'quippy':
      case 'q':
        summonQuippy();
        break;
      case 'prov':
        ui.showProvenance = !ui.showProvenance;
        log(`PROVENANCE TELL ${ui.showProvenance ? 'ON' : 'OFF'}.`, 'system');
        break;
      case 'help':
      case '?':
        log('COMMANDS — open <file> · next · search <term> · cite · quippy · prov · help', 'system');
        log('KEYS — j/k step field · [ / ] step record · n next redaction · c forge citation · Tab summon Quippy', 'system');
        log('To restore a field: type the word, then SELECT the span where it stands in a record and forge a citation. AMBER judges at commit. Citation costs zero; Quippy charges.', 'system');
        break;
      default:
        log(`E00 — unrecognized command "${cmd}". type help.`, 'reject');
    }
    command = '';
  }

  // Global hotkeys (ignored while typing in the command input or a button).
  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
    if (typing) return;
    switch (e.key) {
      case 'j':
        e.preventDefault(); stepSpan(1); break;
      case 'k':
        e.preventDefault(); stepSpan(-1); break;
      case ']':
        e.preventDefault(); stepFile(order, 1); break;
      case '[':
        e.preventDefault(); stepFile(order, -1); break;
      case 'n':
        e.preventDefault(); nextRedacted(); break;
      case 'c':
        e.preventDefault(); runForge(); break;
      case 'Tab':
        e.preventDefault(); summonQuippy(); break;
      default:
        break;
    }
  }

  // Keep the log scrolled to the newest line.
  let logEl = $state<HTMLDivElement | null>(null);
  $effect(() => {
    void terminal.lines.length;
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
  });
</script>

<svelte:window onkeydown={onKey} />

<section class="amber crt-scan corrupt-{corruptBand}" style="--corrupt: {corrupt}">
  <header class="amber-bar">
    <span class="sys">▌AMBER · ARCHIVE MANAGEMENT &amp; BATCH ENTRY RESOURCE</span>
    <span class="prog">{progress.solved}/{progress.total} RESTORED · {progress.redacted} REDACTED{progress.struck ? ` · ${progress.struck} STRUCK` : ''}</span>
    <span class="via" class:tainted={board.viaQuippy > 0} title="fields filled by Quippy (the no-Quippy win needs zero)">
      Quippy {board.viaQuippy}
    </span>
  </header>

  <div class="amber-grid">
    <div class="main">
      <div class="file-region">
        {#if activeFile}
          <FilePane file={activeFile} />
        {:else}
          <div class="no-file">
            <p>&gt; NO RECORD OPEN.</p>
            <p class="hint">type <code>open SCP-41B-001</code> or press <code>]</code> to traverse the holdings.</p>
          </div>
        {/if}
      </div>

      <div class="cmd">
        <span class="cursor" aria-hidden="true">amber&gt;</span>
        <input
          type="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="open · next · raise · search · quippy · help"
          bind:value={command}
          onkeydown={(e) => {
            if (e.key === 'Enter') runCommand(command);
          }}
        />
        <button class="quippy-btn" type="button" onclick={summonQuippy} title="summon Quippy (Tab)">
          ◇ Quippy
        </button>
      </div>
    </div>

    <aside class="side">
      <div class="lookup-region">
        <AmberLookup />
      </div>

      <div class="actions">
        <span class="hint">cursor: {ui.activeSpan ? spanLabel(ui.activeSpan) : '—'}</span>
      </div>

      <div class="log" bind:this={logEl}>
        {#each terminal.lines as l (l.id)}
          <div class="log-line {l.tone}">{l.text}</div>
        {/each}
        {#if terminal.lines.length === 0}
          <div class="log-line system">AMBER READY. type help.</div>
        {/if}
      </div>
    </aside>
  </div>
</section>

<style>
  .amber {
    position: relative;
    font-family: var(--amber-font);
    /* VT323 runs small/tall — bump the AMBER scale so the whole terminal reads at a
       comfortable terminal size; rem-based child sizes inherit the larger base. */
    font-size: 1.15rem;
    color: var(--amber-fg-dim);
    background: var(--amber-bg);
    padding: 0.55rem;
    border: 1px solid var(--amber-edge);
    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.5), 0 0 0 1px #000;
  }

  /* ── Exposure-driven corruption ───────────────────────────────────────────
     The AMBER chrome ROTS as the player leans on Quippy. `--corrupt` (0..1) scales
     the effect; the corrupt-{band} classes gate the heavier layers. A clean run
     (exposure 0, corrupt-none) shows NONE of this. Quippy's overlay is outside
     .amber, so it stays pristine — the rot is AMBER's alone. */

  /* Low+: a faint chromatic bleed on all AMBER text (a phosphor going out of
     convergence), intensity scaled by --corrupt. */
  .amber.corrupt-low, .amber.corrupt-mid, .amber.corrupt-high, .amber.corrupt-breach {
    text-shadow:
      calc(var(--corrupt, 0) * 1.4px) 0 rgba(232, 90, 120, calc(var(--corrupt, 0) * 0.6)),
      calc(var(--corrupt, 0) * -1.4px) 0 rgba(90, 170, 232, calc(var(--corrupt, 0) * 0.6));
  }
  /* Mid+: the scanline wash thickens and rolls; the whole field flickers faintly. */
  .amber.corrupt-mid, .amber.corrupt-high, .amber.corrupt-breach {
    animation: amber-flicker calc(6s - var(--corrupt, 0) * 4s) steps(1) infinite;
  }
  .amber.corrupt-mid::before, .amber.corrupt-high::before, .amber.corrupt-breach::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0,
      rgba(0, 0, 0, 0) 2px,
      rgba(40, 20, 0, calc(var(--corrupt, 0) * 0.5)) 3px
    );
    animation: scan-roll calc(8s - var(--corrupt, 0) * 6s) linear infinite;
  }
  /* High+: skew/jitter the whole terminal periodically; a harder displacement. */
  .amber.corrupt-high, .amber.corrupt-breach {
    animation: amber-flicker calc(6s - var(--corrupt, 0) * 4s) steps(1) infinite,
               amber-jitter calc(5s - var(--corrupt, 0) * 3s) steps(1) infinite;
  }
  /* Breach: the rot is overwhelming — constant chroma split, heavier roll. */
  .amber.corrupt-breach {
    text-shadow:
      2.5px 0 rgba(232, 60, 90, 0.8),
      -2.5px 0 rgba(60, 150, 232, 0.8),
      0 0 6px rgba(232, 90, 90, 0.4);
  }

  @keyframes amber-flicker {
    0%, 96%, 100% { opacity: 1; }
    97% { opacity: calc(1 - var(--corrupt, 0) * 0.35); }
    98% { opacity: 1; }
    99% { opacity: calc(1 - var(--corrupt, 0) * 0.2); }
  }
  @keyframes scan-roll {
    0% { background-position: 0 0; }
    100% { background-position: 0 100vh; }
  }
  @keyframes amber-jitter {
    0%, 92%, 100% { transform: translate(0, 0) skewX(0); }
    93% { transform: translate(calc(var(--corrupt, 0) * 2px), 0) skewX(calc(var(--corrupt, 0) * -0.4deg)); }
    94% { transform: translate(calc(var(--corrupt, 0) * -2px), 0) skewX(calc(var(--corrupt, 0) * 0.4deg)); }
    95% { transform: translate(0, 0) skewX(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    /* Keep the static chroma bleed (the legible "this is corrupted" signal) but drop
       all motion — no flicker, roll, or jitter. */
    .amber.corrupt-mid, .amber.corrupt-high, .amber.corrupt-breach { animation: none; }
    .amber.corrupt-mid::before, .amber.corrupt-high::before, .amber.corrupt-breach::before { animation: none; }
  }
  .amber-bar {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.45rem 0.7rem;
    background: var(--amber-bg-raised);
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .amber-bar .sys { color: var(--amber-fg); }
  .amber-bar .prog { margin-left: auto; color: var(--amber-fg-dim); }
  .amber-bar .via {
    color: var(--amber-fg-faint);
    border: 1px solid var(--amber-edge);
    padding: 0 0.4ch;
    border-radius: 1px;
  }
  .amber-bar .via.tainted { color: #b88ce6; border-color: #3a2c54; }

  .amber-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 21rem;
    gap: 0.8rem;
    margin-top: 0.7rem;
    align-items: start;
  }
  @media (max-width: 52rem) {
    .amber-grid { grid-template-columns: 1fr; }
  }

  .main { display: flex; flex-direction: column; gap: 0.6rem; min-width: 0; }
  .file-region { min-height: 8rem; }
  .no-file { padding: 1.4rem 1rem; color: var(--amber-fg-dim); border: 1px dashed var(--amber-edge); background: var(--amber-bg-sunken); }
  .no-file .hint { color: var(--amber-fg-faint); font-size: 0.78rem; margin-top: 0.4rem; }
  code {
    background: var(--amber-bg-raised);
    border: 1px solid var(--amber-edge);
    border-radius: 2px;
    padding: 0 0.3ch;
    color: var(--amber-fg);
    font-size: 0.92em;
  }

  /* The command line is primary in the 80s register — a boxed, amber-prompted bar. */
  .cmd {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.7rem;
    background: var(--amber-bg-sunken);
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6);
  }
  .cmd .cursor { color: var(--amber-fg); font-size: 0.85rem; flex: 0 0 auto; letter-spacing: 0.04em; }
  .cmd input {
    flex: 1 1 auto;
    min-width: 0;
    background: transparent;
    border: none;
    color: var(--amber-fg);
    font: inherit;
    font-size: 0.85rem;
    outline: none;
    caret-color: var(--amber-fg);
  }
  .cmd input::placeholder { color: var(--amber-fg-faint); }
  .quippy-btn {
    flex: 0 0 auto;
    background: #0e0a14;
    border: 1px solid #2e2440;
    color: #9d6bd6;
    border-radius: 2px;
    padding: 0.2rem 0.5rem;
    font: inherit;
    font-size: 0.72rem;
    cursor: pointer;
  }
  .quippy-btn:hover { border-color: #4a3a66; color: #b88ce6; }

  .side { display: flex; flex-direction: column; gap: 0.6rem; min-width: 0; }

  .actions { display: flex; flex-direction: column; gap: 0.3rem; }
  .act {
    padding: 0.4rem 0.5rem;
    background: linear-gradient(#1a1410, #120e0a);
    color: #d8c08a;
    border: 1px solid #5a4a22;
    border-radius: 2px;
    font: inherit;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .act:hover:not(:disabled) { border-color: #8a7234; color: #f0d89a; }
  .act:disabled { color: #5b636e; border-color: #2a2f36; cursor: default; }
  .actions .hint { color: #4d5560; font-size: 0.68rem; }

  .log {
    max-height: 16rem;
    overflow-y: auto;
    background: var(--amber-bg-sunken);
    border: 1px solid var(--amber-edge);
    padding: 0.45rem 0.6rem;
    font-size: 0.72rem;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }
  .log-line { overflow-wrap: anywhere; }
  .log-line.system { color: var(--amber-fg-dim); }
  .log-line.echo { color: var(--amber-fg); }
  .log-line.ok { color: var(--amber-green); }
  .log-line.reject { color: var(--amber-red); }
</style>
