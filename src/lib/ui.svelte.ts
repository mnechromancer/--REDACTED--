// The AMBER/Quippy interface state — the net-new presentation/traversal layer the
// re-frame introduces (technical_document.md §7.1–7.4; handoff_amber_build.md
// Step 4). Two modes the player switches between: AMBER (the honest, keyboard-
// driven CLI; the resting state) and Quippy (the refusable GUI overlay summoned
// over it). This module owns mode, file/span traversal, the terminal log, and the
// in-flight AMBER citation commit — none of it touches truth/overlay (that is
// game.svelte.ts); it only decides what the terminal shows and where the cursor is.

import { SvelteMap } from 'svelte/reactivity';
import { corpus, allRefs, splitRef, makeRef, resolveSlot, anchorOf, seedReachable } from './game.svelte.ts';
import type { ForgedCitation } from './corpus.ts';
import { parseBody } from './parseBody.ts';
import { session } from './session.svelte.ts';

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
   * Provenance-visibility toggle (the §7.4 fifth distinction / design §8 dial):
   * when on, a Quippy-routed slot shows its violet tell so the player can see
   * reliance accumulate per file. A legibility aid for the no-Quippy goal; some
   * players may prefer it off. Default on.
   */
  showProvenance: boolean;
}>({ mode: 'amber', quippyReason: 'summon', activeFile: null, activeSpan: null, showProvenance: true });

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
  const ref = ui.activeSpan;
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

/** Drop every slot's forged citations — a fresh run. */
export function clearAllBuffers(): void {
  citationBuffers.clear();
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
 * Quippy's uninvited first contact (reset_amber_v2.md §3.3 — the motivated
 * entrance, decided trigger: opening the second file via the link). AMBER never
 * summons Quippy; Quippy intrudes. It surfaces the moment the player has shown the
 * honest verb works — they followed a slot's xref into a file they were not handed
 * at boot — which is exactly when Quippy makes its case to be unnecessary by being
 * easy. Fires at most once per run (`session.quippyMet`); after that, summoning is
 * the player's own choice. Refusal is one keystroke either way (Esc).
 *
 * The target it pitches (user decision): NOT a slot in the just-opened file — the
 * player hasn't read that file yet, and offering its answer is incoherent. Quippy
 * instead **routes the cursor back to the slot the player was working on** when they
 * followed the link (`priorSpan`) and offers to fill *that* — the blank the link was
 * going to help them cite. ("You don't need to be over here; I already know what
 * goes back there.") For the teaching pair that is 001's slot; it generalizes to any
 * file. `ui.activeFile` is moved back to that slot's file so the pane behind the
 * overlay shows the record Quippy is offering to fill, not the unread one.
 *
 * @param priorSpan the anchor_ref the cursor was on before this open (may be null).
 */
function maybeFirstContact(item: string, priorSpan: string | null): void {
  if (session.quippyMet) return;
  if (seedReachable.has(item)) return; // the opening file(s) — not a followed link
  session.quippyMet = true;
  ui.quippyReason = 'first-contact';
  // Route back to the slot the player left to follow the link, if it's still blank.
  if (priorSpan && resolveSlot(priorSpan).state === 'redacted') {
    ui.activeFile = splitRef(priorSpan).item;
    ui.activeSpan = priorSpan;
  }
  ui.mode = 'quippy';
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
  const priorSpan = ui.activeSpan; // the slot the player leaves to follow the link
  ui.activeFile = item;
  ui.activeSpan = firstRedactedSpan(item) ?? null;
  log(`open ${item}`, 'echo');
  // Quippy's uninvited entrance rides on the player following a link to a non-seed
  // file (§3.3). It routes the cursor back to `priorSpan` (the blank they left), so
  // it never pitches the answer to the file the player hasn't read yet.
  maybeFirstContact(item, priorSpan);
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
  ui.activeSpan = spans[(i + dir + spans.length) % spans.length];
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
      ui.activeSpan = cand;
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
