<script lang="ts">
  // The AMBER CLI shell (re-frame §7.2, R§6.6: full keyboard-driven terminal).
  // Owns: the rendered file pane, keybound file/redacted-span traversal, a command
  // input, AMBER's tooling-as-commands (open / next / cite via AmberLookup / raise
  // / search / summon Quippy), and the terminal log. Monochrome, clinical — the
  // honest tool. Quippy is a distinct overlay summoned over this (Step 5); the
  // switch is always one keystroke (the refusable thesis).
  import type { ScpFile } from '../lib/corpus.ts';
  import { corpus, boardState, exposure, breaches, collectionOf, BREACH_THRESHOLD } from '../lib/game.svelte.ts';
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
    forgeTarget,
    currentSelection,
    xrefLinksOf,
    endShift,
  } from '../lib/ui.svelte.ts';
  import { session, addNote } from '../lib/session.svelte.ts';
  import { deliveredMail, isRead, markRead, unreadCount, type MailMessage } from '../lib/mail.svelte.ts';
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
  // never empty once the board opens — and print the MOUNT LISTING once (Phase 2
  // playtest fix): the player must learn immediately that there are multiple
  // records and how to move between them.
  let announced = $state(false);
  $effect(() => {
    if (!ui.activeFile && order.length > 0 && corpus[order[0]]) openFile(order[0]);
    if (!announced && files.length > 0) {
      announced = true;
      const inbound = files.filter((f) => collectionOf(f) === 'inbound').map((f) => f.item);
      const shelf = files.filter((f) => collectionOf(f) === 'local').map((f) => f.item);
      log(`MOUNT — consignment, ${inbound.length} record(s): ${inbound.join(' · ')}`, 'system');
      if (shelf.length) log(`SHELF — ${shelf.length} reference volume(s): ${shelf.join(' · ')}`, 'system');
      log('cycle records with ] and [ · open <designation> opens one · next jumps to the next struck field.', 'system');
      if (unreadCount() > 0) log(`MAIL — ${unreadCount()} unread. type mail.`, 'system');
    }
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

  // ── Mail / notes / the shift end (v3 Phase 1) ─────────────────────────────
  // `mail` lists the delivered messages; `mail <n>` opens one FULL-PANE in the file
  // region (Phase 2 playtest fix — the log was an unreadable place to put prose)
  // and marks it read. Any navigation returns to the record. `note <text>` appends
  // to the doomed scratchpad; `note` lists it. `end` runs the 16:00 turnover
  // (ui.endShift): notes, buffers, and the log are erased; transmitted commits
  // survive; the next 04:00 consignment mounts.
  let mailView = $state<MailMessage | null>(null);

  function runMail(arg: string) {
    const box = deliveredMail();
    const a = arg.trim();
    if (!a) {
      if (box.length === 0) {
        log('MAIL — no messages on file.', 'system');
        return;
      }
      log(`MAIL — ${box.length} message(s), ${unreadCount()} unread. \`mail <n>\` to read:`, 'system');
      box.forEach((m, i) => {
        log(`  [${i + 1}]${isRead(m.id) ? '  ' : ' ●'} d${m.day} · ${m.from} — ${m.subject}`, 'system');
      });
      return;
    }
    const idx = parseInt(a, 10) - 1;
    if (!/^\d+$/.test(a) || idx < 0 || idx >= box.length) {
      log(`mail: no message [${a}] (there are ${box.length}).`, 'reject');
      return;
    }
    const m = box[idx];
    markRead(m.id);
    mailView = m;
    log(`MAIL [${idx + 1}] on screen — ${m.subject}. any navigation returns to the record.`, 'system');
  }

  function runNote(arg: string) {
    const a = arg.trim();
    if (!a) {
      if (session.notes.length === 0) {
        log('NOTES — empty. `note <text>` to add a line. Notes do not survive 16:00.', 'system');
        return;
      }
      log(`NOTES — ${session.notes.length} line(s), destroyed at 16:00:`, 'system');
      session.notes.forEach((n, i) => log(`  ${i + 1}. ${n}`, 'echo'));
      return;
    }
    addNote(a);
    log(`noted (${session.notes.length} line(s) — erased at 16:00).`, 'echo');
  }

  // Forge a citation from the live pane selection onto the active field (the verb's
  // command form; the panel button does the same). Judged at commit, not here.
  function runForge() {
    // The target is the WORK SLOT — the field being restored — which survives
    // reading other records (including the shelf, which has no fields of its own).
    if (!forgeTarget()) {
      log('forge: no field held. step to a redacted field first (n / next).', 'reject');
      return;
    }
    if (!currentSelection()) {
      log('forge: no text selected. select the span where the word stands in a record.', 'reject');
      return;
    }
    forgeCitation();
  }

  // Open a record by `open <arg>`. The keyboard traversal verb (the playtest fix —
  // AMBER must be followable without a mouse). `arg` resolves three ways:
  //   - a bare number N → the Nth cross-reference link in the ACTIVE file (what the pane
  //     shows numbered), so a player reads "[2] SCP-41B-104" and types `open 2`;
  //   - any holding's designation, case-insensitive (`open scp-41b-101`, `open ref-03` —
  //     the shelf's REF designations resolve the same way the SCP ids do);
  //   - otherwise, passed through so openFile reports NOT IN ARCHIVE.
  function runOpen(arg: string) {
    const a = arg.trim();
    if (!a) {
      log('open: which record? `open <number>` (a reference in this file), `open SCP-41B-10n`, or `open REF-0n`.', 'reject');
      return;
    }
    // bare number → the Nth cross-reference of the active file
    if (/^\d+$/.test(a)) {
      const links = ui.activeFile ? xrefLinksOf(ui.activeFile) : [];
      const idx = parseInt(a, 10) - 1;
      if (idx < 0 || idx >= links.length) {
        log(`open: no reference [${a}] in this record (it has ${links.length}).`, 'reject');
        return;
      }
      openFile(links[idx]);
      return;
    }
    // a designation — resolve case-insensitively against the catalogue's own keys.
    const up = a.toUpperCase();
    const exact = Object.keys(corpus).find((k) => k.toUpperCase() === up);
    openFile(exact ?? up);
  }

  function runCommand(raw: string) {
    const line = raw.trim();
    if (!line) return;
    log(`amber> ${line}`, 'echo');
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    if (cmd !== 'mail' && cmd !== 'm') mailView = null; // any non-mail command returns to the record
    switch (cmd) {
      case 'open':
      case 'o':
        runOpen(arg);
        break;
      case 'next':
      case 'n':
        // `next` = the next struck FIELD (the default work verb); `next doc` cycles
        // records, same as ] — named because "next" alone read ambiguously in playtest.
        if (/^(doc|file|record)s?$/i.test(arg)) stepFile(order, 1);
        else nextRedacted();
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
      case 'mail':
      case 'm':
        runMail(arg);
        break;
      case 'note':
        runNote(arg);
        break;
      case 'end':
      case 'eod':
        endShift();
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
        log('COMMANDS — open <n|record> · next [doc] · search <term> · cite · mail [n] · note [text] · end · quippy · prov · help', 'system');
        log('  open follows a cross-reference: `open 2` opens reference [2] in this record, or `open SCP-41B-104` / `open REF-03` by designation.', 'system');
        log('  next jumps to this record\'s next struck field; `next doc` cycles to the next record (also ] and [).', 'system');
        log('  mail reads the message file. note keeps a scratchpad (destroyed at 16:00). end runs the turnover: transmitted commits survive; nothing else does.', 'system');
        log('KEYS — j/k step field · [ / ] step record · n next struck field · c forge citation · Tab summon Quippy', 'system');
        log('To restore a field: step to it, type the word, then read any record — the field stays held — SELECT the span where the word stands and forge the citation. AMBER judges at commit. Citation costs zero; Quippy charges.', 'system');
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
    if (e.key === 'Escape' && mailView) {
      e.preventDefault();
      mailView = null;
      return;
    }
    switch (e.key) {
      case 'j':
        e.preventDefault(); mailView = null; stepSpan(1); break;
      case 'k':
        e.preventDefault(); mailView = null; stepSpan(-1); break;
      case ']':
        e.preventDefault(); mailView = null; stepFile(order, 1); break;
      case '[':
        e.preventDefault(); mailView = null; stepFile(order, -1); break;
      case 'n':
        e.preventDefault(); mailView = null; nextRedacted(); break;
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
  <header class="amber-bar mod" style="--d: 0s">
    <span class="sys">▌AMBER · ARCHIVE MANAGEMENT &amp; BATCH ENTRY RESOURCE</span>
    <span class="day" title="the 0400 consignment day — 1600 is the erasure">DAY {session.day}</span>
    <span class="prog">{progress.solved}/{progress.total} RESTORED · {progress.redacted} REDACTED{progress.struck ? ` · ${progress.struck} STRUCK` : ''}</span>
    <span class="via" class:tainted={board.viaQuippy > 0} title="fields filled by Quippy (the no-Quippy win needs zero)">
      Quippy {board.viaQuippy}
    </span>
  </header>

  <div class="amber-grid">
    <div class="main">
      <div class="file-region mod" style="--d: 0.25s">
        {#if mailView}
          <!-- A message reads full-pane, in document register — the log is for status
               lines, not prose (Phase 2 playtest fix). -->
          <section class="mail-pane crt-scan">
            <div class="mail-head">
              <span class="doc-tag">MESSAGE</span>
              <span class="mail-from">{mailView.from}</span>
              <span class="mail-day">DAY {mailView.day}</span>
            </div>
            <p class="mail-subj">{mailView.subject}</p>
            <div class="mail-body">{mailView.body}</div>
            <p class="mail-foot">ESC or any navigation returns to the record.</p>
          </section>
        {:else if activeFile}
          <FilePane file={activeFile} />
        {:else}
          <div class="no-file">
            <p>&gt; NO RECORD OPEN.</p>
            <p class="hint">type <code>mail</code> for your assignment, <code>open SCP-41B-101</code> for the consignment cover, or <code>help</code> for the command list.</p>
          </div>
        {/if}
      </div>

      <div class="cmd mod" style="--d: 0.85s">
        <span class="cursor" aria-hidden="true">amber&gt;</span>
        <input
          type="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="type a command — open · next · cite · search · help"
          bind:value={command}
          onkeydown={(e) => {
            if (e.key === 'Enter') runCommand(command);
          }}
        />
        <button class="quippy-btn" type="button" onclick={summonQuippy} title="summon Quippy (Tab)">
          ◇ Quippy
        </button>
      </div>

      <!-- Persistent command legend — AMBER is keyboard-operated, so the verbs are
           always on screen (the playtest fix: the player should never forget the CLI
           exists). Compact; `help` expands the full list in the log. -->
      <div class="cmd-legend mod" style="--d: 0.95s" aria-label="AMBER commands">
        <span class="leg"><b>open</b> <i>n</i></span>
        <span class="leg"><b>next</b> <i>field</i></span>
        <span class="leg"><b>next doc</b></span>
        <span class="leg"><b>cite</b></span>
        <span class="leg"><b>mail</b></span>
        <span class="leg"><b>help</b></span>
        <span class="leg keys">keys: <i>j/k</i> field · <i>[ ]</i> record · <i>n</i> next field · <i>c</i> cite · <i>Tab</i> Quippy</span>
      </div>
    </div>

    <aside class="side">
      <div class="lookup-region mod" style="--d: 0.45s">
        <AmberLookup />
      </div>

      <div class="actions mod" style="--d: 0.55s">
        <span class="hint">field held: {forgeTarget() ? spanLabel(forgeTarget()!) : '—'}</span>
      </div>

      <div class="log mod" style="--d: 0.65s" bind:this={logEl}>
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

  /* ── Module power-on (Phase 2 playtest ask) ────────────────────────────────
     Each region of the terminal blinks on in sequence when the session starts —
     header, document viewer, Concordance, cursor line, log, command line — a CRT
     warming up one board at a time. Runs once on mount; --d staggers per module. */
  .mod {
    animation: mod-on 0.5s steps(3, end) both;
    animation-delay: var(--d, 0s);
  }
  @keyframes mod-on {
    0%, 35% { opacity: 0; }
    45% { opacity: 1; }
    55% { opacity: 0.25; }
    100% { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mod { animation: none; }
  }

  /* ── The mail pane — a message reads as a document, not as log lines ──────── */
  .mail-pane {
    background: var(--amber-bg-raised, #100b06);
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    padding: 0.9rem 1.2rem 1rem;
  }
  .mail-head {
    display: flex;
    align-items: baseline;
    gap: 0.9rem;
    padding-bottom: 0.45rem;
    margin-bottom: 0.6rem;
    border-bottom: 1px solid var(--amber-edge);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .mail-head .doc-tag { color: var(--amber-fg-faint); border: 1px solid var(--amber-edge); padding: 0 0.5ch; }
  .mail-head .mail-from { color: var(--amber-fg); }
  .mail-head .mail-day { margin-left: auto; color: var(--amber-green); }
  .mail-subj { margin: 0 0 0.7rem; color: #ffd27a; font-size: 1.05rem; letter-spacing: 0.02em; }
  .mail-body {
    white-space: pre-wrap;
    color: var(--amber-fg);
    font-size: 1.06rem;
    line-height: 1.62;
    max-width: 80ch;
  }
  .mail-foot { margin: 0.8rem 0 0; color: var(--amber-fg-faint); font-size: 0.72rem; letter-spacing: 0.05em; }

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
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .amber-bar .sys { color: var(--amber-fg); }
  .amber-bar .day { color: var(--amber-green); border: 1px solid var(--amber-edge); padding: 0 0.4ch; border-radius: 1px; }
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
    grid-template-columns: minmax(0, 1fr) 27rem;
    gap: 0.9rem;
    margin-top: 0.7rem;
    align-items: start;
  }
  @media (max-width: 58rem) {
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
  .cmd .cursor { color: var(--amber-fg); font-size: 0.95rem; flex: 0 0 auto; letter-spacing: 0.04em; }
  .cmd input {
    flex: 1 1 auto;
    min-width: 0;
    background: transparent;
    border: none;
    color: var(--amber-fg);
    font: inherit;
    font-size: 0.95rem;
    outline: none;
    caret-color: var(--amber-fg);
  }
  .cmd input::placeholder { color: var(--amber-fg-faint); }

  /* The always-on command legend — AMBER's keyboard verbs, never off screen. */
  .cmd-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.3rem 1rem;
    padding: 0.35rem 0.7rem;
    margin-top: -0.2rem;
    background: var(--amber-bg-raised);
    border: 1px solid var(--amber-edge);
    border-top: none;
    font-size: 0.74rem;
    letter-spacing: 0.03em;
    color: var(--amber-fg-faint);
  }
  .cmd-legend .leg { color: var(--amber-fg-dim); }
  .cmd-legend .leg b { color: var(--amber-green); font-weight: 400; }
  .cmd-legend .leg i { color: var(--amber-fg-faint); font-style: normal; }
  .cmd-legend .leg.keys { margin-left: auto; color: var(--amber-fg-faint); }
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
    max-height: 24rem;
    overflow-y: auto;
    background: var(--amber-bg-sunken);
    border: 1px solid var(--amber-edge);
    padding: 0.5rem 0.65rem;
    font-size: 0.85rem;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    gap: 0.08rem;
  }
  .log-line { overflow-wrap: anywhere; }
  .log-line.system { color: var(--amber-fg-dim); }
  .log-line.echo { color: var(--amber-fg); }
  .log-line.ok { color: var(--amber-green); }
  .log-line.reject { color: var(--amber-red); }
</style>
