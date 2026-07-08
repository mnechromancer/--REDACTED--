<script lang="ts">
  // The AMBER CLI shell (re-frame §7.2, R§6.6: full keyboard-driven terminal).
  // Owns: the rendered file pane, keybound file/redacted-span traversal, a command
  // input, AMBER's tooling-as-commands (open / next / cite via AmberLookup; the
  // Phase-3 OS: ls / man / status / log / verify, the concordance xref, the diff
  // pane; summon Quippy), and the terminal log. Monochrome, clinical — the
  // honest tool. Quippy is a distinct overlay summoned over this (Step 5); the
  // switch is always one keystroke (the refusable thesis).
  import type { ScpFile } from '../lib/corpus.ts';
  import { corpus, boardState, exposure, breaches, collectionOf, isReachable, BREACH_THRESHOLD } from '../lib/game.svelte.ts';
  import { concordance, type ConcordanceHit } from '../lib/concordance.ts';
  import { renderedLines } from '../lib/renderedText.ts';
  import { diffRecords, type DiffRow } from '../lib/diffRecords.ts';
  import { manPage, manIndex } from '../lib/manpages.ts';
  import { lsLines, statusLines, ledgerLines, verifyLines } from '../lib/os.ts';
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
    captureSelection,
    xrefLinksOf,
    endShift,
    prepare,
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
      log('cycle records with ] and [ · open <designation> opens one · next jumps to the next outstanding field.', 'system');
      if (unreadCount() > 0) log(`MAIL — ${unreadCount()} unread. type mail.`, 'system');
    }
  });

  let command = $state('');

  // The concordance — one verb, two arities (decisions P3-3/P3-4). `xref <word>`
  // lists numbered hits across the reachable RENDERED corpus (concordance.ts —
  // exactly the spans the commit gate would accept, never a hidden word);
  // `xref <n>` while a list is live opens hit n AND forges its snippet straight
  // into the citation workspace — direct-forge because the pane's selectionchange
  // listener would clobber a programmatic live selection; the workspace pouch is
  // stable (P3-3). The old raw-body `search` is retired (P3-4): grep/search/s all
  // alias here — the concordance is the one honest search.
  // Plain (non-$state) — the list drives no rendering, only later `xref <n>` calls.
  let xrefHits: ConcordanceHit[] = [];

  /** How many hits print before the listing folds into `… +n more`. */
  const XREF_DISPLAY_CAP = 12;

  /**
   * Display-shorten a snippet for the log. The STORED hit keeps the full span —
   * display truncation must never change what gets forged; only what prints.
   */
  function displaySnippet(s: string, max = 72): string {
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function runXref(arg: string) {
    const a = arg.trim();
    if (!a) {
      log('xref: which word? `xref <word>` lists occurrences; `xref <n>` opens hit n.', 'reject');
      return;
    }
    // A bare integer while a hit list is live is a jump; with no list it falls
    // through and searches the literal (the player may well want a number found).
    if (/^\d+$/.test(a) && xrefHits.length > 0) {
      const idx = parseInt(a, 10) - 1;
      if (idx < 0 || idx >= xrefHits.length) {
        log(`xref: no hit [${a}] (the list holds ${xrefHits.length}).`, 'reject');
        return;
      }
      const hit = xrefHits[idx];
      if (!openFile(hit.item)) return; // the day may have turned over since the list was built
      // Stale-listing guard (review note): the overlay can change a rendered line
      // between the listing and the jump (a solve, a fill). A snippet that no longer
      // stands in the record must not be staked — a citation's text is real prose the
      // record contains, byte for byte (P3-9). Reject and ask for a fresh listing.
      if (!renderedLines(hit.item)[hit.line - 1]?.includes(hit.snippet)) {
        xrefHits = [];
        log('xref: the record has changed since this listing — run xref again.', 'reject');
        return;
      }
      captureSelection(hit.item, hit.snippet); // exact rendered prose (P3-9) — forgeable as-is
      forgeCitation(); // dedups; auto-selects toward a prepared field
      log(`XREF [${idx + 1}] — ${hit.item}:${hit.line} on screen, span staked.`, 'system');
      return;
    }
    const hits = concordance(a);
    xrefHits = hits;
    if (hits.length === 0) {
      log(`XREF "${a}" — 0 occurrences in reachable records.`, 'system');
      return;
    }
    log(`XREF "${a}" — ${hits.length} occurrence(s). \`xref <n>\` opens hit n and stakes its span:`, 'system');
    hits.slice(0, XREF_DISPLAY_CAP).forEach((h, i) => {
      log(`  [${i + 1}] ${h.item}:${h.line} 「${displaySnippet(h.snippet)}」`, 'system');
    });
    if (hits.length > XREF_DISPLAY_CAP) log(`  … +${hits.length - XREF_DISPLAY_CAP} more`, 'system');
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

  // Forge a citation from the live pane selection into the citation workspace (the
  // verb's command form; the panel button does the same). Forging is target-free —
  // it stakes into the workspace, not a field — so only a live selection is needed;
  // which field the citation counts toward is decided later, by prepare/initiate.
  // Judged at commit, not here.
  function runForge() {
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
    // a designation — resolve case-insensitively; unresolved passes through
    // uppercased so openFile reports it in AMBER's register.
    openFile(resolveDesignation(a) ?? a.toUpperCase());
  }

  // Resolve a designation case-insensitively against the catalogue's own keys —
  // factored out of `open` so `diff` resolves its operands by the identical rule
  // (one resolution rule, two verbs). Undefined = no such holding.
  function resolveDesignation(arg: string): string | undefined {
    const up = arg.toUpperCase();
    return Object.keys(corpus).find((k) => k.toUpperCase() === up);
  }

  // `diff <a> <b>` — the side-by-side comparison (S2's engine; P3-10's presentation:
  // it renders FULL-PANE in the file region the way mail does, and ESC or any
  // non-diff command returns to the record). Mutually exclusive with mailView —
  // setting either clears the other. Reachability is the day gate: a record no
  // consignment has delivered cannot be compared, so an unmounted operand reports
  // NOT IN ARCHIVE rather than leaking that the record exists to be read.
  let diffView = $state<{ a: string; b: string; rows: DiffRow[] } | null>(null);

  function runDiff(arg: string) {
    const parts = arg.trim().split(/\s+/).filter(Boolean);
    if (parts.length !== 2) {
      log('diff: which records? `diff <a> <b>` compares two by designation.', 'reject');
      return;
    }
    const ids: string[] = [];
    for (const p of parts) {
      const id = resolveDesignation(p);
      if (!id) {
        log(`diff: no such record ${p.toUpperCase()}.`, 'reject');
        return;
      }
      if (!isReachable(id)) {
        log(`diff: ${id} — NOT IN ARCHIVE. a record no consignment has delivered cannot be compared.`, 'reject');
        return;
      }
      ids.push(id);
    }
    // Operands validated above, so diffRecords cannot throw here.
    diffView = { a: ids[0], b: ids[1], rows: diffRecords(ids[0], ids[1]) };
    log(`DIFF ${ids[0]} · ${ids[1]} on screen — differences marked. ESC or any navigation returns to the record.`, 'system');
  }

  function runCommand(raw: string) {
    const line = raw.trim();
    if (!line) return;
    log(`amber> ${line}`, 'echo');
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(' ');
    if (cmd !== 'mail' && cmd !== 'm') mailView = null; // any non-mail command returns to the record
    if (cmd !== 'diff') diffView = null; // the diff pane clears the same way (mutually exclusive with mail)
    switch (cmd) {
      case 'open':
      case 'o':
        runOpen(arg);
        break;
      case 'next':
      case 'n':
        // `next` = the next OUTSTANDING field (the default work verb; "struck" now
        // means a wrong fill — the P3-5 vocabulary — so the redacted sense renames);
        // `next doc` cycles
        // records, same as ] — named because "next" alone read ambiguously in playtest.
        if (/^(doc|file|record)s?$/i.test(arg)) stepFile(order, 1);
        else nextRedacted();
        break;
      case 'xref':
      case 'grep':
      case 'search':
      case 's':
        runXref(arg);
        break;
      case 'diff':
        runDiff(arg);
        break;
      case 'ls': {
        // The mount listing (story S4's readout; os.ts builds the lines).
        const a = arg.trim().toLowerCase();
        if (a && a !== 'batch' && a !== 'shelf') {
          log('ls: unknown section. `ls`, `ls batch`, or `ls shelf`.', 'reject');
          break;
        }
        for (const line of lsLines((a || undefined) as 'batch' | 'shelf' | undefined)) log(line, 'system');
        break;
      }
      case 'man': {
        // AMBER's self-documentation. `man quippy` → no entry, same as any unknown
        // command (decision P3-8) — AMBER has no record of it; manPage returns null.
        const a = arg.trim();
        if (!a) {
          log(`MAN — pages on file: ${manIndex().join(' · ')}`, 'system');
          break;
        }
        const page = manPage(a);
        if (!page) {
          log(`man: no entry for "${a}".`, 'reject');
          break;
        }
        for (const line of page) log(line, 'system');
        break;
      }
      case 'status':
        for (const line of statusLines()) log(line, 'system');
        break;
      case 'log':
        for (const line of ledgerLines()) log(line, 'system');
        break;
      case 'verify':
        for (const line of verifyLines()) log(line, 'system');
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
        xrefHits = []; // the hit list is work-product — it does not survive the turnover
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
        // The one-screen summary; `man <cmd>` holds the depth (story S3). Register
        // rule (P3-8/P3-11): no AMBER string names the intruder — its verb still
        // dispatches below, undocumented (AMBER has no record of it); the violet
        // button is the entity's own chrome and carries its own discoverability.
        log('COMMANDS — open <n|record> · next [doc] · cite · xref <word|n> · diff <a> <b> · ls [batch|shelf] · status · log · verify · mail [n] · note [text] · end · prov · man [cmd] · help', 'system');
        log('  man <cmd> holds the page for each command. bare man lists the pages on file.', 'system');
        log('  xref lists every reachable record carrying a word; xref <n> opens hit n and stakes its span. diff renders two records side by side.', 'system');
        log('  ls lists the holdings. status reports the day. log is the reconstruction ledger. verify is transmittal QC.', 'system');
        log('KEYS — j/k step field · [ / ] step record · n next outstanding field · c forge citation', 'system');
        log('To restore a field: PREPARE UNREDACTION on it, then read anywhere and forge citations — the prepared field is pinned and cannot be knocked loose by browsing. Select which citations ground it, type the word, INITIATE. AMBER judges at commit. A cited commit costs nothing.', 'system');
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
    // ESC and any navigation dismiss whichever full-pane view (mail or diff) is up
    // and return to the record — the two panes share one dismissal contract.
    if (e.key === 'Escape' && (mailView || diffView)) {
      e.preventDefault();
      mailView = null;
      diffView = null;
      return;
    }
    switch (e.key) {
      case 'j':
        e.preventDefault(); mailView = null; diffView = null; stepSpan(1); break;
      case 'k':
        e.preventDefault(); mailView = null; diffView = null; stepSpan(-1); break;
      case ']':
        e.preventDefault(); mailView = null; diffView = null; stepFile(order, 1); break;
      case '[':
        e.preventDefault(); mailView = null; diffView = null; stepFile(order, -1); break;
      case 'n':
        e.preventDefault(); mailView = null; diffView = null; nextRedacted(); break;
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
    <!-- The reliance counter in AMBER's own vocabulary (P3-6/P3-11): entries with no
         citation on file. AMBER has no record of what filled them — the ledger's
         missing paperwork, tallied. The violet tint keeps the visual association. -->
    <span class="via" class:tainted={board.viaQuippy > 0} title="fields restored with no citation on file (a clean transmittal record has zero)">
      UNCITED {board.viaQuippy}
    </span>
  </header>

  <div class="amber-grid">
    <div class="main">
      <!-- The document pane: at most half the page (playtest fix — it was crowding
           out the Concordance). Everything the player READS lives here. -->
      <div class="file-region mod" style="--d: 0.3s">
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
        {:else if diffView}
          <!-- The diff pane: two records side by side, full-pane in document register
               the way mail renders (P3-10). Rows arrive pre-aligned from diffRecords;
               a null side is a blank cell; a changed row is marked in the amber
               register. Redacted fields arrive as bars — a diff never leaks a truth. -->
          <section class="diff-pane crt-scan">
            <div class="diff-head">
              <span class="diff-col"><span class="doc-tag">DIFF</span> <span class="diff-name">{diffView.a}</span></span>
              <span class="diff-col"><span class="diff-name">{diffView.b}</span></span>
            </div>
            <div class="diff-rows">
              {#each diffView.rows as row, i (i)}
                <div class="diff-row" class:changed={!row.same}>
                  <div class="diff-cell">{row.left ?? ''}</div>
                  <div class="diff-cell">{row.right ?? ''}</div>
                </div>
              {/each}
            </div>
            <p class="diff-foot">ESC or any navigation returns to the record.</p>
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
    </div>

    <!-- The Concordance column: the forged-citation tooling plus the cursor readout,
         given equal weight to the document rather than squeezed into a narrow rail
         (playtest fix). -->
    <aside class="side">
      <div class="lookup-region mod" style="--d: 0.6s">
        <AmberLookup />
      </div>

      <div class="actions mod" style="--d: 0.9s">
        {#if prepare.ref}
          <span class="hint">prepared: {spanLabel(prepare.ref)}</span>
        {:else}
          <span class="hint">field held: {forgeTarget() ? spanLabel(forgeTarget()!) : '—'}</span>
        {/if}
      </div>
    </aside>
  </div>

  <!-- The console: the terminal log and the command line as ONE unit — scrollback
       sitting directly over the prompt, sharing a border with no seam (playtest fix:
       the output module read as disconnected from the CLI it belongs to). The legend
       attaches beneath as part of the same block. -->
  <div class="console">
    <div class="log mod" style="--d: 1.2s" bind:this={logEl}>
      {#each terminal.lines as l (l.id)}
        <div class="log-line {l.tone}">{l.text}</div>
      {/each}
      {#if terminal.lines.length === 0}
        <div class="log-line system">AMBER READY. type help.</div>
      {/if}
    </div>

    <div class="cmd mod" style="--d: 1.5s">
      <span class="cursor" aria-hidden="true">amber&gt;</span>
      <input
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="type a command — open · next · cite · xref · diff · man · help"
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
    <div class="cmd-legend mod" style="--d: 1.8s" aria-label="AMBER commands">
      <span class="leg"><b>open</b> <i>n</i></span>
      <span class="leg"><b>next</b> <i>[doc]</i></span>
      <span class="leg"><b>cite</b></span>
      <span class="leg"><b>xref</b> <i>w</i></span>
      <span class="leg"><b>diff</b> <i>a b</i></span>
      <span class="leg"><b>man</b></span>
      <span class="leg"><b>mail</b></span>
      <span class="leg"><b>help</b></span>
      <span class="leg keys">keys: <i>j/k</i> field · <i>[ ]</i> record · <i>n</i> next field · <i>c</i> cite</span>
    </div>
  </div>
</section>

<style>
  .amber {
    position: relative;
    font-family: var(--amber-font);
    /* VT323 runs small/tall — bump the AMBER scale so the whole terminal reads at a
       comfortable terminal size; rem-based child sizes inherit the larger base. */
    font-size: 1.3rem;
    color: var(--amber-fg-dim);
    background: var(--amber-bg);
    padding: 0.55rem;
    border: 1px solid var(--amber-edge);
    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.5), 0 0 0 1px #000;
    /* Viewport fit (playtest fix): fill the session's 100vh column exactly — header
       (auto) / amber-grid (flexible) / console (auto) — instead of growing past one
       screen. min-height: 0 is required for a flex child to be allowed to shrink. */
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* ── Module power-on (Phase 2 playtest ask, re-tuned per later playtest) ─────
     Each region of the terminal snaps on in sequence when the session starts — header,
     document viewer, Concordance, cursor readout, console (log+cmd), legend — a CRT
     warming up one board at a time. Playtest: the old stagger was too tight and the
     animation too subtle to read as sequential. Now: ~0.3s apart, ~0.5s per module, so
     the whole boot reads over ~2.3s, and each module's entrance is an unmistakable CRT
     flicker — hard opacity jumps (steps, not eases), a few stutter frames, chromatic
     aberration on the flash frames — settling clean. Runs once on mount; --d staggers
     per module (see the --d values on each .mod element for the boot order). */
  .mod {
    animation: mod-on 0.5s steps(1, end) both;
    animation-delay: var(--d, 0s);
  }
  @keyframes mod-on {
    0%, 6% { opacity: 0; text-shadow: none; filter: brightness(1); }
    7% {
      opacity: 1;
      filter: brightness(1.7);
      text-shadow: -1.5px 0 rgba(232, 90, 120, 0.85), 1.5px 0 rgba(90, 170, 232, 0.85);
    }
    14% { opacity: 0.15; text-shadow: none; filter: brightness(1); }
    22% {
      opacity: 1;
      filter: brightness(1.45);
      text-shadow: 1.5px 0 rgba(232, 90, 120, 0.7), -1.5px 0 rgba(90, 170, 232, 0.7);
    }
    30% { opacity: 0.3; text-shadow: none; filter: brightness(1); }
    42% {
      opacity: 1;
      filter: brightness(1.2);
      text-shadow: -1px 0 rgba(232, 90, 120, 0.5), 1px 0 rgba(90, 170, 232, 0.5);
    }
    55%, 100% { opacity: 1; text-shadow: none; filter: brightness(1); }
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
    font-size: 0.88rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .mail-head .doc-tag { color: var(--amber-fg-faint); border: 1px solid var(--amber-edge); padding: 0 0.5ch; }
  .mail-head .mail-from { color: var(--amber-fg); }
  .mail-head .mail-day { margin-left: auto; color: var(--amber-green); }
  .mail-subj { margin: 0 0 0.7rem; color: #ffd27a; font-size: 1.15rem; letter-spacing: 0.02em; }
  .mail-body {
    white-space: pre-wrap;
    color: var(--amber-fg);
    font-size: 1.15rem;
    line-height: 1.62;
    max-width: 80ch;
  }
  .mail-foot { margin: 0.8rem 0 0; color: var(--amber-fg-faint); font-size: 0.85rem; letter-spacing: 0.05em; }

  /* ── The diff pane — two records side by side, in document register (P3-10) ──
     Chrome mirrors the mail pane (same tokens, same head/foot shape). A changed
     row is MARKED in the amber register: brightened text on the sunken ground
     behind a bright left rule — no colors outside the existing tokens. A null
     side renders as its blank cell so the alignment stays legible. */
  .diff-pane {
    background: var(--amber-bg-raised, #100b06);
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    padding: 0.9rem 1.2rem 1rem;
  }
  .diff-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.9rem;
    align-items: baseline;
    padding-bottom: 0.45rem;
    margin-bottom: 0.6rem;
    border-bottom: 1px solid var(--amber-edge);
    font-size: 0.88rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .diff-head .doc-tag { color: var(--amber-fg-faint); border: 1px solid var(--amber-edge); padding: 0 0.5ch; }
  .diff-head .diff-name { color: var(--amber-fg); }
  .diff-rows { display: flex; flex-direction: column; gap: 0.08rem; font-size: 1rem; line-height: 1.5; }
  .diff-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.9rem;
    padding: 0 0.3rem;
    border-left: 2px solid transparent; /* reserve the marker's width so rows don't shift */
    color: var(--amber-fg-dim);
  }
  .diff-row.changed {
    color: var(--amber-fg);
    background: var(--amber-bg-sunken);
    border-left-color: var(--amber-edge-bright);
  }
  .diff-cell { white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
  .diff-foot { margin: 0.8rem 0 0; color: var(--amber-fg-faint); font-size: 0.85rem; letter-spacing: 0.05em; }

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
    flex: 0 0 auto;
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.45rem 0.7rem;
    background: var(--amber-bg-raised);
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    font-size: 0.9rem;
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

  /* Two equal columns — the document pane at most half the page, the Concordance
     given the other half (playtest fix: the document pane was crowding it out). The
     console (log+cmd+legend) runs full width below both, as its own block. */
  .amber-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    /* A single explicit row sized to exactly the space this grid is given (not to
       its content) — the piece that actually makes the two columns fill the
       flexible band between the header and the console, so THEY can scroll
       internally instead of the row growing to fit them. */
    grid-auto-rows: minmax(0, 1fr);
    gap: 0.9rem;
    margin-top: 0.7rem;
    /* Viewport fit: this row is the flexible one between the header and the
       console — it takes whatever height is left (min-height: 0 lets a grid row
       shrink), and stretches its two columns to that height. */
    flex: 1 1 auto;
    min-height: 0;
    align-items: stretch;
  }
  @media (max-width: 58rem) {
    .amber-grid { grid-template-columns: 1fr; }
  }

  .main { display: flex; flex-direction: column; gap: 0.6rem; min-width: 0; min-height: 0; }
  /* The document pane scrolls internally — it no longer grows the page when a
     record runs long (playtest fix). flex: 1 makes it fill `.main`'s height
     (its only sibling-less child); min-height: 0 is what lets it actually shrink
     and hand off to overflow-y instead of stretching the whole layout. */
  .file-region {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }
  .no-file { padding: 1.4rem 1rem; color: var(--amber-fg-dim); border: 1px dashed var(--amber-edge); background: var(--amber-bg-sunken); }
  .no-file .hint { color: var(--amber-fg-faint); font-size: 0.88rem; margin-top: 0.4rem; }
  code {
    background: var(--amber-bg-raised);
    border: 1px solid var(--amber-edge);
    border-radius: 2px;
    padding: 0 0.3ch;
    color: var(--amber-fg);
    font-size: 0.92em;
  }

  .side { display: flex; flex-direction: column; gap: 0.6rem; min-width: 0; min-height: 0; }
  /* The Concordance column scrolls internally too, same reasoning as .file-region —
     it's the taller of .side's two children so it's the one that takes the flex. */
  .lookup-region {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }

  .actions { flex: 0 0 auto; display: flex; flex-direction: column; gap: 0.3rem; }
  .act {
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
  .act:hover:not(:disabled) { border-color: #8a7234; color: #f0d89a; }
  .act:disabled { color: #5b636e; border-color: #2a2f36; cursor: default; }
  .actions .hint { color: #4d5560; font-size: 0.85rem; }

  /* ── The console: log + command line as one unit ──────────────────────────
     Playtest fix: the output module (log) read as disconnected from the command
     line it feeds. Now they're one bordered block — the scrollback sits directly
     over the prompt (log keeps its bottom border, cmd drops its top border, so
     exactly one hairline separates them, not a gap) — and the legend attaches
     beneath as part of the same unit. Full width, below the two-column grid. */
  .console {
    flex: 0 0 auto;
    margin-top: 0.9rem;
    display: flex;
    flex-direction: column;
  }

  .log {
    /* Viewport fit: the log is allowed to shrink on shorter screens (down to 8rem)
       rather than forcing the page past 100vh, but keeps its old 14rem on tall ones. */
    height: clamp(8rem, 18vh, 14rem);
    flex: 0 0 auto;
    overflow-y: auto;
    background: var(--amber-bg-sunken);
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    padding: 0.5rem 0.65rem;
    font-size: 1rem;
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

  /* The command line is primary in the 80s register — a boxed, amber-prompted bar,
     fused to the log above it (no top border — the log's bottom edge is the seam). */
  .cmd {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.7rem;
    background: var(--amber-bg-sunken);
    border: 1px solid var(--amber-edge);
    border-left: 2px solid var(--amber-edge-bright);
    border-top: none;
    box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6);
  }
  .cmd .cursor { color: var(--amber-fg); font-size: 1.1rem; flex: 0 0 auto; letter-spacing: 0.04em; }
  .cmd input {
    flex: 1 1 auto;
    min-width: 0;
    background: transparent;
    border: none;
    color: var(--amber-fg);
    font: inherit;
    font-size: 1.1rem;
    outline: none;
    caret-color: var(--amber-fg);
  }
  .cmd input::placeholder { color: var(--amber-fg-faint); }

  /* The always-on command legend — AMBER's keyboard verbs, never off screen. Attaches
     under the cmd bar as part of the same console block (no top border either). */
  .cmd-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.3rem 1rem;
    padding: 0.35rem 0.7rem;
    background: var(--amber-bg-raised);
    border: 1px solid var(--amber-edge);
    border-top: none;
    font-size: 0.85rem;
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
    font-size: 0.85rem;
    cursor: pointer;
  }
  .quippy-btn:hover { border-color: #4a3a66; color: #b88ce6; }
</style>
