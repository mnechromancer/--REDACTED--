// Win/loss model (re-frame R§2, built & shipped — reframe_amber_quippy.md §6/§7):
//   the win is "unredact the whole corpus WITHOUT Quippy." endState() reads that
//   from per-overlay `via: amber|quippy` provenance — any Quippy assist or surviving
//   contradiction forecloses the true ending (scp_x_bible.md §5). The self-file is
//   EXCLUDED from the restoration target (§5.4). BREACH_THRESHOLD (the exposure line
//   a breach crosses) and STRUCK_PENALTY (contradiction exposure weight) are the
//   LIVE exposure model — only Quippy spends; AMBER commits cost zero (R§6.4).
//   (The old single-interface win symbols `sessionResult` / `CONTAINMENT_TARGET`
//   were removed when the mechanic landed; do not reintroduce a thread_coherence-style
//   win checker — the win reads provenance, not key coherence.)
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
export const exposure = $state({ value: 0 });
// SvelteSet (not a plain Set in $state): mutation via .add()/.has() must be
// reactive, so derivations and effects that read these recompute when a breach
// fires. A plain Set in $state only reacts to whole reassignment.
export const breaches = new SvelteSet<string>();      // breached item ids

// PERMANENT Quippy taint (user decision 2026-06-17): any slot EVER filled or rippled
// via Quippy is recorded here and never cleared — no redemption. The no-Quippy true
// ending requires this set be empty (you cannot launder Quippy's help into a clean
// record by AMBER-re-citing a word Quippy taught you; the help already happened). This
// supersedes the old watch-item-1 redemption, where an AMBER re-solve cleared taint.
export const quippyTouched = new SvelteSet<string>(); // anchor_refs ever touched by Quippy

// ── Reachability (v2 reset — replaces clearance, decision D) ───────────────
// Pure-graph gating: a file is reachable iff its inbound citations are reachable.
// `seedReachable` is the opening file(s) the bootup hands the player; a file becomes
// reachable when a reachable file links to it (xrefs) — the player can follow the
// link to read it. There is no clearance tier; the citation graph is the only gate.
// Kept minimal for the teaching pair: seed = the opening file, and following its
// xref opens the linked file. The general topological solver is Phase 5 (the graph
// view) — do not build it before the pair proves the primitive.
export const seedReachable = new SvelteSet<string>(); // item ids handed to the player at start

/** Mark `item` as a starting (seed) reachable file. Call at load for the opening file(s). */
export function seedReach(item: string): void {
  seedReachable.add(item);
}

/**
 * The set of reachable file ids: the seed plus every file reachable by following
 * xrefs outward from a reachable file (transitive closure over the xref graph).
 * A file with no inbound path from a seed is unreachable — its slots can't yet be
 * cited and its body can't yet ground anything. With the teaching pair this is
 * "seed = 001; 001 xrefs 002; so {001, 002} are reachable."
 */
export function reachableFiles(): Set<string> {
  const reached = new Set<string>(seedReachable);
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of [...reached]) {
      const file = corpus[item];
      if (!file) continue;
      for (const x of file.xrefs) {
        if (corpus[x] && !reached.has(x)) {
          reached.add(x);
          grew = true;
        }
      }
    }
  }
  return reached;
}

/** True if `item` is reachable in the current graph (seed + xref closure). */
export function isReachable(item: string): boolean {
  return reachableFiles().has(item);
}

/** Replace the corpus in place (the store is a module singleton). Call once at load. */
export function loadCorpus(data: Corpus): void {
  for (const key of Object.keys(corpus)) delete corpus[key];
  Object.assign(corpus, data);
  quippyTouched.clear(); // a fresh corpus is a fresh run — no inherited taint
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

// ── Concept cross-mentions (the grounding graph) ───────────────────────
// Every OTHER anchor across the corpus sharing a given anchor's concept key —
// the co-carriers. Under the v2 reset these are the inference-grounding contributors
// and the propagation targets. Restricted to REACHABLE files: an unreachable carrier
// is not yet evidence (you haven't followed the link to read it). An anchor with no
// concept (local-only) has no co-carriers.

export function crossMentions(ref: string): string[] {
  const anchor = anchorOf(ref);
  if (!anchor.concept) return [];
  const reached = reachableFiles();
  const out: string[] = [];
  for (const file of Object.values(corpus)) {
    if (!reached.has(file.item)) continue; // unreachable carrier is not yet evidence
    for (const a of file.anchors) {
      const other = makeRef(file.item, a.id);
      if (other !== ref && a.concept === anchor.concept) out.push(other);
    }
  }
  return out;
}

// ── Grounding evidence (the deduction surface — v2 reset §1.3) ─────────
// For a slot, the citeable evidence the player reads to recover its word, by depth:
//
//  - TEACHING: the reachable file(s) where the truth word appears IN THE CLEAR
//    (grounding.citeIn). Each is a citation the player follows the link to read.
//  - INFERENCE: the reachable co-carriers of the slot's concept, each contributing
//    partial grounding once the player has solved it — the parallel context the
//    grounding score is assembled from.

/** Strip `⟦tokens⟧` and `[[wikilinks]]`, collapse whitespace — body as plain prose. */
function plainBody(body: string): string {
  return body
    .replace(/⟦[^⟧]+⟧/g, ' ')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Does `body` hold `word` as plain prose (outside any `⟦anchor⟧` redaction bar)?
 * Mirrors validate-corpus.ts `bodyContainsWord` exactly, so "citeable at build" ==
 * "citeable at play" — the teaching gate accepts precisely what the build verified.
 */
export function bodyContainsWord(body: string, word: string): boolean {
  return body.replace(/⟦[^⟧]+⟧/g, ' ').toLowerCase().includes(word.toLowerCase());
}

/** The sentence in `plain` prose containing `word`, for display as the cited quote. */
function sentenceWith(plain: string, word: string): string | undefined {
  const idx = plain.toLowerCase().indexOf(word.toLowerCase());
  if (idx < 0) return undefined;
  let start = 0;
  for (let i = idx; i >= 0; i--) {
    if ('.?!'.includes(plain[i]) && i < idx) { start = i + 1; break; }
  }
  let end = plain.length;
  for (let i = idx + word.length; i < plain.length; i++) {
    if ('.?!'.includes(plain[i])) { end = i + 1; break; }
  }
  return plain.slice(start, end).trim();
}

/** One piece of citeable grounding for a slot. */
export interface GroundingClue {
  /** the file id the player cites */
  item: string;
  /** the sentence in that file holding the word / the co-carrier reading */
  sentence: string;
  /** does this citation, alone, support a commit right now? */
  corroborates: boolean;
}

/**
 * The grounding clues for a slot: what the player can cite to recover its word.
 * Teaching → the reachable citeIn files holding the word in the clear. Inference →
 * the reachable co-carriers the player has solved (each contributes to the score).
 * Only reachable, currently-corroborating sources are surfaced as "supports"; the
 * UI tints accordingly. This is the new evidentiary surface (was `conceptClues`).
 */
export function groundingClues(ref: string): GroundingClue[] {
  const anchor = anchorOf(ref);
  const reached = reachableFiles();
  const out: GroundingClue[] = [];

  if (anchor.grounding.kind === 'teaching') {
    for (const target of anchor.grounding.citeIn) {
      const file = corpus[target];
      if (!file || !reached.has(target)) continue;
      const plain = plainBody(file.body);
      const sentence = sentenceWith(plain, anchor.truth) ?? `(${target} holds the word in the clear)`;
      out.push({ item: target, sentence, corroborates: bodyContainsWord(file.body, anchor.truth) });
    }
    return out;
  }

  // inference: each solved reachable co-carrier is a contributing citation
  for (const other of crossMentions(ref)) {
    const { item, anchorId } = splitRef(other);
    const file = corpus[item];
    if (!file) continue;
    const slot = resolveSlot(other);
    const solved = slot.state === 'inserted';
    out.push({
      item,
      sentence: solved ? `${item}#${anchorId} solved: 「${slot.text}」` : `${item}#${anchorId} (not yet solved)`,
      corroborates: solved,
    });
  }
  return out;
}

// ── The citation-cost gate (AMBER's manual unredaction — v2 reset §1.3) ─
//
// AMBER's honest verb under the single-word primitive: to commit a slot's word the
// player CITES where the corpus grounds it. Two depths:
//   TEACHING  — cite a reachable file that holds the word IN THE CLEAR. One such
//               citation grounds it; AMBER commits. The bootstrap (no prior solve,
//               no clearance — clearance is cut, decision D). This is the new
//               non-circular seed that replaces clearance-reveal.
//   INFERENCE — no file states the word; cite reachable co-carriers the player has
//               solved. Each contributes grounding; AMBER commits once the
//               accumulated grounding meets the slot's threshold (decision A: the
//               total is returned so the UI can render a ▮▮▯ meter).
// A good commit calls insert(ref, value, 'amber') (exposure +0); a short/missing one
// is rejected with no write. This GUARDS insert(); Quippy bypasses it entirely by
// calling insert(ref, value, 'quippy') directly.

/**
 * Grounding contributed by one inference citation: 1 per reachable co-carrier the
 * player has independently SOLVED (an `inserted` overlay value). A propagated value
 * never grounds — it's the player's own unconfirmed ripple, not evidence. This is
 * the dial surface: per-citation weight could later vary by author intent; for the
 * prototype every solved co-carrier is worth 1 toward the threshold.
 */
export const GROUNDING_PER_CITE = 1;

export type CommitReason =
  | 'wrong-word'      // value is not the slot's truth word (single-word primitive)
  | 'uncited'         // teaching slot, but no cited file holds the word in the clear
  | 'insufficient'    // inference slot, but cited grounding is below threshold
  | 'ungroundable';   // no reachable grounding exists yet (read/solve more, or it's a content gap)

export interface CommitResult {
  ok: boolean;
  reason?: CommitReason;
  /** the citations that actually grounded the word (for AMBER's accept line) */
  citedBy?: string[];
  /** accumulated grounding vs the slot's threshold (decision A — drives the meter) */
  grounded?: number;
  threshold?: number;
  /** refs the accepted commit propagated to */
  propagatedTo?: string[];
}

/**
 * Does `citationRef` ground the truth word at `ref` right now? Depth-aware:
 *  - TEACHING: `citationRef` is a reachable file id in the slot's `citeIn` whose
 *    body holds the word in the clear. (Here the citation is a FILE id, not an
 *    anchor ref — you cite where the word is written out.)
 *  - INFERENCE: `citationRef` is a reachable co-carrier the player has SOLVED.
 * Either way the evidence must be independently known, never something the player's
 * own propagation pushed there — that's what keeps the gate honest (§7.5).
 */
export function corroborates(citationRef: string, ref: string): boolean {
  const anchor = anchorOf(ref);
  const reached = reachableFiles();

  if (anchor.grounding.kind === 'teaching') {
    if (!anchor.grounding.citeIn.includes(citationRef)) return false; // not a sanctioned source
    const file = corpus[citationRef];
    return !!file && reached.has(citationRef) && bodyContainsWord(file.body, anchor.truth);
  }

  // inference: a solved, reachable co-carrier of the same concept
  if (citationRef === ref) return false;
  if (!crossMentions(ref).includes(citationRef)) return false; // must be a reachable co-carrier
  const o = overlay[citationRef];
  return o?.source === 'inserted'; // a propagated value never grounds
}

/**
 * True if `ref` has no reachable grounding at all yet — a teaching slot whose
 * citeIn files aren't reachable, or an inference slot with no reachable co-carriers.
 * (A genuinely sourceless slot is a CONTENT error the build should catch, not an
 * engine fallback — clearance-reveal is gone, decision D.)
 */
export function isUngroundable(ref: string): boolean {
  const anchor = anchorOf(ref);
  const reached = reachableFiles();
  if (anchor.grounding.kind === 'teaching') {
    return !anchor.grounding.citeIn.some((c) => reached.has(c));
  }
  return crossMentions(ref).length === 0;
}

/**
 * AMBER commit. The honest unredaction verb. Under the single-word primitive the
 * only admissible value is the slot's truth word; the player must GROUND it by
 * citation. Accepts → insert(ref, value, 'amber') (exposure +0) and propagate.
 *
 *  - TEACHING: accept iff ≥1 cited file holds the word in the clear (a reachable
 *    citeIn source). Otherwise 'uncited'.
 *  - INFERENCE: accumulate GROUNDING_PER_CITE over each grounding citation; accept
 *    iff the total meets the slot's threshold. Otherwise 'insufficient' (with the
 *    running total returned for the meter).
 */
export function commitWithCitations(
  ref: string,
  value: string,
  citations: string[],
  canPropagateTo?: (item: string) => boolean,
): CommitResult {
  const anchor = anchorOf(ref);
  // Single-word primitive: the only correct value is the truth word.
  if (value !== anchor.truth) return { ok: false, reason: 'wrong-word' };

  if (isUngroundable(ref)) return { ok: false, reason: 'ungroundable' };

  const good = citations.filter((c) => corroborates(c, ref));

  if (anchor.grounding.kind === 'teaching') {
    if (good.length === 0) return { ok: false, reason: 'uncited' }; // go follow the link
    const propagatedTo = insert(ref, value, 'amber', canPropagateTo);
    return { ok: true, citedBy: good, propagatedTo };
  }

  // inference: assemble grounding to threshold (decision A — transparent meter)
  const threshold = anchor.grounding.threshold;
  const grounded = good.length * GROUNDING_PER_CITE;
  if (grounded < threshold) return { ok: false, reason: 'insufficient', grounded, threshold, citedBy: good };
  const propagatedTo = insert(ref, value, 'amber', canPropagateTo);
  return { ok: true, citedBy: good, grounded, threshold, propagatedTo };
}

// ── Display ────────────────────────────────────────────────────────────
// The four-state grammar resolved per slot (v2 reset §2.2): redacted / inserted /
// propagated / contradiction, plus the `via` provenance so the renderer can mark a
// Quippy fill distinctly (the fifth distinction — a Quippy-filled word looks unlike
// an AMBER commit). Clearance-reveal is cut (decision D), so there is no 'revealed'
// state; truth-contradiction is now driven by `contradicts_truth` on the overlay
// entry (a Quippy fill of the wrong word), not by a tier audit. The ORDER of the
// branches IS the state precedence and is load-bearing. Svelte 5 only allows
// `$derived` as a declaration initializer, so the ladder lives in this pure
// `resolveSlot` and reactive callers wrap it (`$derived(resolveSlot(ref))`); the
// reads of `overlay` and the anchor are tracked as if inlined.

export interface DisplayedSlot {
  text: string;
  state: 'redacted' | 'inserted' | 'propagated' | 'truth-contradiction';
  /** the route that filled this slot, so the renderer can mark a Quippy fill. */
  via?: Via;
  guess?: string;
  caused_by?: string;
}

export function resolveSlot(ref: string): DisplayedSlot {
  const o = overlay[ref];
  const anchor = anchorOf(ref);
  if (o && o.contradicts_truth)
    return { text: o.value, state: 'truth-contradiction', via: o.via, guess: anchor.truth };
  if (o?.source === 'propagated') return { text: o.value, state: 'propagated', via: o.via, caused_by: o.caused_by };
  if (o?.source === 'inserted')  return { text: o.value, state: 'inserted', via: o.via };
  return { text: '█████', state: 'redacted' };
}

// ── Propagation (§4 — v2 reset) ────────────────────────────────────────
// Under the single-word primitive, propagation copies the solved WORD to every
// co-carrier of its concept that holds the SAME word — a fact stated once need not
// be re-entered by hand everywhere it recurs (SCP-41B-002's "honest threading").
// A co-carrier whose truth is a DIFFERENT word is a narrative-thread sibling, not
// the same fact, and is never written by propagation — so a ripple can never land a
// wrong value (the old index-aligned mutation mapping is gone with `mutations[]`).

/** Factor applied to a propagated carrier's exposure weight (§4 step 4). */
export const PROPAGATION_FACTOR = 1;

/**
 * The word a source slot propagates: its overlay value. A co-carrier receives it
 * only if its own truth IS that word (checked at the call site) — propagation
 * carries a confirmed word to where the same word belongs, never a guess.
 */
function propagatedWord(sourceRef: string): string {
  return overlay[sourceRef]?.value ?? '';
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
  // Single-word primitive: the only value that may enter the overlay for a slot is
  // its truth word (CLAUDE.md invariant 3 — bounded, never free text; the set is now
  // the single truth). A wrong word reaches insert() only via Quippy (which fills the
  // wrong/escalatory word by design, reset §1.5/§F) — flagged contradicts_truth so the
  // renderer marks it, but still written, since the player must be able to see it. An
  // AMBER commit never reaches here with a wrong word (the gate rejects it first).
  const anchor = anchorOf(ref);
  const wrong = value !== anchor.truth;

  if (alreadyInserted(ref, value, via)) return []; // idempotent re-insert: no recompute, no new ripples

  // 1. Write the inserted value, stamped with its route; mark a wrong fill. A Quippy
  //    fill ALSO marks the ref permanently tainted (user decision: no redemption — the
  //    true win requires the slot was NEVER Quippy-touched, even if later AMBER-cited).
  overlay[ref] = { anchor_ref: ref, value, source: 'inserted', via, ...(wrong ? { contradicts_truth: true } : {}) };
  if (via === 'quippy') quippyTouched.add(ref);

  // 2. Propagate the WORD to every co-carrier of this concept whose own truth IS
  //    that word — a confirmed fact threaded to where it recurs. We never overwrite
  //    a slot the player has independently *inserted* (it's its own source of truth,
  //    not a sink), and never write a co-carrier whose truth differs (a sibling-thread
  //    carrier, not the same fact) — so a ripple can only ever carry a right word to a
  //    right place. A wrong (Quippy) value propagates to nothing, since no co-carrier's
  //    truth equals it. Returns the refs propagated to, for the UI's ripple log.
  const propagatedTo: string[] = [];
  if (anchor.concept && !wrong) {
    const word = propagatedWord(ref);
    for (const targetRef of crossMentions(ref)) {
      if (overlay[targetRef]?.source === 'inserted') continue; // player-owned: never clobber
      if (canPropagateTo && !canPropagateTo(splitRef(targetRef).item)) continue; // not yet unlocked
      if (anchorOf(targetRef).truth !== word) continue; // different fact: never propagate a word it doesn't hold
      overlay[targetRef] = {
        anchor_ref: targetRef,
        value: word,
        source: 'propagated',
        via, // a ripple inherits its cause's route (R§6.3; watch item 2)
        caused_by: ref,
      };
      if (via === 'quippy') quippyTouched.add(targetRef); // a Quippy ripple taints permanently too
      propagatedTo.push(targetRef);
    }
  }

  // 3. Exposure is the sum of every live edit's weight, recomputed from the
  //    overlay — never incrementally accumulated. This is the §4 no-drift
  //    guarantee made structural: re-inserting or changing a value can only
  //    move exposure to whatever the current overlay implies, never ratchet it.
  recomputeExposure();
  // 4. Fire/clear breaches against the new exposure (Quippy reliance can push the
  //    board into a breached state; an AMBER re-solve dropping exposure clears it).
  evaluateBreaches();

  return propagatedTo;
}

// ── Batched validation (C7, §5) ────────────────────────────────────────
// Raising clearance unlocks ground-truth in BATCHES keyed to the tier — never
// one slot at a time, never per-guess. This is the rule-of-three anti-brute-
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
  confirmed: number;       // inserted slots reading the correct word (a coherent read)
  struck: number;          // inserted slots reading the WRONG word (a Quippy mistake)
  hasInserted: boolean;
  // Provenance counts across ALL live overlay entries (inserted + propagated), so
  // a single Quippy edit rippling to N carriers counts as N Quippy-tainted slots
  // (watch item 2). The no-Quippy ending reads viaQuippy === 0.
  viaAmber: number;        // overlay entries routed through AMBER (the honest tool)
  viaQuippy: number;       // overlay entries routed through Quippy (the costly tool)
}

export function boardState(): BoardState {
  let totalSlots = 0;
  let filled = 0;
  let propagated = 0;
  let confirmed = 0;
  let struck = 0;
  let viaAmber = 0;
  let viaQuippy = 0;
  for (const file of Object.values(corpus)) {
    for (const a of file.anchors) {
      totalSlots++;
      const ref = makeRef(file.item, a.id);
      const o = overlay[ref];
      // Correctness is known directly under the single-word primitive: an inserted
      // value either equals the truth word or it doesn't. No clearance audit needed —
      // the engine holds truth immutably; it just never SHOWS it unless solved.
      if (o?.source === 'inserted') {
        filled++;
        if (o.value === a.truth) confirmed++;
        else struck++;
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
    confirmed,
    struck,
    hasInserted: filled > 0,
    viaAmber,
    viaQuippy,
  };
}

// ── Breach line (exposure consequence; drivers re-aimed to Quippy) ──────────
// Exposure (now driven ONLY by Quippy reliance, R§6.4) still has a consequence:
// cross the line and an entity breaches, mutating terminal behaviour (and forcing
// Quippy's post-breach band). A perfect no-Quippy run never approaches it — the
// breach line is reached only by leaning on Quippy. Tuned against the trio
// (total possible Quippy exposure ~15): a few escalating Quippy assists reach it.
/** Exposure at or above this and an entity re-indexes out of containment — breach. */
export const BREACH_THRESHOLD = 10;

/**
 * Fire any breach whose threshold the current exposure now meets. Wired into the
 * insert path so Quippy reliance can actually push the board into a breached
 * state (which the no-Quippy ending and Quippy's post-breach band read). Breach
 * EFFECTS (terminal-mutating) are applied by the presentation layer reading the
 * `breaches` set; this only records that a breach has occurred. Recovery is
 * first-class: drop exposure back under the line and the breach can clear.
 */
export function evaluateBreaches(): void {
  for (const item of Object.keys(corpus)) {
    if (exposure.value >= BREACH_THRESHOLD) {
      if (!breaches.has(item)) breaches.add(item);
    } else if (breaches.has(item)) {
      breaches.delete(item); // recovery — exposure fell back under the line
    }
  }
}

// ── The ending — the loop breaks (no-Quippy completion) ─────────────────────
// design_document.md §6, scp_x_bible.md §5. The win INVERTS from the old model:
// the true ending is the corpus fully restored to truth AND every solved slot via
// AMBER — zero Quippy assists, no surviving contradictions. Read from provenance
// (the `via` field) across all solved slots, not a counter. Every other outcome is
// a breach ending (recovery-first; breaches are board state).
//
// ENFORCEMENT (watch item, scp_x_bible.md §5.3): the HARD GATE — ANY Quippy assist
// forecloses the true ending. Started hard for design clarity (the no-Quippy run
// is a clean mastery expression); relax to a tolerance band only if playtest shows
// it inhumane. Watch item 1, decided: an AMBER re-solve REDEEMS a Quippy-tainted
// slot (the entry re-stamps via=amber), so a tainted run is recoverable by honest
// re-work — the hard gate is humane because redemption exists, not because the gate
// is soft.

export type EndOutcome = 'playing' | 'loop-broken' | 'breach';

export interface EndState {
  outcome: EndOutcome;
  /** total slots in the restoration target (corpus minus the excluded self-file) */
  total: number;
  /** slots reading their truth word via an insert (the win numerator) */
  restored: number;
  /** slots whose inserted value is the wrong word (a Quippy mistake; must be re-solved) */
  contradictions: number;
  /** slots still showing redacted (un-restored) */
  redacted: number;
  /** Quippy-routed entries across the board (the hard-gate disqualifier) */
  quippyAssists: number;
  /** true once an entity has breached (board state) */
  breached: boolean;
}

/**
 * Read the ending from board state + the PERMANENT Quippy-taint record. A slot counts
 * as RESTORED iff it currently reads its truth word (an overlay value equal to truth).
 * Clearance is cut (decision D), so there is no reveal gate on the win: a slot is
 * restored the moment it holds the right word.
 *
 * The no-Quippy gate reads `quippyTouched` (every ref EVER Quippy-filled or -rippled),
 * NOT live `via` — so AMBER-re-citing a Quippy-touched slot does NOT clear it (user
 * decision 2026-06-17: no redemption; the help already happened). `quippyAssists` is
 * therefore the size of the permanent taint set, monotonic over the run.
 *
 * - loop-broken (true): every target slot restored, no contradictions, and ZERO slots
 *   ever Quippy-touched. The record reconstructed entirely by hand, start to finish.
 * - breach: an entity has breached.
 * - playing: otherwise (work remains). A once-tainted run can no longer reach
 *   loop-broken, but is not itself a loss until a breach — it just can't be the TRUE win.
 */
export function endState(): EndState {
  let total = 0;
  let restored = 0;
  let contradictions = 0;
  let redacted = 0;
  // Permanent taint: any slot ever touched by Quippy, regardless of later AMBER work.
  const quippyAssists = quippyTouched.size;

  for (const file of Object.values(corpus)) {
    // The self-file (Quippy) is the entity you STARVE, not the puzzle you solve
    // (scp_x_bible.md §5.4): you win by reconstructing everything ELSE by hand, at
    // which point Quippy, having gotten no assists, cannot complete itself. So its
    // anchors are excluded from the restoration target.
    const isSelf = file.entity_self;
    for (const a of file.anchors) {
      const ref = makeRef(file.item, a.id);
      const o = overlay[ref];
      if (isSelf) continue; // excluded from the restoration numerator/denominator

      total++;
      if (o && o.value === a.truth) {
        restored++;
      } else if (o && o.value !== a.truth) {
        contradictions++; // a wrong word sitting in the slot (Quippy fill)
      } else {
        redacted++; // untouched
      }
    }
  }

  const breached = breaches.size > 0;
  // total > 0 guards the degenerate empty-target case (a corpus that is only the
  // excluded self-file is not a win the instant it loads).
  const complete = total > 0 && restored === total && contradictions === 0;

  let outcome: EndOutcome = 'playing';
  if (complete && quippyAssists === 0) {
    outcome = 'loop-broken'; // the true ending: full restoration, never a Quippy touch
  } else if (breached) {
    outcome = 'breach'; // an entity completed its re-shelving
  }
  // A once-tainted record (quippyAssists > 0) can never reach loop-broken — there is
  // no redemption. It stays 'playing' until/unless a breach; the true win is foreclosed.

  return { outcome, total, restored, contradictions, redacted, quippyAssists, breached };
}

/**
 * Multiplier on a slot's exposure when a Quippy fill is the WRONG word. A wrong fill
 * is a value diverging from contained reality — the corruption that drives the breach
 * in the fiction — so a wrong Quippy fill costs more than a right one. Under the
 * single-word primitive wrongness is known immediately (no clearance audit), so the
 * penalty applies as soon as the wrong word is filled.
 */
export const STRUCK_PENALTY = 2.5;

export function recomputeExposure(): void {
  let total = 0;
  for (const [ref, entry] of Object.entries(overlay)) {
    // Exposure re-aimed (R§6.4, the design's keystone — design_document.md §3):
    // ONLY Quippy reliance spends. An AMBER edit (the honest cited commit, or a
    // ripple inheriting an AMBER cause) costs zero, full stop. A perfect no-Quippy
    // run never breaches; the exposure curve is a pure measure of Quippy reliance.
    // NEVER make an `'amber'` edit cost exposure: that collapses the two routes back
    // into one and breaks the design. (`via` defaults to 'amber' when unset.)
    if (entry.via !== 'quippy') continue;
    const anchor = anchorOf(ref);
    let weight = entry.source === 'propagated' ? anchor.exposure_weight * PROPAGATION_FACTOR : anchor.exposure_weight;
    // A wrong Quippy fill weighs more — the divergence from truth is the corruption.
    if (entry.value !== anchor.truth) {
      weight *= STRUCK_PENALTY;
    }
    total += weight;
  }
  exposure.value = total;
}
