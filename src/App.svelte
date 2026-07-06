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
    reachableFiles,
    collectionOf,
  } from './lib/game.svelte.ts';
  import { ui, dismissQuippy, clearAllBuffers } from './lib/ui.svelte.ts';
  import { session, beginSession, resetSession } from './lib/session.svelte.ts';
  import { resetMail } from './lib/mail.svelte.ts';
  import AmberTerminal from './components/AmberTerminal.svelte';
  import QuippyPanel from './components/QuippyPanel.svelte';
  import EndState from './components/EndState.svelte';
  import corpusData from '../static/corpus.json';

  loadCorpus(corpusData as Corpus);
  resetSession(); // fresh run: back to the bootup screen, day 1, Quippy not yet met
  clearAllBuffers(); // fresh run: no forged citations carried over
  resetMail(); // fresh run: nothing read

  // v3 (Phase 1): the day is the gate. The shelf (collection 'local') is always
  // reachable; inbound files mount when their day arrives. No seed file — the v2
  // seed-plus-xref-closure gate is retired (the tray is open; the jam is in the
  // grounding).

  // The bootup (v3 Phase 2 — the receiving-site opening, reset_v3_intake.md §5.1):
  // AMBER POSTs in the 80s register at SITE-81C, the regional records satellite. A
  // temp credential, no tutorial fiction — the PREMISE lives in the supervisor's mail
  // (day-1 brief); the boot carries only the station's standing notice (the 1600
  // cancellation, in banner language) and points at the message file. AMBER NEVER
  // names Quippy here (it has no record of it — the entity rides the batch). The one
  // teaching duty the boot keeps is UI literacy (the playtest fix): AMBER is
  // keyboard-driven, so the essential verbs are named on the way in.
  // Each line is a {tone}:
  //   'sys'    — the machine's own login/header lines
  //   'post'   — [ OK ]/[WARN] diagnostics, the machine talking to itself
  //   'warn'   — a diagnostic failure (the lost source records)
  //   'brief'  — AMBER addressing the operator (the premise)
  //   'cmd'    — a command the operator can type (taught here, styled like input)
  //   'prompt' — the final hand-over line before BEGIN
  // Onboarding stays SHORT (slow introductions: it types slowly, but says little). AMBER
  // never names Quippy here (§0.2). A blank-text line is a spacer (a typed pause).
  type BootTone = 'sys' | 'post' | 'warn' | 'brief' | 'cmd' | 'cmdhot' | 'prompt';
  const bootLines: { tone: BootTone; text: string }[] = [
    { tone: 'sys', text: 'AMBER  ·  ARCHIVE MANAGEMENT & BATCH ENTRY RESOURCE  ·  rev 4.1' },
    { tone: 'sys', text: 'SITE-81C — REGIONAL RECORDS SATELLITE — RECEIVING STATION' },
    { tone: 'sys', text: '' },
    { tone: 'sys', text: 'LOGIN: archivist-temp  (term appointment)' },
    { tone: 'post', text: 'AUTHENTICATING .................. OK   standing TEMPORARY' },
    { tone: 'post', text: 'reference shelf ................. mounted  (REF-01 … REF-06)' },
    { tone: 'post', text: 'consignment reel, 0400 ......... mounted  (SITE-41B · 5 records)' },
    { tone: 'warn', text: 'return channel to sender ....... NO CARRIER' },
    { tone: 'post', text: 'message file .................... 3 waiting' },
    { tone: 'sys', text: '' },
    { tone: 'brief', text: 'Operator. Standing notice, receiving stations: consignment material and all working annotation cancel at 1600 station local. Reconstructions committed to the citation ledger before cancellation are excepted. Your assignment is in the message file.' },
    { tone: 'brief', text: 'This terminal is keyboard-operated. It takes typed commands, not a pointer. The essential ones:' },
    { tone: 'cmdhot', text: 'mail            — the message file   ◂ START HERE' },
    { tone: 'cmd', text: 'open <record>   — open a holding by its designation' },
    { tone: 'cmd', text: 'next            — the next struck field  (next doc — the next record)' },
    { tone: 'cmd', text: 'cite            — stake the text you have selected as grounding' },
    { tone: 'cmd', text: 'help            — the full command list, any time' },
    { tone: 'sys', text: '' },
    { tone: 'prompt', text: 'Shift runs 0400 to 1600. Read your mail, then begin.' },
  ];

  // Typewriter cadence. Characters type fast; a beat is held between lines. POST/sys
  // lines feel mechanical; the briefing is the same speed (a teletype doesn't slow for
  // prose). Tuned so the whole sequence runs a few seconds, skippable (see skipBoot).
  const CHAR_MS = 12; // ms per character
  const LINE_PAUSE_MS = 260; // held between completed lines

  // How many characters of each line are currently revealed (the typing cursor walks
  // line by line). `typed` is per-line; `activeLine` is the line being typed now.
  let activeLine = $state(0);
  let typedChars = $state(0);
  const bootDone = $derived(activeLine >= bootLines.length);

  // Drive the typewriter: reveal one char per CHAR_MS; at a line's end, pause then move
  // to the next. A blank line is an instant beat. Cleared if the player skips.
  let typer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    if (!session.booting || bootDone) return;
    const line = bootLines[activeLine];
    const full = line.text;
    if (typedChars < full.length) {
      typer = setTimeout(() => (typedChars += 1), CHAR_MS);
    } else {
      typer = setTimeout(() => {
        activeLine += 1;
        typedChars = 0;
      }, full.length === 0 ? LINE_PAUSE_MS / 3 : LINE_PAUSE_MS);
    }
    return () => clearTimeout(typer);
  });

  /** Skip the type-out — reveal everything at once (Enter/Space/click during boot). */
  function skipBoot() {
    clearTimeout(typer);
    activeLine = bootLines.length;
    typedChars = 0;
  }

  // The visible text of line i: fully typed if before the cursor, partial if active.
  function shown(i: number): string {
    if (i < activeLine) return bootLines[i].text;
    if (i === activeLine) return bootLines[i].text.slice(0, typedChars);
    return '';
  }

  // Visible files = the reachable set: the mounted consignment plus the shelf.
  // Order (v3 Phase 2) is the working order, which is also the traversal ring and
  // the auto-open target: the day's batch first (the cover slip leads by id), the
  // self-file at the batch's tail (the manifest's untitled passenger), and the
  // reference shelf last (volumes on the desk, consulted rather than worked).
  const visibleFiles = $derived.by(() => {
    const reached = reachableFiles();
    const rank = (f: (typeof corpus)[string]) =>
      collectionOf(f) === 'local' ? 2 : f.entity_self ? 1 : 0;
    return Object.values(corpus)
      .filter((f) => reached.has(f.item))
      .sort((a, b) => rank(a) - rank(b) || a.item.localeCompare(b.item));
  });
  const visibleOrder = $derived(visibleFiles.map((f) => f.item));

  // Viewport fit (playtest fix — the page scrolled past one screen): once the
  // session is live (booting done), the whole page is a fixed 100vh layout and the
  // BODY never scrolls — every pane that needs more room than it's given scrolls
  // internally instead (AmberTerminal's file/Concordance panes). The boot screen
  // keeps its own (potentially taller) flow, so this only toggles once boot ends.
  $effect(() => {
    document.body.classList.toggle('session-active', !session.booting);
  });

  function onWindowKey(e: KeyboardEvent) {
    // During boot: any key skips the type-out; once done, Enter/Space begins the shift.
    // This is the first thing that teaches the player AMBER answers to the keyboard.
    if (session.booting) {
      if (!bootDone) {
        e.preventDefault();
        skipBoot();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        beginSession();
      }
      return;
    }
    // Esc always dismisses Quippy — refusal is one keystroke away (§7.3).
    if (e.key === 'Escape' && ui.mode === 'quippy') {
      e.preventDefault();
      dismissQuippy();
    }
  }
</script>

<svelte:window onkeydown={onWindowKey} />

{#if session.booting}
  <!-- The whole screen reacts to a keypress: while typing, any key SKIPS to the end;
       once done, Enter begins the shift (handled on the window, below). Click anywhere
       does the same (mouse is a quiet fallback). This is also the first lesson that
       AMBER is keyboard-operated. -->
  <main class="boot crt-scan">
    <div class="boot-screen">
      <div class="boot-body">
        {#each bootLines as line, i (i)}
          {#if i <= activeLine}
            <p class="boot-line {line.tone}">{shown(i)}{#if i === activeLine && !bootDone}<span class="caret">█</span>{/if}</p>
          {/if}
        {/each}
      </div>
      {#if bootDone}
        <div class="boot-ready">
          <span class="ready-prompt">amber login: archivist-temp —</span>
          <button class="boot-begin" onclick={beginSession}>▶ BEGIN SHIFT</button>
          <span class="ready-hint">[ press ENTER ]</span>
        </div>
      {:else}
        <button type="button" class="boot-skip" onclick={skipBoot}>type-out in progress · press any key to skip</button>
      {/if}
    </div>
  </main>
{:else}
  <main class="session">
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
  /* Viewport fit (playtest fix — the page still scrolled past one screen): once the
     session is live, the body itself never scrolls — everything fits ~100vh and any
     pane that needs more room scrolls internally (AmberTerminal owns that). The boot
     screen (no .session-active yet) keeps its own free-flowing height. */
  :global(body.session-active) {
    overflow: hidden;
    height: 100vh;
  }
  /* Full-bleed working surface (Phase 2 playtest ask) — the terminal takes the
     page, not a boxed column in the middle. */
  main {
    max-width: none;
    margin: 0;
    padding: 1.1rem 1.4rem 3rem;
  }
  /* The live session: a fixed 100vh column so AmberTerminal (its only child) can
     size itself to fill exactly one screen and hand off internal scrolling to its
     own panes, rather than the page growing taller than the viewport. */
  main.session {
    height: 100vh;
    box-sizing: border-box;
    padding: 1.1rem 1.4rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Boot/onboarding — an authentic mainframe login TYPED OUT char-by-char to a teletype.
     Left-aligned, monospace, full-bleed amber console. Lines appear as they are typed
     (the typing is JS-driven, not CSS animation); the caret rides the active line. */
  main.boot {
    max-width: none;
    min-height: 94vh;
    margin: 0;
    padding: 1.2rem 1.4rem;
    display: flex;
    font-family: var(--amber-font, ui-monospace), monospace;
    cursor: default;
    outline: none;
  }
  .boot-screen {
    width: 100%;
    background: var(--amber-bg, #0a0805);
    border: 1px solid var(--amber-edge, #3a2c12);
    border-left: 2px solid var(--amber-edge-bright, #6a5220);
    padding: 1.4rem 1.5rem 1.2rem;
    box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.55), 0 0 0 1px #000, 0 8px 40px rgba(0, 0, 0, 0.6);
  }
  /* Tighter line gap — a teletype prints lines close. min-height holds the frame steady
     so it doesn't jump as lines are added. */
  .boot-body { display: flex; flex-direction: column; gap: 0.15rem; margin-bottom: 1.2rem; min-height: 60vh; }
  .boot-line {
    margin: 0;
    line-height: 1.5;
    color: var(--amber-fg-dim, #8a6a2c);
    font-size: 1.18rem;
    letter-spacing: 0.01em;
    white-space: pre-wrap; /* preserve the alignment dots in the diagnostics */
    min-height: 1.5em; /* a blank spacer line still takes a row */
  }
  /* Registers: sys/login dim-bright; diagnostics dim; the warn line red; the briefing
     bright prose; commands styled like typed input (the keyboard lesson); prompt gold. */
  .boot-line.sys { color: var(--amber-fg, #e8b24d); }
  .boot-line.post { color: var(--amber-fg-dim, #8a6a2c); }
  .boot-line.warn { color: var(--amber-red, #e85d5d); }
  .boot-line.brief { color: var(--amber-fg, #e8b24d); line-height: 1.55; margin-top: 0.4rem; }
  .boot-line.cmd,
  .boot-line.cmdhot {
    color: var(--amber-green, #8ad0a0);
    padding-left: 1.5ch;
  }
  .boot-line.cmd::before, .boot-line.cmdhot::before { content: '› '; color: var(--amber-fg-faint, #5a4720); }
  /* The taught first step burns brighter than the rest of the verb list. */
  .boot-line.cmdhot { color: #ffd27a; text-shadow: 0 0 8px rgba(255, 210, 122, 0.35); }
  .boot-line.prompt { color: #ffd27a; margin-top: 0.4rem; line-height: 1.55; }
  .caret {
    color: var(--amber-fg, #e8b24d);
    animation: caret-blink 1s steps(1) infinite;
  }

  .boot-skip {
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    text-align: left;
    font: inherit;
    color: var(--amber-fg-faint, #5a4720);
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .boot-skip:hover { color: var(--amber-fg-dim, #8a6a2c); }

  /* The ready row: a login-style prompt, BEGIN, and the ENTER hint — the hand-over. */
  .boot-ready { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; animation: boot-in 0.25s ease-out; }
  .boot-ready .ready-prompt { color: var(--amber-fg-dim, #8a6a2c); font-size: 1.1rem; }
  .boot-ready .ready-hint { color: var(--amber-fg-faint, #5a4720); font-size: 0.95rem; letter-spacing: 0.06em; }
  .boot-begin {
    padding: 0.45rem 1.1rem;
    background: var(--amber-bg-raised, #100b06);
    color: var(--amber-fg, #e8b24d);
    border: 1px solid var(--amber-edge-bright, #6a5220);
    font-family: inherit;
    font-size: 1.15rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    text-transform: uppercase;
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
    .caret { animation: none; }
  }
</style>
