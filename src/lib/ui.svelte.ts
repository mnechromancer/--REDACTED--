// The AMBER/Quippy interface state — the net-new presentation/traversal layer the
// re-frame introduces (technical_document.md §7.1–7.4; handoff_amber_build.md
// Step 4). Two modes the player switches between: AMBER (the honest, keyboard-
// driven CLI; the resting state) and Quippy (the refusable GUI overlay summoned
// over it). This module owns mode, file/span traversal, the terminal log, and the
// in-flight AMBER citation commit — none of it touches truth/overlay (that is
// game.svelte.ts); it only decides what the terminal shows and where the cursor is.

import { corpus, allRefs, splitRef, makeRef, resolveSlot, anchorOf } from './game.svelte.ts';

export type InterfaceMode = 'amber' | 'quippy';

// AMBER is the default and the resting state. Quippy is summoned and dismissed;
// the player can complete the entire game without ever entering 'quippy' (the
// win). Refusal is always one keystroke away — never trap the player in Quippy.
export const ui = $state<{
  mode: InterfaceMode;
  /** the file currently open in the terminal pane (item id), or null before any open */
  activeFile: string | null;
  /** the anchor_ref of the redacted span the cursor is on, or null */
  activeSpan: string | null;
}>({ mode: 'amber', activeFile: null, activeSpan: null });

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

// ── Mode switching (the refusable thesis) ──────────────────────────────────

/** Summon Quippy over AMBER. The overlay sits on top; AMBER stays behind it. */
export function summonQuippy(): void {
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
  ui.activeFile = item;
  ui.activeSpan = firstRedactedSpan(item) ?? null;
  log(`open ${item}`, 'echo');
  return true;
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
  solved: number; // inserted or propagated (any route)
  revealed: number; // truth shown
}

export function amberProgress(): AmberProgress {
  let total = 0;
  let redacted = 0;
  let solved = 0;
  let revealed = 0;
  for (const ref of allRefs()) {
    total++;
    const s = resolveSlot(ref).state;
    if (s === 'redacted') redacted++;
    else if (s === 'revealed' || s === 'truth-contradiction') revealed++;
    else solved++;
  }
  return { total, redacted, solved, revealed };
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
