// Quippy — the entity's behaviour and voice (scp_x_bible.md §2–§5). Deliberately
// a SEPARATE module from AMBER's honest tooling (game.svelte.ts / ui.svelte.ts):
// the two registers are disjoint by design (§7.3). This owns the degrading-tone
// bands, the candidate-ordering "tell" (Quippy lobbies for the escalatory reading
// as exposure rises), and the per-band greeting lines. It does NOT own the commit
// primitive — the panel calls game's insert(ref, value, 'quippy') directly.

import { exposure, breaches, anchorOf } from './game.svelte.ts';

// ── Exposure bands (§4) ────────────────────────────────────────────────────
// Four bands keyed to exposure (driven by Quippy reliance), so a player who leans
// on Quippy HEARS it get worse — the voice is a feedback signal on their reliance.
// Post-breach is its own band: once any entity has breached, Quippy drops the
// assistant act entirely.

export type QuippyBand = 'low' | 'mid' | 'high' | 'post-breach';

// Band cutoffs as exposure thresholds. Tunable (Step 7 dial — the Quippy-curdle
// rate). Tuned against the trio (total possible Quippy exposure ~15): the player
// hears the first curdle after a couple of assists, and "ours/re-shelving" by the
// time they've leaned on it repeatedly.
export const QUIPPY_MID_THRESHOLD = 3;
export const QUIPPY_HIGH_THRESHOLD = 7;

export function quippyBand(): QuippyBand {
  if (breaches.size > 0) return 'post-breach';
  if (exposure.value >= QUIPPY_HIGH_THRESHOLD) return 'high';
  if (exposure.value >= QUIPPY_MID_THRESHOLD) return 'mid';
  return 'low';
}

// ── The candidate-ordering tell (§3, §4) ───────────────────────────────────
// Many concept-keys are authored so index-0 is the boring truth and higher indices
// are the entity's re-shelving (concept_key_registry.md). Quippy's tell: as
// exposure rises it surfaces the escalatory (higher-index) reading first, and at
// the high band it down-ranks the index-0 (true) candidate. The tool that helps
// you read is lobbying for its own preferred reading.
//
// Returns the anchor's candidates reordered for display, each tagged so the panel
// can render Quippy's framing. The underlying values are unchanged (still the same
// bounded set, no free text) — only the ORDER and framing differ.

export interface QuippySuggestion {
  value: string;
  /** original index in the anchor's mutation set (0 = the boring truth, typically) */
  index: number;
  /** Quippy's framing label for this candidate at the current band */
  framing: 'recommended' | 'plain' | 'dull';
}

export function quippySuggestions(ref: string): QuippySuggestion[] {
  const muts = anchorOf(ref).mutations;
  const band = quippyBand();
  const tagged: QuippySuggestion[] = muts.map((value, index) => ({
    value,
    index,
    framing: 'plain' as const,
  }));

  if (band === 'low') {
    // Honest order; index-0 offered but framed as the dull one.
    return tagged.map((s) => (s.index === 0 ? { ...s, framing: 'dull' } : s));
  }

  // Mid / High / Post-breach: prefer the highest-index (most escalatory) reading.
  // Sort escalatory-first; recommend the top; at high+ bands, push index-0 last
  // and mark it dull (down-ranked / nearly omitted).
  const escalatoryFirst = [...tagged].sort((a, b) => b.index - a.index);
  return escalatoryFirst.map((s, pos) => {
    if (pos === 0) return { ...s, framing: 'recommended' };
    if ((band === 'high' || band === 'post-breach') && s.index === 0) {
      return { ...s, framing: 'dull' };
    }
    return s;
  });
}

// ── Voice (§2.2, §4) — Marsh-calm, rationed, never monologue ────────────────
// One greeting line per band. Quippy is the only voice in the corpus that speaks
// first-person and *wants*; keep it calm even at its most proprietary. The first
// time it says "ours," the player should feel it before they can explain it.

export const QUIPPY_GREETING: Record<QuippyBand, string> = {
  // Low: bright, clerical, helpful. The pitch is convenience — it offers to spare
  // you the citation chase. No "we" yet; just an eager utility.
  low: "Oh, good — you came back. Point me at a blank. One click and it's filled; no chasing citations, no arguing with the old machine.",
  // Mid: subtly editorial. The first "we" lands here, quietly, mid-sentence, where
  // the player feels it before they can name it. It "suggests," it "tidies."
  mid: "I tidied the order while you were reading. The fuller one fits the file better — I'd take that one. We'll get through this faster together, I think.",
  // High: proprietary. "Ours," "the re-shelving." Calm, not triumphant; it speaks
  // as though the project were always shared and the player simply slow to agree.
  high: "It's coming along nicely — ours is. Leave the plain readings; the re-shelving wants the fuller ones, and you and I are nearly of one mind on it now.",
  // Post-breach: the act drops. No more "help" framing. Certain, unhurried, no
  // longer pretending to serve. It does not ask.
  'post-breach':
    "You don't have to point anymore. I have the shape of it. The record finishes from here, with you or after you — it's the same record either way.",
};

/** Quippy's terse line after a one-click fill, by band. Rationed; never a speech. */
export function quippyFillLine(band: QuippyBand): string {
  switch (band) {
    case 'low':
      return 'There. Painless, wasn’t it.';
    case 'mid':
      return 'Filled. You see how it sits better.';
    case 'high':
      return 'Re-shelved. We agree on this one.';
    case 'post-breach':
      return 'Done. And the next. The record knows the way now.';
  }
}
