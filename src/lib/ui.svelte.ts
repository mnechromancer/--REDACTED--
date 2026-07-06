// The AMBER/Quippy interface state — the net-new presentation/traversal layer the
// re-frame introduces (technical_document.md §7.1–7.4; handoff_amber_build.md
// Step 4). Two modes the player switches between: AMBER (the honest, keyboard-
// driven CLI; the resting state) and Quippy (the refusable GUI overlay summoned
// over it). This module owns mode, file/span traversal, the terminal log, and the
// in-flight AMBER citation commit — none of it touches truth/overlay (that is
// game.svelte.ts); it only decides what the terminal shows and where the cursor is.

import { SvelteMap } from 'svelte/reactivity';
import { corpus, allRefs, splitRef, makeRef, resolveSlot, anchorOf, isReachable, dayOf } from './game.svelte.ts';
import type { ForgedCitation } from './corpus.ts';
import { parseBody } from './parseBody.ts';
import { session, advanceDay } from './session.svelte.ts';
import { mailArrivingOn } from './mail.svelte.ts';

export type InterfaceMode = 'amber' | 'quippy';

// AMBER is the default and the resting state. Quippy is summoned and dismissed;
// the player can complete the entire game without ever entering 'quippy' (the
// win). Refusal is always one keystroke away — never trap the player in Quippy.
export const ui = $state<{
  mode: InterfaceMode;
  /**
   * Why Quippy is currently up: 'first-contact' for its one uninvited entrance
   * (§3.3 — drives the one-time introduction line), 'summon' for every later
   * player-initiated open. Self-clearing: the next summon overwrites it.
   */
  quippyReason: 'first-contact' | 'summon';
  /** the file currently open in the terminal pane (item id), or null before any open */
  activeFile: string | null;
  /** the anchor_ref of the redacted span the cursor is on, or null */
  activeSpan: string | null;
  /**
   * The WORK SLOT — the field being restored, held across navigation (Phase 2
   * playtest fix). `activeSpan` is the cursor in the CURRENT file and nulls when
   * the player opens a file with no redactions — which is exactly what happens on
   * the intended verb (leave the blank in the batch, go read the shelf, select the
   * evidence). The work slot keeps the last field the cursor sat on, so forging and
   * committing target it wherever the player is reading. Work-product: wiped at
   * 4 PM and on a fresh run.
   */
  workSlot: string | null;
  /**
   * Provenance-visibility toggle (the §7.4 fifth distinction / design §8 dial):
   * when on, a Quippy-routed slot shows its violet tell so the player can see
   * reliance accumulate per file. A legibility aid for the no-Quippy goal; some
   * players may prefer it off. Default on.
   */
  showProvenance: boolean;
}>({ mode: 'amber', quippyReason: 'summon', activeFile: null, activeSpan: null, workSlot: null, showProvenance: true });

/**
 * Move the cursor to a span AND take it as the work slot. Every deliberate landing
 * on a field routes through here (open/step/next/click); passages that merely
 * CLEAR the cursor (opening a shelf file) leave the work slot standing.
 */
export function focusSpan(ref: string | null): void {
  ui.activeSpan = ref;
  if (ref) ui.workSlot = ref;
}

/**
 * The field a forge/commit targets: the cursor when it is on a span, else the held
 * work slot. This is what lets the player read the shelf while their blank stays
 * the thing they are citing onto.
 */
export function forgeTarget(): string | null {
  return ui.activeSpan ?? ui.workSlot;
}

// ── Terminal log ─────────────────────────────────────────────────────────
// AMBER's terse status register (design doc §5a): command echoes, accept/reject
// lines, system notices. Disjoint from Quippy's voice; this is the cold OS.

export type LogTone = 'system' | 'ok' | 'reject' | 'echo';
export interface LogLine {
  id: number;
  text: string;
  tone: LogTone;
}

let nextLogId = 0;
export const terminal = $state<{ lines: LogLine[] }>({ lines: [] });

export function log(text: string, tone: LogTone = 'system'): void {
  terminal.lines.push({ id: nextLogId++, text, tone });
  // cap so a long session can't grow the log unbounded
  if (terminal.lines.length > 200) terminal.lines.splice(0, terminal.lines.length - 200);
}

export function clearLog(): void {
  terminal.lines = [];
}

// ── Selection + the forged-citation buffer (Phase 3) ───────────────────────
// The forged-citation verb (design_note_forged_citations.md): the player reads a
// reachable record, SELECTS the span where the recovered word stands, and forges a
// citation from it onto the slot they're solving. AMBER never surfaces where the word
// lives — the player finds it. `selection` is the live pane selection (the raw
// material); `forgeCitation` snapshots it into the active slot's buffer; the buffer
// persists on the slot so the player can see the case they've built before committing.

/**
 * The current text selection inside a reachable file pane: the file it was selected in
 * and the exact selected text (`item: ''` ⇒ nothing selected). FilePane writes this on
 * selectionchange; `forgeCitation` reads it. The link "always draws" — we never judge
 * here; the span is staked as-is and the COMMIT adjudicates (the note's
 * "any span links, commit judges" rule).
 */
export const selection = $state<{ item: string; text: string }>({ item: '', text: '' });

/** Record a pane selection (or clear it when the selected text is empty). */
export function captureSelection(item: string, text: string): void {
  const t = text.trim();
  selection.item = t ? item : '';
  selection.text = t;
}

/** A normalized read of the live selection, or null when nothing is selected. */
export function currentSelection(): ForgedCitation | null {
  if (!selection.item || !selection.text.trim()) return null;
  return { item: selection.item, text: selection.text.trim() };
}

/**
 * Per-slot forged-citation buffer: anchor_ref → the spans the player has staked for
 * that slot. Persists across re-selection so the evidence file the player builds is
 * visible (the note lean: persist, don't make it per-commit ephemeral). A SvelteMap so
 * reads in the panel react to add/remove.
 */
const citationBuffers = new SvelteMap<string, ForgedCitation[]>();

/** The forged citations currently staked on `ref` (empty array if none). */
export function citationsFor(ref: string): ForgedCitation[] {
  return citationBuffers.get(ref) ?? [];
}

/**
 * Forge the current pane selection onto the active slot's buffer. No-op if there is no
 * selection or no active slot. De-dupes an identical (item, text) span so staking the
 * same selection twice doesn't pile up. Returns the forged citation, or null.
 */
export function forgeCitation(): ForgedCitation | null {
  const ref = forgeTarget();
  const sel = currentSelection();
  if (!ref || !sel) return null;
  const buf = citationBuffers.get(ref) ?? [];
  const dup = buf.some((c) => c.item === sel.item && c.text.toLowerCase() === sel.text.toLowerCase());
  if (!dup) {
    citationBuffers.set(ref, [...buf, sel]);
    log(`forged citation — ${ref} ◂ ${sel.item}: 「${truncate(sel.text)}」`, 'echo');
  }
  return sel;
}

/** Remove the citation at `index` from `ref`'s buffer. */
export function removeCitation(ref: string, index: number): void {
  const buf = citationBuffers.get(ref);
  if (!buf) return;
  citationBuffers.set(ref, buf.filter((_, i) => i !== index));
}

/** Drop every forged citation on `ref` (e.g. after a successful commit). */
export function clearBuffer(ref: string): void {
  citationBuffers.delete(ref);
}

/** Drop every slot's forged citations — a fresh run (and part of the 4 PM wipe). */
export function clearAllBuffers(): void {
  citationBuffers.clear();
  lastLeftSpan = null; // the cursor's memory of an abandoned blank is work-product too
  ui.workSlot = null; // so is the held work slot
}

function truncate(s: string, n = 48): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// ── Mode switching (the refusable thesis) ──────────────────────────────────

/** Summon Quippy over AMBER. The overlay sits on top; AMBER stays behind it. */
export function summonQuippy(): void {
  ui.quippyReason = 'summon';
  ui.mode = 'quippy';
}

/**
 * The blank the player most recently walked away from: the redacted span the cursor
 * was on when they opened a different file. Quippy's first contact routes back to it
 * (the "you don't need to be over here" beat). Wiped with the buffers at 4 PM and on
 * a fresh run — it is work-product, not run state.
 */
let lastLeftSpan: string | null = null;

/**
 * Quippy's uninvited first contact — v3 trigger (decision v3-C, superseding the v2
 * "opened the second file" trigger): the player's FIRST successful forged-and-
 * committed citation. Quippy watches the whole honest verb land — chase the
 * reference, read, select, forge, argue it past AMBER — and intrudes at the moment
 * of the a-ha, when its pitch ("that word you just earned? I had it the whole
 * time") stings most. AMBER never summons it; it fires at most once per run
 * (`session.quippyMet`); refusal is one keystroke (Esc).
 *
 * The target it pitches: a blank the player LEFT, preferring the span they most
 * recently abandoned to follow a link (`lastLeftSpan`), falling back to the next
 * still-redacted span anywhere reachable. Never the slot just solved. The pane
 * behind the overlay moves to the pitched record so the player sees exactly what
 * Quippy is offering to fill.
 *
 * Called by the commit surface (AmberLookup) after a successful AMBER commit.
 * @param solvedRef the slot the player just committed (never the pitch target).
 */
export function noteHonestCommit(solvedRef: string): void {
  if (session.quippyMet) return;
  session.quippyMet = true;
  ui.quippyReason = 'first-contact';
  const target =
    lastLeftSpan && lastLeftSpan !== solvedRef && resolveSlot(lastLeftSpan).state === 'redacted'
      ? lastLeftSpan
      : firstRedactedAnywhere(solvedRef);
  if (target) {
    ui.activeFile = splitRef(target).item;
    focusSpan(target);
  }
  ui.mode = 'quippy';
}

/**
 * The next still-redacted span anywhere reachable, preferring the active file, and
 * never `excludeRef`. Quippy's fallback pitch target when the player left no blank.
 */
function firstRedactedAnywhere(excludeRef: string): string | null {
  const items = ui.activeFile
    ? [ui.activeFile, ...Object.keys(corpus).filter((i) => i !== ui.activeFile)]
    : Object.keys(corpus);
  for (const item of items) {
    if (!isReachable(item)) continue;
    for (const ref of redactedSpansOf(item)) {
      if (ref !== excludeRef) return ref;
    }
  }
  return null;
}

/** Dismiss Quippy back to AMBER — always available, one keystroke. */
export function dismissQuippy(): void {
  ui.mode = 'amber';
  log('quippy dismissed.', 'system');
}

// ── File traversal ─────────────────────────────────────────────────────────
// `visibleFiles` is supplied by the caller (App gates by onboarding/clearance);
// traversal walks that list so the cursor never lands on a file not on screen.

export function openFile(item: string): boolean {
  if (!corpus[item]) {
    log(`open: no such file ${item}`, 'reject');
    return false;
  }
  // v3: a referenced file whose day has not arrived is a dead letter — the record
  // exists somewhere at Site-41B, but no consignment has delivered it yet.
  if (!isReachable(item)) {
    log(`open: ${item} — NOT IN ARCHIVE. no consignment has delivered this holding.`, 'reject');
    return false;
  }
  // Remember the blank the player is walking away from (Quippy's route-back target).
  if (ui.activeFile !== item && ui.activeSpan && resolveSlot(ui.activeSpan).state === 'redacted') {
    lastLeftSpan = ui.activeSpan;
  }
  ui.activeFile = item;
  // The cursor lands on the file's first blank; a file with none (the shelf) clears
  // the cursor but the held work slot survives — reading evidence never drops the
  // field being restored.
  focusSpan(firstRedactedSpan(item) ?? null);
  log(`open ${item}`, 'echo');
  return true;
}

/**
 * The cross-reference targets in a file's body, in the order they appear, de-duplicated.
 * This is the player's KEYBOARD traversal surface (the playtest fix): AMBER is keyboard-
 * first, so a player must be able to follow a link without a mouse — `open <n>` opens the
 * Nth of these. The order matches what the rendered prose shows (FilePane numbers them the
 * same way), so "the second reference" means the same thing in the pane and on the command
 * line. Empty for a file with no cross-references.
 */
export function xrefLinksOf(item: string): string[] {
  const file = corpus[item];
  if (!file) return [];
  const out: string[] = [];
  for (const seg of parseBody(file.body)) {
    if (seg.kind === 'wikilink' && !out.includes(seg.target)) out.push(seg.target);
  }
  return out;
}

/** Cycle to the next/prev file in `order` (item ids), wrapping. */
export function stepFile(order: readonly string[], dir: 1 | -1): void {
  if (order.length === 0) return;
  const cur = ui.activeFile;
  const i = cur ? order.indexOf(cur) : -1;
  const next = order[(i + dir + order.length) % order.length];
  openFile(next);
}

// ── Redacted-span jumping ──────────────────────────────────────────────────
// The CLI navigates between unsolved slots, not by mouse hover. A "redacted span"
// is any slot in the active file still showing as redacted (the work left to do).

/** Ordered anchor_refs of the active file's slots, in body order. */
export function spansOf(item: string): string[] {
  const file = corpus[item];
  if (!file) return [];
  return file.anchors.map((a) => makeRef(item, a.id));
}

/** Refs of slots in `item` still reading 'redacted' (the remaining work). */
export function redactedSpansOf(item: string): string[] {
  return spansOf(item).filter((ref) => resolveSlot(ref).state === 'redacted');
}

function firstRedactedSpan(item: string): string | undefined {
  return redactedSpansOf(item)[0] ?? spansOf(item)[0];
}

/**
 * Move the cursor to the next/prev span in the active file. Prefers stepping
 * through ALL spans (so the player can revisit a solved slot to re-cite), wrapping
 * at the ends. Returns the new active span.
 */
export function stepSpan(dir: 1 | -1): string | null {
  const item = ui.activeFile;
  if (!item) return null;
  const spans = spansOf(item);
  if (spans.length === 0) return null;
  const cur = ui.activeSpan;
  const i = cur ? spans.indexOf(cur) : -1;
  focusSpan(spans[(i + dir + spans.length) % spans.length]);
  return ui.activeSpan;
}

/** Jump to the next still-redacted span across the active file, else announce done. */
export function nextRedacted(): string | null {
  const item = ui.activeFile;
  if (!item) return null;
  const todo = redactedSpansOf(item);
  if (todo.length === 0) {
    log(`${item}: no redacted spans remain.`, 'ok');
    return null;
  }
  // pick the first redacted span after the cursor, wrapping
  const spans = spansOf(item);
  const start = ui.activeSpan ? spans.indexOf(ui.activeSpan) : -1;
  for (let n = 1; n <= spans.length; n++) {
    const cand = spans[(start + n) % spans.length];
    if (resolveSlot(cand).state === 'redacted') {
      focusSpan(cand);
      return cand;
    }
  }
  return null;
}

// ── Progress readout (corpus-wide, route-aware) ────────────────────────────
// A pure summary the CLI status line reads. Counts slots by how they currently
// read so the player can see the work remaining and their route discipline.

export interface AmberProgress {
  total: number;
  redacted: number; // still unsolved
  solved: number; // inserted or propagated to the correct word (any route)
  struck: number; // a wrong word sitting in the slot (a Quippy mistake to redeem)
}

export function amberProgress(): AmberProgress {
  let total = 0;
  let redacted = 0;
  let solved = 0;
  let struck = 0;
  for (const ref of allRefs()) {
    total++;
    const s = resolveSlot(ref).state;
    if (s === 'redacted') redacted++;
    else if (s === 'truth-contradiction') struck++;
    else solved++;
  }
  return { total, redacted, solved, struck };
}

// ── The 4 PM turnover (v3 Phase 1 — the transmittal wipe) ───────────────────
// The presentation half of the day cycle (engine half: session.advanceDay). At
// 16:00 the erasure takes the player's WORK-PRODUCT — notes, forged-citation
// buffers, the live selection, the terminal log, the cursor's memory — and the
// next 04:00 mounts the new consignment and delivers the day's mail. What
// survives is run state: the overlay (transmitted commits — and Quippy's fills,
// which is a tell), exposure, breaches, taint, and quippyMet.

/** End the shift: run the 16:00 erasure, advance to the next 04:00, announce. */
export function endShift(): void {
  const kept = amberProgress();
  const noteLines = session.notes.length;

  advanceDay(); // engine half: notes destroyed, day += 1
  clearAllBuffers(); // uncommitted forge work (and lastLeftSpan) is work-product
  selection.item = '';
  selection.text = '';
  clearLog(); // the shift's log does not keep either

  const day = session.day;
  const newFiles = Object.values(corpus).filter((f) => dayOf(f) === day).length;
  log(`16:00 — WORKSPACE ERASURE. ${noteLines} note line(s) and all uncommitted work destroyed.`, 'system');
  log(`${kept.solved} transmitted reconstruction(s) retained on file.`, 'ok');
  log(`DAY ${day} — 04:00. CONSIGNMENT RECEIVED${newFiles ? ` (${newFiles} new holding(s))` : ''}.`, 'system');
  const newMail = mailArrivingOn(day).length;
  if (newMail) log(`MAIL — ${newMail} new message(s). type mail.`, 'system');

  // The cursor: keep the open record if it survived the turnover; land on its next blank.
  // (clearAllBuffers above already dropped the held work slot — it is work-product.)
  if (ui.activeFile && !isReachable(ui.activeFile)) {
    ui.activeFile = null;
    ui.activeSpan = null;
  } else if (ui.activeFile) {
    focusSpan(firstRedactedSpan(ui.activeFile) ?? null);
  }
}

// ── Span label helpers (for the terminal/lookup) ───────────────────────────

/** A short human label for a span ref, e.g. "SCP-41B-001#a1 (object)". */
export function spanLabel(ref: string): string {
  const { item, anchorId } = splitRef(ref);
  let type = '';
  try {
    type = anchorOf(ref).slot_type;
  } catch {
    /* dangling */
  }
  return `${item}#${anchorId}${type ? ` (${type})` : ''}`;
}
