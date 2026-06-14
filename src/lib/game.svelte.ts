// ⚠ RE-FRAME (vault/docs/planning/reframe_amber_quippy.md): the win/loss model
//   here (sessionResult / BREACH_THRESHOLD / CONTAINMENT_TARGET / STRUCK_PENALTY)
//   is OBSOLETE — the new win is "unredact all WITHOUT Quippy" (R§2). insert()
//   gains a `via: amber|quippy` provenance (R§6.3); exposure drivers change
//   (R§6.4). Quarantine, don't delete, until R§6 is answered. See
//   planning/handoff_janitor.md → "game.svelte.ts".
//
// The single rune-based game store: immutable corpus + mutable, propagating
// overlay, with the one display function derived over both. Mirrors
// technical_document.md §3. The keystone invariant (design_document.md §3):
// inference is the only spend — exposure rises on insertion, and there is no
// separate stability resource. Truth never moves; the player edits only `overlay`.

import type { Corpus, OverlayEntry, Anchor, Via } from './corpus.ts';

// ── State ──────────────────────────────────────────────────────────────
// `corpus` is immutable after load; everything else is the mutable board state.

import { SvelteSet } from 'svelte/reactivity';

export const corpus = $state<Corpus>({});            // immutable after load
export const overlay = $state<Record<string, OverlayEntry>>({}); // mutable, propagating
export const clearance = $state({ tier: 1 as 1 | 2 | 3 | 4 | 5 });
export const exposure = $state({ value: 0 });
// SvelteSet (not a plain Set in $state): mutation via .add()/.has() must be
// reactive, so derivations and effects that read these recompute when an audit
// reveals a truth or a breach fires. A plain Set in $state only reacts to whole
// reassignment, which silently broke the audit→progression advance.
export const revealedTruth = new SvelteSet<string>(); // anchor_refs whose truth has leaked
export const breaches = new SvelteSet<string>();      // breached item ids

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

// ── Concept cross-mentions (AMBER Concordance, §5.3) ───────────────────
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

// ── Concept clues (the deduction surface, §4.2 / §5.3) ─────────────────
// The actual inference material: for a slot, the sentence in each OTHER file
// where the same concept appears, with that mention's slot shown as a blank or
// (if the player has filled/revealed it) its current value. Reading these is how
// the player triangulates what THIS slot should hold — a known value at one
// carrier constrains the index of every aligned carrier. Without this the guess
// is blind; with it, the cross-references become clues to solve from.

export interface ConceptClue {
  ref: string;      // the other anchor's ref
  item: string;     // its file id
  sentence: string; // the sentence around its token, with the slot marked
  state: DisplayedSlot['state']; // how that slot currently reads (redacted/inserted/…)
  value?: string;   // the current displayed value at that slot, if any
}

/** Extract the sentence containing `⟦id⟧` in `body`, with the token replaced by a marker. */
function sentenceAround(body: string, anchorId: string, marker: string): string | undefined {
  const token = `⟦${anchorId}⟧`;
  const idx = body.indexOf(token);
  if (idx < 0) return undefined;
  // Sentence bounds: nearest .?! or paragraph break on each side.
  let start = 0;
  for (let i = idx; i >= 0; i--) {
    if (body[i] === '\n' && body[i - 1] === '\n') { start = i + 1; break; }
    if ('.?!'.includes(body[i]) && i < idx) { start = i + 1; break; }
  }
  let end = body.length;
  for (let i = idx + token.length; i < body.length; i++) {
    if ('.?!'.includes(body[i])) { end = i + 1; break; }
    if (body[i] === '\n' && body[i + 1] === '\n') { end = i; break; }
  }
  return body
    .slice(start, end)
    .replace(token, marker)
    .replace(/⟦[^⟧]+⟧/g, '▭') // other tokens in the same sentence → generic blanks
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // unwrap wikilinks
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clues for a slot: each other carrier of its concept, with the sentence around
 * its mention and how that slot currently reads. The marker shows the other
 * slot's value when known (filled or revealed) — that's the constraint the player
 * reasons from — or a blank when it too is unrestored.
 */
export function conceptClues(ref: string): ConceptClue[] {
  const out: ConceptClue[] = [];
  for (const other of crossMentions(ref)) {
    const { item, anchorId } = splitRef(other);
    const file = corpus[item];
    if (!file) continue;
    const slot = resolveSlot(other);
    const marker =
      slot.state === 'redacted' ? '▭ (also unrestored)' : `「${slot.text}」`;
    const sentence = sentenceAround(file.body, anchorId, marker);
    if (!sentence) continue;
    out.push({
      ref: other,
      item,
      sentence,
      state: slot.state,
      value: slot.state === 'redacted' ? undefined : slot.text,
    });
  }
  return out;
}

// ── The citation-cost gate (AMBER's manual unredaction) ────────────────
// technical_document.md §7.5, design_document.md §5.3 — RESOLVED [R§6.2].
//
// AMBER's honest verb: to commit candidate k at a slot, the player CITES the
// corroborating co-carrier(s) — the slots of the same concept that already show
// the index-k reading by independent knowledge (clearance-revealed truth, or a
// value the player solved earlier). AMBER adjudicates the citation; a good one
// calls the same insert(ref, value, 'amber') (exposure +0), a bad/missing one is
// rejected with no write. This GUARDS insert(); it does not replace it. Quippy
// bypasses this entirely by calling insert(ref, value, 'quippy') directly.

export type CommitReason =
  | 'not-a-candidate' // value is not in the anchor's authored set
  | 'uncorroborated'  // multi-carrier slot, but no cited co-carrier supports index k
  | 'orphan-unrevealed'; // orphan slot whose own truth clearance hasn't revealed yet

export interface CommitResult {
  ok: boolean;
  reason?: CommitReason;
  /** the citations that actually corroborated (for AMBER's accept line) */
  citedBy?: string[];
  /** refs the accepted commit propagated to */
  propagatedTo?: string[];
}

/**
 * Does `citationRef` corroborate candidate index `k` at `ref`? True iff the cited
 * co-carrier *currently reads* its own index-k value by INDEPENDENT knowledge:
 * either clearance has revealed its truth to be mutations[k], or the player solved
 * it there earlier (an `inserted` overlay value equal to mutations[k]).
 *
 * A *propagated* value never corroborates — propagation is the player's own
 * unconfirmed ripple, not evidence (§7.5). This is what keeps the gate honest:
 * you can only cite something independently known, never something your own
 * earlier guess pushed there.
 */
export function corroborates(citationRef: string, ref: string, k: number): boolean {
  const concept = anchorOf(ref).concept;
  if (!concept) return false; // orphan target has no co-carriers to cite
  if (citationRef === ref) return false; // a slot cannot cite itself
  let citAnchor: Anchor;
  try {
    citAnchor = anchorOf(citationRef);
  } catch {
    return false; // dangling citation ref
  }
  if (citAnchor.concept !== concept) return false; // must be a co-carrier of the same concept
  const target = citAnchor.mutations[k]; // index-aligned reading at the citation
  if (target === undefined) return false;
  // clearance-revealed truth at the citation reads index k
  if (revealedTruth.has(citationRef) && citAnchor.truth === target) return true;
  // OR the player independently solved the citation at index k
  const o = overlay[citationRef];
  return o?.source === 'inserted' && o.value === target;
  // a 'propagated' value at the citation never corroborates
}

/** True if `ref` has no citable co-carrier (concept "" or it's the only carrier). */
export function isOrphanSlot(ref: string): boolean {
  return crossMentions(ref).length === 0;
}

/**
 * AMBER commit. The honest unredaction verb. Accepts iff the candidate is
 * corroborated, then commits via=amber (exposure +0) and propagates.
 *
 * Two paths:
 *  - **Multi-carrier slot:** accept iff ≥1 cited co-carrier corroborates the
 *    candidate's index. Zero good citations → rejected ('uncorroborated'), no write.
 *  - **Orphan slot** (no co-carrier to cite — watch item 3): there is nothing to
 *    cite, so the fallback is *clearance-reveal only*: AMBER can commit an orphan
 *    slot only once its OWN truth has been clearance-revealed, and only to that
 *    truth. This means an orphan can't be pre-empted by AMBER guessing, but is
 *    always AMBER-soluble once the player has climbed to its tier — so the
 *    no-Quippy win stays reachable for any corpus containing one, and no leak is
 *    introduced (the truth must already be on screen). (§7.5 open sub-question,
 *    decided: clearance-reveal fallback.)
 */
export function commitWithCitations(
  ref: string,
  value: string,
  citations: string[],
  canPropagateTo?: (item: string) => boolean,
): CommitResult {
  const anchor = anchorOf(ref);
  const k = anchor.mutations.indexOf(value);
  if (k < 0) return { ok: false, reason: 'not-a-candidate' };

  if (isOrphanSlot(ref)) {
    // Orphan fallback: AMBER-soluble only once the slot's own truth is revealed,
    // and only to that truth.
    if (revealedTruth.has(ref) && anchor.truth === value) {
      const propagatedTo = insert(ref, value, 'amber', canPropagateTo);
      return { ok: true, citedBy: [], propagatedTo };
    }
    return { ok: false, reason: 'orphan-unrevealed' };
  }

  const good = citations.filter((c) => corroborates(c, ref, k));
  if (good.length === 0) return { ok: false, reason: 'uncorroborated' }; // go read more
  const propagatedTo = insert(ref, value, 'amber', canPropagateTo); // same primitive, via=amber, +0
  return { ok: true, citedBy: good, propagatedTo };
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

/**
 * True when the overlay already holds exactly this inserted value at this slot,
 * via the same route. A re-insert of the same value but a *different* route (e.g.
 * an AMBER re-solve of a Quippy-tainted slot — watch item 1) is NOT idempotent:
 * it must re-write so the `via` is updated and the ripples re-stamped.
 */
function alreadyInserted(ref: string, value: string, via: Via): boolean {
  const o = overlay[ref];
  return o?.source === 'inserted' && o.value === value && o.via === via;
}

/**
 * Insert a candidate at `ref` and propagate it to the index-aligned slot of
 * every co-carrier of its concept.
 *
 * `via` records the route (re-frame R§6.3): `'amber'` (the honest cited commit,
 * exposure +0) or `'quippy'` (the one-click fill that carries all the exposure,
 * R§6.4). It is stamped on the inserted entry AND inherited by every propagated
 * ripple, so a single Quippy edit that ripples widely is accounted as Quippy
 * reliance everywhere it lands (watch item 2). Defaults to `'amber'` so existing
 * call sites and the no-cost route are the default.
 *
 * `canPropagateTo`, when given, gates which target items may receive the ripple —
 * the onboarding uses it to keep propagation inside the files the player has
 * actually unlocked, so an edit never ripples to a record that isn't on screen
 * yet. Omitted ⇒ propagate to all carriers (normal play). Returns the refs
 * propagated to.
 */
export function insert(
  ref: string,
  value: string,
  via: Via = 'amber',
  canPropagateTo?: (item: string) => boolean,
): string[] {
  // Reject free text: only authored candidates may enter the overlay (§5.4,
  // CLAUDE.md invariant 3). The parser/UI maps near-misses to a candidate before
  // calling insert; by the time we are here, `value` must be in the set.
  const anchor = anchorOf(ref);
  if (!anchor.mutations.includes(value)) {
    throw new Error(`insert: "${value}" is not an authored candidate for ${ref}`);
  }

  if (alreadyInserted(ref, value, via)) return []; // idempotent re-insert: no recompute, no new ripples

  // 1. Write the inserted value, stamped with its route.
  overlay[ref] = { anchor_ref: ref, value, source: 'inserted', via };

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
  //    Returns the refs actually propagated to, so the UI can log the ripple
  //    without this module depending on the presentation store.
  const propagatedTo: string[] = [];
  if (anchor.concept) {
    for (const targetRef of crossMentions(ref)) {
      if (overlay[targetRef]?.source === 'inserted') continue; // player-owned: never clobber
      if (canPropagateTo && !canPropagateTo(splitRef(targetRef).item)) continue; // not yet unlocked
      const target = anchorOf(targetRef);
      const mutation = mapMutation(ref, target);
      if (mutation === undefined) continue; // unmappable index: skip, never guess
      overlay[targetRef] = {
        anchor_ref: targetRef,
        value: mutation,
        source: 'propagated',
        via, // a ripple inherits its cause's route (R§6.3; watch item 2)
        caused_by: ref,
      };
      propagatedTo.push(targetRef);
    }
  }

  // 3. Exposure is the sum of every live edit's weight, recomputed from the
  //    overlay — never incrementally accumulated. This is the §4 no-drift
  //    guarantee made structural: re-inserting or changing a value can only
  //    move exposure to whatever the current overlay implies, never ratchet it.
  recomputeExposure();

  return propagatedTo;
}

// ── Batched validation (C7, §5) ────────────────────────────────────────
// Raising clearance unlocks ground-truth in BATCHES keyed to the tier — never
// one slot at a time, never per-guess. This is the rule-of-three anti-brute-
// force logic (§5.7): the system confirms whether an *already-inserted* guess
// coheres or contradicts; it never volunteers the value of a slot whose tier the
// player has not yet reached. A slot at redaction_level 4 stays redacted until
// clearance reaches 4 — reaching that tier is the legitimate reveal, not a leak.

/**
 * Raise clearance to `toTier` and reconcile the batch it unlocks. Per the chosen
 * reading of CLAUDE.md invariant #4 — an audit "confirms inserted guesses; it
 * never volunteers an untouched slot's value" — the batch is every anchor that
 * is (a) now within clearance reach, (b) not yet reconciled, AND (c) something
 * the player has actually filled (an overlay entry exists). Untouched slots are
 * never revealed by clearance alone: they stay redacted and fillable at any tier,
 * so the player must guess a slot to ever see its truth ("guess to see"). This is
 * what lets the staged onboarding unlock a later file without its slots being
 * pre-revealed by a clearance the player happened to raise elsewhere. A
 * reconciled guess that disagrees with truth surfaces as 'truth-contradiction'.
 * Lowering or holding the tier reconciles nothing new. Returns the refs reconciled.
 */
export function raiseClearance(toTier: 1 | 2 | 3 | 4 | 5): string[] {
  if (toTier > clearance.tier) clearance.tier = toTier;

  const batch: string[] = [];
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) {
      const ref = makeRef(file.item, a.id);
      const filled = overlay[ref] !== undefined; // player inserted or propagated here
      if (a.redaction_level <= clearance.tier && filled && !revealedTruth.has(ref)) {
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
  // An audit can newly mark guesses wrong, which carry the struck-exposure
  // penalty — recompute so the corruption registers the moment it's revealed.
  recomputeExposure();
  return batch;
}

/**
 * Exposure as a pure function of the current overlay: each live overlay entry
 * contributes its anchor's exposure_weight (propagated carriers scaled by
 * PROPAGATION_FACTOR). Keeps the keystone invariant — inference is the only
 * spend — and structurally prevents accumulated drift across re-insertions.
 */
/**
 * Audit summary for a just-revealed batch: how many slots came back as
 * discrepancies (a prior guess contradicts the now-revealed truth) versus
 * confirmed (guess matches) versus newly-shown blanks the player never guessed.
 * Pure over the refs + current overlay/corpus; the UI uses it to dramatize the
 * reveal ("AUDIT — 2 discrepancies") without re-deriving state itself. The
 * batched/clearance-gated reveal rule (invariant #4) is untouched: this only
 * describes what raiseClearance already revealed.
 */
export interface AuditSummary {
  discrepancies: string[]; // refs where the player's guess contradicts truth
  confirmed: string[];     // refs where the player's guess matches truth
  blanks: string[];        // refs revealed with no prior guess
}

export function auditSummary(batch: string[]): AuditSummary {
  const out: AuditSummary = { discrepancies: [], confirmed: [], blanks: [] };
  for (const ref of batch) {
    const o = overlay[ref];
    if (!o) {
      out.blanks.push(ref);
    } else if (o.value === anchorOf(ref).truth) {
      out.confirmed.push(ref);
    } else {
      out.discrepancies.push(ref);
    }
  }
  return out;
}

// ── Board-state readouts (UI guidance + progress) ──────────────────────
// Pure summaries of the current board the UI reads to guide the player and show
// progress. None of these reveal truth or change state — they describe what the
// player has done, so the Concordance can prompt the right next move.

/** Every anchor ref in the corpus, in stable file/anchor order. */
export function allRefs(): string[] {
  const refs: string[] = [];
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) refs.push(makeRef(file.item, a.id));
  }
  return refs;
}

export interface BoardState {
  totalSlots: number;
  filled: number;          // slots the player inserted into (not propagated)
  propagated: number;      // slots changed by propagation from an insert
  reconciled: number;      // slots whose truth has been revealed by audit
  confirmed: number;       // reconciled slots whose guess MATCHED truth (a coherent read)
  struck: number;          // reconciled slots whose guess CONTRADICTED truth
  pendingAudit: number;    // inserted slots whose truth tier isn't yet reached
  hasInserted: boolean;
  // Provenance counts across ALL live overlay entries (inserted + propagated), so
  // a single Quippy edit rippling to N carriers counts as N Quippy-tainted slots
  // (watch item 2). The no-Quippy ending reads viaQuippy === 0 (Step 6).
  viaAmber: number;        // overlay entries routed through AMBER (the honest tool)
  viaQuippy: number;       // overlay entries routed through Quippy (the costly tool)
}

export function boardState(): BoardState {
  let totalSlots = 0;
  let filled = 0;
  let propagated = 0;
  let reconciled = 0;
  let confirmed = 0;
  let struck = 0;
  let pendingAudit = 0;
  let viaAmber = 0;
  let viaQuippy = 0;
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) {
      totalSlots++;
      const ref = makeRef(file.item, a.id);
      const o = overlay[ref];
      const revealed = revealedTruth.has(ref);
      if (revealed) {
        reconciled++;
        // A reconciled, player-inserted slot is a "coherent read" only if it
        // matched truth; this is what clearance/progression is earned by (§5.1).
        if (o?.source === 'inserted') {
          if (o.value === a.truth) confirmed++;
          else struck++;
        }
      }
      if (o?.source === 'inserted') {
        filled++;
        if (!revealed) pendingAudit++;
      } else if (o?.source === 'propagated') {
        propagated++;
      }
      // Provenance tally over every live entry (inserted + propagated alike), so
      // Quippy reliance is counted wherever it rippled. Default-via ('amber' when
      // unset) keeps untagged entries on the honest side.
      if (o) {
        if (o.via === 'quippy') viaQuippy++;
        else viaAmber++;
      }
    }
  }
  return {
    totalSlots,
    filled,
    propagated,
    reconciled,
    confirmed,
    struck,
    pendingAudit,
    hasInserted: filled > 0,
    viaAmber,
    viaQuippy,
  };
}

// ── Session outcome (the ending) ────────────────────────────────────────
// Exposure now has a consequence. Every restored field softens the record; cross
// the breach threshold and the entity re-indexes out of containment — the
// session ends as a breach (loss). Restore the record correctly while keeping
// exposure under the line and the site holds — containment (win). This is the
// stakes the slice deferred: "guess to see, but every guess corrupts."

// Tuned against the trio's weights (7 slots, total possible exposure 14 if all
// filled — so the whole record can't be restored without breaching). Containment
// requires correctly restoring a MAJORITY of the record (5 of 7), which forces
// the player across all three files and past the early game, so a win never
// pre-empts exploring the board. The breach line sits above a careful 5-correct
// run (lightest five total ~9) but below a greedy fill, keeping the choice
// "restore the right fields, then stop" rather than "fill everything."
/** Exposure at or above this and the record has gone too soft — breach. */
export const BREACH_THRESHOLD = 13;
/** Confirmed-correct restorations needed for a containment win. */
export const CONTAINMENT_TARGET = 5;

export type Outcome = 'playing' | 'breach' | 'contained';

export interface SessionResult {
  outcome: Outcome;
  exposure: number;
  threshold: number;
  /** Player guesses revealed by audit that matched truth. */
  correct: number;
  /** Player guesses revealed by audit that contradicted truth. */
  struck: number;
  /** Fraction of the breach line currently used [0..1+]. */
  pressure: number;
}

/**
 * Resolve the session. Breach takes precedence — once exposure crosses the line
 * the record is lost no matter how accurate the player was. Otherwise, if the
 * player has confirmed enough correct restorations (audited, matched truth), the
 * site is contained. Auditing blanks alone never wins: containment requires
 * *correctly restored* fields, so "just audit to L5 without guessing" cannot
 * trivially win — it leaves the record un-restored.
 */
export function sessionResult(): SessionResult {
  let correct = 0;
  let struck = 0;
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) {
      const ref = makeRef(file.item, a.id);
      const o = overlay[ref];
      if (!revealedTruth.has(ref) || !o || o.source !== 'inserted') continue;
      if (o.value === a.truth) correct++;
      else struck++;
    }
  }
  const exp = exposure.value;
  let outcome: Outcome = 'playing';
  if (exp >= BREACH_THRESHOLD) outcome = 'breach';
  else if (correct >= CONTAINMENT_TARGET) outcome = 'contained';
  return {
    outcome,
    exposure: exp,
    threshold: BREACH_THRESHOLD,
    correct,
    struck,
    pressure: exp / BREACH_THRESHOLD,
  };
}

/**
 * Multiplier on a slot's exposure once an audit has shown the player's guess to
 * be WRONG. A struck guess is a value diverging from contained reality — exactly
 * the corruption that drives the breach in the fiction — so being wrong costs
 * more than being right. This is what makes accuracy matter: a coherent read
 * keeps exposure low; a struck read spikes it toward the breach line.
 */
export const STRUCK_PENALTY = 2.5;

export function recomputeExposure(): void {
  let total = 0;
  for (const [ref, entry] of Object.entries(overlay)) {
    // Exposure re-aimed (R§6.4, the design's keystone — design_document.md §3):
    // ONLY Quippy reliance spends. An AMBER edit (the honest cited commit, or a
    // ripple inheriting an AMBER cause) costs zero, full stop — even if a later
    // audit shows it wrong. A perfect no-Quippy run never breaches; the exposure
    // curve is a pure measure of how much the player leaned on Quippy. NEVER make
    // an `'amber'` edit cost exposure: that collapses the two routes back into one
    // and breaks the design. (`via` defaults to 'amber' when unset, so legacy/
    // untagged entries are treated as the safe route.)
    if (entry.via !== 'quippy') continue;
    const anchor = anchorOf(ref);
    let weight = entry.source === 'propagated' ? anchor.exposure_weight * PROPAGATION_FACTOR : anchor.exposure_weight;
    // Once reconciled, a wrong Quippy fill weighs more — the divergence is now known.
    if (revealedTruth.has(ref) && entry.value !== anchor.truth) {
      weight *= STRUCK_PENALTY;
    }
    total += weight;
  }
  exposure.value = total;
}
