// First-run progression: introduce the game one file and one mechanic at a time
// instead of dropping the player onto the full three-file board. Each step gates
// which files are visible and what is being taught, advancing on the player's own
// actions (first commit, first audit, first propagation). Presentation/onboarding
// only — it never touches truth, overlay, or the validation rules; it just decides
// what is shown when.
//
// VOICE (re-frame, scp_x_bible.md §2): the narrator is AMBER — the honest,
// clinical OS — NOT Quippy. The onboarding must NOT prime the player to trust the
// assistant; AMBER teaches the real verb (cite a co-carrier, commit), and Quippy
// is introduced only as the *offer* the player will be tempted by. The whole loop
// the script teaches: the easy tool reads the files for you and lets the thing
// out; learn the files well enough to read them yourself, and you starve it. The
// win is unredacting the corpus in AMBER without ever using Quippy.
//
// Sequence (the trio is authored so 001 is the hub — it opens at L1 and shares a
// concept with each of the other two, so it's the right teaching anchor):
//   boot     → AMBER comes up; the post, the redactions, the two tools named
//   restore  → only SCP-41B-001 shown; teach cite-a-co-carrier + COMMIT in AMBER
//   audit    → after first commit; teach RAISE CLEARANCE (the held copy / reveal)
//   link     → SCP-41B-002 unlocks; second carrier exists, so propagation is now
//              demonstrable; teach that a shared field stays consistent
//   open     → SCP-41B-003 unlocks; full board, the Quippy temptation named plainly
//   free     → no more scripting; normal play

import { boardState } from './game.svelte.ts';

export type Step = 'boot' | 'restore' | 'audit' | 'link' | 'open' | 'free';

// The file unlock order. v2 reset (decision C): the trio is retired; the teaching
// pair is 001 (intake, the hub) then 002 (the Concordance primer it links to). NOTE:
// this whole onboarding module — SCRIPT, clearance-audit steps, the unlock gating —
// is slated for REMOVAL in Phase 2 (handoff_reset_build.md §5); it is kept compiling
// here, with the unlock order pointed at the surviving pair, only so the Phase-1 app
// runs. Do not extend it; the real bootup/onboarding replaces it.
export const UNLOCK_ORDER = ['SCP-41B-001', 'SCP-41B-002'] as const;

export const progression = $state<{ step: Step }>({ step: 'boot' });

// ── AMBER's onboarding script ─────────────────────────────────────────────
// Staged onboarding in AMBER's own institutional voice — clinical, terse, status-
// line register (scp_x_bible.md §2.1). Each step has exposition lines and a
// standing prompt. The exposition establishes the post and the work, slowly; the
// prompt is the always-visible nudge for that step. Quippy is *named* here as the
// available shortcut but never speaks in the onboarding — the player must form
// their own distrust of it (the script does not editorialize beyond the cost).
// `tone` drives the ticker colour (idle / work / done).

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
      'AMBER — Archive Management & Batch Entry Resource. Records annex Site-41B, deep archive. Terminal active.',
      'Archivist post, low clearance. The records held under you are incomplete: fields were withheld at filing and the holding copies have degraded. A withheld field reads as a redaction bar.',
      'AMBER restores a field the slow way. You commit a value by citing the cross-reference that already carries it — another record where the same matter is on file and legible. AMBER checks the citation; an uncited or unsupported value is refused. Cost to the record: none.',
      'A second tool is resident: QUIPPY, an assistance overlay. It will fill a field on one click, no citation, no reading. It is faster. Every Quippy-assisted fill raises site exposure. AMBER does not.',
    ],
    prompt: 'The record is yours to reconstruct. Begin when ready.',
    tone: 'idle',
  },
  restore: {
    exposition: [
      'First record cleared to your tier. Its description carries several redacted fields.',
      'Select a field. The CONCORDANCE lists this slot’s candidate values and, beside them, the cross-references that carry the same matter — the other records where it is already legible. A value confirmed in one record is the citation that commits it here.',
      'Pick the candidate the cross-reference supports, cite the co-reference, and COMMIT. A supported commit is accepted at zero cost. AMBER refuses what the evidence does not carry — it will not guess for you. Quippy will. That is the difference, and the whole of it.',
    ],
    prompt: 'Select a field (███), cite the cross-reference that supports a candidate, then COMMIT.',
    tone: 'idle',
  },
  audit: {
    exposition: [
      'Committed. The field now reads as filed.',
      'Some fields cannot be reached from cross-references alone; their held value sits above your clearance. RAISE CLEARANCE to unseal the held copy at the next tier — it reveals in-tier truth for fields in open records, and a revealed value becomes a citation you can build on.',
      'Where a committed value disagrees with the held copy, the audit strikes it and shows what the copy reads. Where it agrees, the field stands confirmed. Climb deliberately: each tier you reach is more of the record you can reconstruct by hand.',
    ],
    prompt: 'RAISE CLEARANCE to unseal held values, then keep committing from the evidence.',
    tone: 'work',
  },
  link: {
    exposition: [
      'A second record has cleared. It references the same matters as the first — they share an accession lot and an audit history.',
      'When a field you commit is carried by more than one record, AMBER propagates the value to keep the corpus consistent. That is not a courtesy from any assistant — it is the cross-reference holding. A shared field you solve in one place corroborates its twin in the other.',
      'Commit a shared field and watch the linked record fall into agreement. Each solved co-carrier is one more citation for the next.',
    ],
    prompt: 'Commit a field shared across records — the linked record updates, and now cites back.',
    tone: 'idle',
  },
  open: {
    exposition: [
      'The third record is open. The cross-references now form a web: a value committed in one place can ripple through several, and each ripple is a citation you did not have before.',
      'From here the work is yours. The pull toward Quippy is strongest now — it is genuinely easier to let it read the files for you. That ease is the trap: every assist advances the thing in the records, and you can finish without a single one.',
      'Cite. Commit. Raise clearance. Reconstruct the whole record in AMBER and the loop breaks. Take the easy fills and it does not.',
    ],
    prompt: 'Reconstruct the open records in AMBER. Reach for Quippy only if you mean to pay for it.',
    tone: 'idle',
  },
  free: {
    exposition: [],
    prompt: 'Cite a cross-reference and COMMIT. RAISE CLEARANCE to unseal deeper fields. The win is the whole corpus, in AMBER, with zero Quippy.',
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
 *  - restore → audit : the player has committed at least one field
 *  - audit   → link  : the player has landed a confirmed (coherent) commit
 *  - link    → open  : a propagation has occurred (a shared field rippled)
 *  - open    → free  : the player has interacted once more on the full board
 */
export function advanceProgression(): void {
  const b = boardState();
  switch (progression.step) {
    case 'restore':
      // First commit made — teach clearance/reveal next. (Raising clearance is
      // where the player learns whether their cited read held against the copy.)
      if (b.filled >= 1) progression.step = 'audit';
      break;
    case 'audit':
      // Clearance is earned by a COHERENT read (§5.1): 002 unlocks on the first
      // CONFIRMED commit, not on activity. An uncorroborated commit is refused
      // outright by AMBER; a contradicted one reconciles but does not advance —
      // the player must cite the evidence and land a correct read. 001 has three
      // slots, so a miss is recoverable on the others.
      if (b.confirmed >= 1) progression.step = 'link';
      break;
    case 'link':
      // The propagation lesson: a correct read of a SHARED field rippling into
      // the linked record. Advance on a propagation, OR on a second confirmed
      // read anywhere (so a player who solves 002's side of a shared key, or who
      // simply keeps citing correctly, is never stuck).
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
