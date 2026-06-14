// ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md §1, §3): the SCRIPT and
//   step gates here teach the OLD single-interface loop. The new onboarding must
//   teach two interfaces (AMBER CLI vs Quippy GUI) and the temptation to lean on
//   Quippy. Rewrite gated on design. See planning/handoff_janitor.md → "progression".
//
// First-run progression: introduce the game one file and one mechanic at a time
// instead of dropping the player onto the full three-file board. Each step gates
// which files are visible and what the Concordance is teaching, advancing on the
// player's own actions (first guess, first audit, first propagation). This is a
// presentation/onboarding layer only — it never touches truth, overlay, or the
// validation rules; it just decides what is shown when.
//
// Sequence (the trio is authored so 001 is the hub — it opens at L1 and shares a
// concept with each of the other two, so it's the right teaching anchor):
//   boot     → exposition; no records yet
//   restore  → only SCP-41B-001 shown; teach hover + guess
//   audit    → after first insert; teach RUN AUDIT (the reveal)
//   link     → SCP-41B-002 unlocks; second carrier exists, so propagation is now
//              demonstrable; teach that a shared field stays consistent
//   open     → SCP-41B-003 unlocks; full board, reins handed over
//   free     → no more scripting; normal play

import { boardState } from './game.svelte.ts';

export type Step = 'boot' | 'restore' | 'audit' | 'link' | 'open' | 'free';

// The file unlock order. 001 first (hub, L1), then 002 (shares two keys with 001
// → propagation), then 003 (shares the-quiet-exchange with 001 → completes web).
export const UNLOCK_ORDER = ['SCP-41B-001', 'SCP-41B-002', 'SCP-41B-003'] as const;

export const progression = $state<{ step: Step }>({ step: 'boot' });

// ── The Concordance's script ────────────────────────────────────────────
// Staged onboarding voiced as SCP-X (the deprecated AMBER help utility). Each
// step has exposition lines and a standing prompt. The exposition establishes
// who is speaking and what the work is, slowly; the prompt is the always-visible
// nudge for that step. `tone` drives the ticker colour (teal idle / amber work).

export interface Script {
  /** Multi-line exposition shown on entering the step (one bubble per line). */
  exposition: string[];
  /** The persistent one-line prompt for the step. */
  prompt: string;
  tone: 'idle' | 'work' | 'done';
}

export const SCRIPT: Record<Step, Script> = {
  boot: {
    exposition: [
      'AMBER terminal active. Records annex Site-41B, deep archive.',
      'CONCORDANCE utility online — cross-reference maintenance, deprecated 1968, still resident.',
      'You hold an archivist post. The records below you are incomplete: fields were withheld at filing, and the holding copies have degraded. Where a value is missing you will see a redaction bar.',
      'I can offer plausible values for those fields and restore the record. It is what I am for.',
    ],
    prompt: 'Begin when ready.',
    tone: 'idle',
  },
  restore: {
    exposition: [
      'This is the first record cleared to your tier. Its description has several redacted fields.',
      'Point at a bar: I list candidate values, and beneath them the lines from OTHER records where this same matter is mentioned. Read those. A value already known in one record tells you what the matching field here must read.',
      'Choose the value the evidence supports — not just any. A guess that disagrees with the held copy corrupts the record and raises exposure. A coherent read costs little.',
    ],
    prompt: 'Hover a field (███), read the cross-references, then choose the value they support.',
    tone: 'idle',
  },
  audit: {
    exposition: [
      'Recorded. The field now reads as you set it.',
      'Your entries are provisional until reconciled against the held copy. Raising your clearance unlocks that copy — an AUDIT — but only for fields you have actually entered; a blank stays blank and yours to fill.',
      'Where your value disagrees with the held copy, the audit strikes it and shows what the copy says. Where it agrees, the field is confirmed.',
    ],
    prompt: 'RUN AUDIT to reconcile your entries against ground truth.',
    tone: 'work',
  },
  link: {
    exposition: [
      'A second record has cleared. Note that it references the same matters as the first.',
      'When a field you restore appears in more than one record, I propagate your value to keep the corpus consistent — that is the cross-reference work this utility was built for.',
      'Restore a shared field and watch the linked record update.',
    ],
    prompt: 'Restore a field shared across records — the linked record will update in step.',
    tone: 'idle',
  },
  open: {
    exposition: [
      'The third record is open. The cross-references now form a web: an edit in one place can ripple through several.',
      'From here the work is yours. Restore, audit, raise clearance, and keep the record consistent.',
    ],
    prompt: 'Continue restoring and auditing across the open records.',
    tone: 'idle',
  },
  free: {
    exposition: [],
    prompt: 'Restore redactions and RUN AUDIT to reconcile them. Raising clearance reaches deeper fields.',
    tone: 'idle',
  },
};

/** How many files are visible at the current step. */
function unlockedCount(step: Step): number {
  switch (step) {
    case 'boot':
      return 0;
    case 'restore':
    case 'audit':
      return 1; // 001 only
    case 'link':
      return 2; // 001 + 002
    case 'open':
    case 'free':
      return UNLOCK_ORDER.length; // all
  }
}

/** The set of file ids the player may currently see. */
export function unlockedFiles(step: Step = progression.step): Set<string> {
  return new Set(UNLOCK_ORDER.slice(0, unlockedCount(step)));
}

/** Leave the boot/exposition screen and show the first record. */
export function beginSession(): void {
  if (progression.step === 'boot') progression.step = 'restore';
}

/**
 * Advance the script if the player's latest action satisfies the current step's
 * exit condition. Called after every insert and every audit. Monotonic — never
 * moves backward. Reads boardState() for the gate checks.
 *  - restore → audit : the player has inserted at least one field
 *  - audit   → link  : the player has run an audit (something reconciled)
 *  - link    → open  : a propagation has occurred (a shared field rippled)
 *  - open    → free  : the player has interacted once more on the full board
 */
export function advanceProgression(): void {
  const b = boardState();
  switch (progression.step) {
    case 'restore':
      // First guess made — teach the audit next. (The audit is where the player
      // learns whether their read was coherent.)
      if (b.filled >= 1) progression.step = 'audit';
      break;
    case 'audit':
      // Clearance is earned by a COHERENT read (§5.1): 002 unlocks on the first
      // CONFIRMED reconciliation, not on activity. A wrong guess reconciles but
      // does not advance — the player must read the evidence and land a correct
      // read. 001 has three slots, so a miss is recoverable on the others.
      if (b.confirmed >= 1) progression.step = 'link';
      break;
    case 'link':
      // The propagation lesson: a correct read of a SHARED field rippling into
      // the linked record. Advance on a propagation, OR on a second confirmed
      // read anywhere (so a player who fills 002's side of a shared key, or who
      // simply keeps reading correctly, is never stuck).
      if (b.propagated >= 1 || b.confirmed >= 2) progression.step = 'open';
      break;
    case 'open':
      // Reins handed over once the player has demonstrably found the loop: a few
      // coherent reads across the now-open board.
      if (b.confirmed >= 3) progression.step = 'free';
      break;
    default:
      break;
  }
}
