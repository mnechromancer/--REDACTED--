// Session state — the boot flag, Quippy's first-contact latch, and (Phase 1, v3)
// the DAY CYCLE: the receiving site's 4 AM → 4 PM window and the doomed scratchpad.
//
// The transmittal model (decision v3-A, amber_build_decisions.md §"v3"): what the
// 4 PM erasure takes is the player's WORK-PRODUCT — `notes` here, the forged-citation
// buffers and terminal log in ui.svelte.ts. What persists is run state: the overlay
// (cited commits are "transmitted"; even Quippy's fills survive — a tell), exposure,
// breaches, and the permanent quippyTouched taint. Nothing in this module touches
// truth/overlay; it is the clock and the notepad.
//
// (History: the v2 scripted-onboarding module this replaced is described in
// archive/handoff_reset_build.md §5. `booting`/`quippyMet` are its survivors.)

/**
 * `booting` — true until the player leaves the bootup screen and is handed the
 * terminal.
 * `quippyMet` — false until Quippy's uninvited first contact fires. v3 trigger
 * (decision v3-C): the player's FIRST successful forged-and-committed citation —
 * Quippy watches honest work before it interrupts. Latched per run.
 * `day` — the current day, 1-based. Inbound files with `day <= session.day` are
 * mounted (reachable); the rest have not arrived yet. Tests may set 0 ("before the
 * first batch") to make every inbound file unreachable.
 * `notes` — the in-fiction scratchpad (`note` command). Exists to be erased at
 * 4 PM: advanceDay() destroys it, and that loss is the theme taught mechanically.
 */
export const session = $state<{
  booting: boolean;
  quippyMet: boolean;
  day: number;
  notes: string[];
}>({
  booting: true,
  quippyMet: false,
  day: 1,
  notes: [],
});

/** Leave the bootup screen and hand over the terminal. */
export function beginSession(): void {
  session.booting = false;
}

/** Append a line to the doomed scratchpad. */
export function addNote(text: string): void {
  const t = text.trim();
  if (t) session.notes.push(t);
}

/**
 * The 4 PM → 4 AM turnover, engine half: destroy the notes, advance the day.
 * The presentation half (ui.endShift) also wipes the citation buffers, the live
 * selection, and the terminal log, then announces the new consignment and mail.
 * Deliberately NOT wiped: overlay, exposure, breaches, quippyTouched, quippyMet —
 * run state survives the erasure (Phase-1 decision: breaches recompute from
 * exposure, which persists, so "the wipe clears breach effects" would be a lie;
 * the erasure takes work-product, not consequences).
 */
export function advanceDay(): void {
  session.notes = [];
  session.day += 1;
}

/** Reset for a fresh run (called from App beside loadCorpus). */
export function resetSession(): void {
  session.booting = true;
  session.quippyMet = false;
  session.day = 1;
  session.notes = [];
}
