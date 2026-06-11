// The single rune-based game store: immutable corpus + mutable, propagating
// overlay, with the one display function derived over both. Mirrors
// technical_document.md §3. The keystone invariant (design_document.md §3):
// inference is the only spend — exposure rises on insertion, and there is no
// separate stability resource. Truth never moves; the player edits only `overlay`.

import type { Corpus, OverlayEntry, Anchor } from './corpus.ts';

// ── State ──────────────────────────────────────────────────────────────
// `corpus` is immutable after load; everything else is the mutable board state.

export const corpus = $state<Corpus>({});            // immutable after load
export const overlay = $state<Record<string, OverlayEntry>>({}); // mutable, propagating
export const clearance = $state({ tier: 1 as 1 | 2 | 3 | 4 | 5 });
export const exposure = $state({ value: 0 });
export const revealedTruth = $state<Set<string>>(new Set()); // anchor_refs whose truth has leaked
export const breaches = $state<Set<string>>(new Set());      // breached item ids

/** Replace the corpus in place (the store is a module singleton). Call once at load. */
export function loadCorpus(data: Corpus): void {
  for (const key of Object.keys(corpus)) delete corpus[key];
  Object.assign(corpus, data);
}

// ── Ref helpers ────────────────────────────────────────────────────────
// An anchor_ref is "SCP-41B-XXX#a1": item id and anchor id joined by '#'.

export function makeRef(item: string, anchorId: string): string {
  return `${item}#${anchorId}`;
}

export function splitRef(ref: string): { item: string; anchorId: string } {
  const hash = ref.indexOf('#');
  return { item: ref.slice(0, hash), anchorId: ref.slice(hash + 1) };
}

/** Resolve a ref to its immutable anchor. Throws on a malformed/dangling ref. */
export function anchorOf(ref: string): Anchor {
  const { item, anchorId } = splitRef(ref);
  const file = corpus[item];
  if (!file) throw new Error(`anchorOf: no file "${item}" for ref "${ref}"`);
  const anchor = file.anchors.find((a) => a.id === anchorId);
  if (!anchor) throw new Error(`anchorOf: no anchor "${anchorId}" in "${item}"`);
  return anchor;
}

// ── Concept cross-mentions (HelpUtility §5.3) ──────────────────────────
// Every OTHER anchor across the corpus sharing a given anchor's concept key.
// This is inference surface (b): "where else is this concept mentioned." Returns
// the bare refs; an anchor with no concept (local-only) has no cross-mentions.

export function crossMentions(ref: string): string[] {
  const anchor = anchorOf(ref);
  if (!anchor.concept) return [];
  const out: string[] = [];
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) {
      const other = makeRef(file.item, a.id);
      if (other !== ref && a.concept === anchor.concept) out.push(other);
    }
  }
  return out;
}

// ── Display ────────────────────────────────────────────────────────────
// The four-state grammar resolved per slot. The branch ladder below is copied
// verbatim from §3 — the ORDER of these branches IS the state precedence and is
// load-bearing. §3 shows it wrapped in `$derived.by`, but Svelte 5 only allows
// `$derived` as a declaration initializer, not a function return; so the ladder
// lives in this pure `resolveSlot`, and reactive callers wrap it (components do
// `const slot = $derived(resolveSlot(ref))`). The reads of `overlay`,
// `revealedTruth`, and the anchor are tracked exactly as if inlined into the
// `$derived`, so fine-grained recomputation is preserved.

export interface DisplayedSlot {
  text: string;
  state: 'redacted' | 'inserted' | 'propagated' | 'revealed' | 'truth-contradiction';
  guess?: string;
  caused_by?: string;
}

export function resolveSlot(ref: string): DisplayedSlot {
  const o = overlay[ref];
  const truthShown = revealedTruth.has(ref);
  const anchor = anchorOf(ref);
  if (truthShown && o && o.value !== anchor.truth)
    return { text: anchor.truth, state: 'truth-contradiction', guess: o.value };
  if (truthShown) return { text: anchor.truth, state: 'revealed' };
  if (o?.source === 'propagated') return { text: o.value, state: 'propagated', caused_by: o.caused_by };
  if (o?.source === 'inserted')  return { text: o.value, state: 'inserted' };
  return { text: '█████', state: 'redacted' };
}

// ── Propagation (C6, §4) ───────────────────────────────────────────────
// Concept-keyed cross-file mutation. Anchors sharing a concept carry parallel,
// index-aligned mutation sets (enforced as a build-time invariant), so choosing
// candidate k in one yields candidate k in every linked anchor. The mapping is
// therefore purely positional and deterministic.

/** Factor applied to a propagated carrier's exposure weight (§4 step 4). */
export const PROPAGATION_FACTOR = 1;

/**
 * Map a chosen value at `sourceRef` to the index-aligned candidate in `target`.
 * Returns undefined if the source value is not in the source's set (should never
 * happen for a validated insert) — callers skip undefined rather than guess.
 */
export function mapMutation(sourceRef: string, target: Anchor): string | undefined {
  const k = anchorOf(sourceRef).mutations.indexOf(currentChosenValue(sourceRef));
  if (k < 0 || k >= target.mutations.length) return undefined;
  return target.mutations[k];
}

/** The value most recently chosen at a ref (the overlay value). */
function currentChosenValue(ref: string): string {
  return overlay[ref]?.value ?? '';
}

// ── Insertion (single-file write + propagation) ────────────────────────
// Commit a player's chosen candidate into the overlay, charge exposure, then
// propagate across every other carrier of the slot's concept. Recomputed from
// the immutable corpus each call, so re-inserting the same value is a no-op and
// no drift accumulates (§4 "idempotent re-evaluation").

/** True when the overlay already holds exactly this inserted value at this slot. */
function alreadyInserted(ref: string, value: string): boolean {
  const o = overlay[ref];
  return o?.source === 'inserted' && o.value === value;
}

export function insert(ref: string, value: string): void {
  // Reject free text: only authored candidates may enter the overlay (§5.4,
  // CLAUDE.md invariant 3). The parser/UI maps near-misses to a candidate before
  // calling insert; by the time we are here, `value` must be in the set.
  const anchor = anchorOf(ref);
  if (!anchor.mutations.includes(value)) {
    throw new Error(`insert: "${value}" is not an authored candidate for ${ref}`);
  }

  if (alreadyInserted(ref, value)) return; // idempotent re-insert: no recompute needed

  // 1. Write the inserted value.
  overlay[ref] = { anchor_ref: ref, value, source: 'inserted' };

  // 2. Propagate to every other carrier of this concept, index-aligned. We
  //    overwrite any prior propagated entry at the target (re-evaluation from
  //    the immutable corpus), so changing the source value moves all carriers
  //    rather than layering edits. But we never overwrite a slot the player
  //    has independently *inserted*: that slot is its own source of truth, not
  //    a sink. Since HelpUtility offers candidates on every slot (including
  //    propagated carriers), a direct edit to a carrier would otherwise
  //    propagate back and silently demote the original insert to 'propagated',
  //    inverting provenance. Skipping inserted targets keeps each player edit
  //    player-owned and makes editing one carrier of a 3+ slot concept leave
  //    its independently-set peers intact.
  if (anchor.concept) {
    for (const targetRef of crossMentions(ref)) {
      if (overlay[targetRef]?.source === 'inserted') continue; // player-owned: never clobber
      const target = anchorOf(targetRef);
      const mutation = mapMutation(ref, target);
      if (mutation === undefined) continue; // unmappable index: skip, never guess
      overlay[targetRef] = {
        anchor_ref: targetRef,
        value: mutation,
        source: 'propagated',
        caused_by: ref,
      };
    }
  }

  // 3. Exposure is the sum of every live edit's weight, recomputed from the
  //    overlay — never incrementally accumulated. This is the §4 no-drift
  //    guarantee made structural: re-inserting or changing a value can only
  //    move exposure to whatever the current overlay implies, never ratchet it.
  recomputeExposure();
}

// ── Batched validation (C7, §5) ────────────────────────────────────────
// Raising clearance unlocks ground-truth in BATCHES keyed to the tier — never
// one slot at a time, never per-guess. This is the rule-of-three anti-brute-
// force logic (§5.7): the system confirms whether an *already-inserted* guess
// coheres or contradicts; it never volunteers the value of a slot whose tier the
// player has not yet reached. A slot at redaction_level 4 stays redacted until
// clearance reaches 4 — reaching that tier is the legitimate reveal, not a leak.

/**
 * Raise clearance to `toTier` and reveal the batch of truths it unlocks: every
 * anchor whose redaction_level is now within reach and whose truth has not yet
 * leaked. For each newly-revealed slot that the player has already guessed, flag
 * whether that guess contradicts the truth (surfaces as 'truth-contradiction').
 * Lowering or holding the tier reveals nothing new. Returns the refs revealed.
 */
export function raiseClearance(toTier: 1 | 2 | 3 | 4 | 5): string[] {
  if (toTier > clearance.tier) clearance.tier = toTier;

  const batch: string[] = [];
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) {
      const ref = makeRef(file.item, a.id);
      if (a.redaction_level <= clearance.tier && !revealedTruth.has(ref)) {
        batch.push(ref);
      }
    }
  }

  for (const ref of batch) {
    revealedTruth.add(ref);
    const o = overlay[ref];
    if (o && o.value !== anchorOf(ref).truth) {
      o.contradicts_truth = true; // resolveSlot already derives the diff state
    }
  }
  return batch;
}

/**
 * Exposure as a pure function of the current overlay: each live overlay entry
 * contributes its anchor's exposure_weight (propagated carriers scaled by
 * PROPAGATION_FACTOR). Keeps the keystone invariant — inference is the only
 * spend — and structurally prevents accumulated drift across re-insertions.
 */
export function recomputeExposure(): void {
  let total = 0;
  for (const [ref, entry] of Object.entries(overlay)) {
    const weight = anchorOf(ref).exposure_weight;
    total += entry.source === 'propagated' ? weight * PROPAGATION_FACTOR : weight;
  }
  exposure.value = total;
}
