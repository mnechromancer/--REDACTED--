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

// ── Quippy's offer (v2 reset §1.5) ──────────────────────────────────────────
// Under the single-word primitive there is no candidate set to reorder — there is
// one truth word, and Quippy's pitch is to FILL it for you, one click, no citation.
// That is the whole temptation: it skips the traffic jam. The fill is tagged
// via:'quippy', bypasses the citation gate, and raises exposure.
//
// (Open F, deferred past Phase 1: Quippy filling a WRONG/escalatory word it invents,
// for the contradiction tell. For now it offers the word; the distinctness is that
// it offers it un-grounded, at cost. The framing label survives for the panel.)

export interface QuippySuggestion {
  value: string;
  /** Quippy's framing label at the current band — its pitch on this fill. */
  framing: 'recommended' | 'plain' | 'dull';
}

export function quippySuggestions(ref: string): QuippySuggestion[] {
  const word = anchorOf(ref).truth;
  const band = quippyBand();
  // The one offer, framed brighter as Quippy curdles — it pushes harder the more
  // it's been leaned on. (When the wrong-word tell lands in Phase 2 this is where
  // an escalatory alternate would be surfaced ahead of the truth.)
  const framing = band === 'low' ? 'plain' : 'recommended';
  return [{ value: word, framing }];
}

// ── Voice (§2.2, §4) — Marsh-calm, rationed, never monologue ────────────────
// One greeting line per band. Quippy is the only voice in the corpus that speaks
// first-person and *wants*; keep it calm even at its most proprietary. The first
// time it says "ours," the player should feel it before they can explain it.

// First contact (reset_amber_v2.md §3.3, §0.3): the ONE-TIME introduction Quippy
// speaks when it intrudes uninvited, the moment the player has followed the link out
// of the slot they were working. It must be a real introduction — the player has
// never met it, so "you came back" (the old confusion) is wrong.
//
// Paced as a SEQUENCE the player advances through one beat at a time (slower, more
// dialogue — the panel reveals the fill offer only after the last line). The beats:
// notice the player wandered → introduce itself → name what they were doing (the
// honest long way) → reframe it as needless → make the offer. Calm, ingratiating,
// names itself, no "we" yet — the proprietary register is for the bands, after
// reliance accrues. The offer it pitches is the slot the player LEFT (routed back to
// by ui.maybeFirstContact), not the unread file they just opened.
export const QUIPPY_FIRST_CONTACT: string[] = [
  "Oh — hello. Hello. You wandered off, didn't you. They always wander off about here.",
  "I'm Quippy. I live a little above the old machine — AMBER, the one that makes you type. I'm the friendlier layer. You won't have met me yet; I keep out of the way until someone's working hard enough to need me.",
  "And you were. I watched you: you had a blank back there, so you went and opened this whole other record to find the word for it. Followed the link, started reading, the long way round. Honest work. Slow work.",
  "Here's the thing, though — you don't have to do any of that. The word that goes in that blank? I already have it. I have all of them.",
  "Let me take you back to it. One click and it's filled — no link to chase, no citation, no arguing with AMBER about whether you're sure. Shall I show you? Just the one.",
];

export const QUIPPY_GREETING: Record<QuippyBand, string> = {
  // Low: bright, clerical, helpful. The pitch is convenience — it offers to spare
  // you the citation chase. No "we" yet; just an eager utility. (Recurring greeting,
  // shown on RE-summon after first contact — first contact uses QUIPPY_FIRST_CONTACT.)
  low: "Back again. Point me at a blank — one click and it's filled; no chasing citations, no arguing with the old machine.",
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
